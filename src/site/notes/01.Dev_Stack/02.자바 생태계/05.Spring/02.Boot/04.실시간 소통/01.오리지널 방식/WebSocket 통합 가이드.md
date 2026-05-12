---
dg-publish: true
작성일: 2026-02-23T00:48
수정일: 2026-02-24T22:28
---
# Spring WebSocket & React JWT 통합 인증 아키텍처
> [!summary] 핵심 요약
> 
> **JWT(JSON Web Token)**를 활용하여 세션 없이 보안이 강화된 ==Full-Stack 양방향 통신== 환경 구축.
> 
> 브라우저 제약으로 인해 핸드셰이크 시 쿼리 파라미터로 토큰을 전달하며, 서버 인터셉터에서 이를 검증하여 세션 속성으로 바인딩.
> 
> Vite 프록시 설정부터 React 클라이언트의 생명주기 제어 및 Spring Boot의 메시지 핸들링까지 포함하는 통합 가이드.
## 1. 클라이언트 환경 설정 (Vite & .env)
- **환경 변수 정의 (`.env`)**
    - `VITE_` 접두사를 사용하여 클라이언트 전역에서 접근 가능한 웹소켓 베이스 URL 관리.
- **Vite 개발 서버 프록시 설정 (`vite.config.js`)**
    - `ws: true` 옵션을 통한 웹소켓 프로토콜 업그레이드 및 포워딩 활성화.
    - CORS 이슈 방지를 위한 `changeOrigin` 및 경로 재작성(Rewrite) 처리.
```javascript
// .env
VITE_WS_URL=ws://localhost:8080/chat

// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/chat': {
                target: 'ws://localhost:8080',
                ws: true,
                changeOrigin: true
            }
        }
    }
});
```
## 2. React 웹소켓 연결 로직 (JWT 바인딩)
- **쿼리 파라미터를 통한 토큰 전달**
    - WebSocket 표준 API의 헤더 설정 제약을 우회하기 위해 URL 쿼리 스트링에 JWT 포함.
- **컴포넌트 생명주기 기반 연결 관리**
    - `useEffect` 내에서 토큰 존재 여부 확인 후 연결을 시도하며, 언마운트 시 `close()` 호출로 리소스 정리.
    - `useRef`를 사용하여 리렌더링과 관계없이 웹소켓 객체 인스턴스 유지.
```javascript
import React, { useEffect, useRef, useState } from 'react';

const ChatApp = () => {
    const socket = useRef(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        // 1. 엔드포인트에 JWT 토큰을 쿼리 파라미터로 추가
        const wsUrl = `${import.meta.env.VITE_WS_URL}?token=${token}`;
        socket.current = new WebSocket(wsUrl);

        socket.current.onopen = () => console.log("연결 성공");
        socket.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMessages((prev) => [...prev, data]);
        };
        
        return () => socket.current?.close();
    }, []);

    const send = (msg) => {
        const payload = { type: "CHAT", message: msg };
        socket.current.send(JSON.stringify(payload));
    };

    return (/* UI 생략 */);
};

//==========.env 파일 예시===========//
VITE_WS_URL=ws://localhost:5173/chat
//=================================//
```
## 3. 서버 측 인증 인터셉터 (HandshakeInterceptor)
- **토큰 추출 및 유효성 검증**
    - `beforeHandshake` 단계에서 `ServletServerHttpRequest`를 통해 쿼리 파라미터(`token`) 추출.
    - `JwtProvider`를 통한 서명 검증 및 만료 여부 확인 후 실패 시 핸드셰이크 거부.
- **인증 정보 전달**
    - 검증된 사용자 식별자(ID)를 WebSocket 세션의 `attributes` 맵에 저장하여 핸들러로 인계.
```java
@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {
    private final JwtProvider jwtProvider;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            String token = servletRequest.getServletRequest().getParameter("token");

            if (token != null && jwtProvider.validateToken(token)) {
                String userId = jwtProvider.getUserIdFromToken(token);
                // 핸들러에서 사용할 수 있도록 속성 주입
                attributes.put("userId", userId); 
                return true;
            }
        }
        return false; // 인증 실패 시 웹소켓 연결 차단
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, 
                               WebSocketHandler wsHandler, Exception ex) {}
}
```
## 4. 웹소켓 설정 및 핸들러 (Spring Config)
- **인터셉터 매핑 및 엔드포인트 등록**
    - `WebSocketConfigurer`를 구현하여 커스텀 핸들러와 JWT 인터셉터 결합.
- **실시간 메시지 라우팅**
    - `TextWebSocketHandler`에서 `attributes`에 담긴 `userId`를 기준으로 세션 관리 및 브로드캐스팅.
```java
//========== Configuration
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {
    private final ChatHandler chatHandler;
    private final JwtHandshakeInterceptor jwtInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatHandler, "/chat")
                .addInterceptors(jwtInterceptor)
                .setAllowedOrigins("*");
    }
}

//=========== Handler
@Component
public class ChatHandler extends TextWebSocketHandler {
    // 세션 저장소 (사용자ID : 세션객체)
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    // 1. 연결 성공 시 (입장)
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String userId = (String) session.getAttributes().get("userId");
        if (userId != null) {
            sessions.put(userId, session);
            System.out.println(userId + "님이 입장하셨습니다.");
        }
    }

    // 2. 메시지 수신 및 발송 (통신 중)
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload(); // 클라이언트가 보낸 JSON 문자열
        String senderId = (String) session.getAttributes().get("userId");

        System.out.println(senderId + "로부터 받은 메시지: " + payload);

        // 접속 중인 모든 사람에게 메시지 전송 (Broadcasting)
        for (WebSocketSession s : sessions.values()) {
            // (선택) 나에게는 다시 보낼 필요가 없다면 제외
            if (s.isOpen() && !s.getId().equals(session.getId())) {
                s.sendMessage(new TextMessage(senderId + ": " + payload));
            }
        }
    }

    // 3. 연결 종료 시 (퇴장) - 매우 중요!
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = (String) session.getAttributes().get("userId");
        if (userId != null) {
            sessions.remove(userId); // 메모리 누수 방지: 명단에서 삭제
            System.out.println(userId + "님이 퇴장하셨습니다.");
        }
    }
}
```
---
