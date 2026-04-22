---
{"dg-publish":true,"permalink":"/01-dev-stack/02/05-spring/02-boot/03-jwt/jwt/","dg-note-properties":{"작성일":"2026-02-05T01:55","수정일":"2026-02-05T10:27"}}
---

# 🔎 JWT 인증 시스템 : 로그인, 웹소켓

## 🏗️ 1막: 로그인 (Authentication) - 신뢰의 시작
사용자가 아이디와 비밀번호를 입력하고 **[로그인]** 버튼을 누르는 그 찰나의 순간, 내부에서는 엄청난 일들이 벌어집니다.
### 1-1. [React] 사용자의 행동과 API 요청 발사
사용자가 `LoginPage`에서 폼을 제출하면, `AuthContext`에 정의된 `login` 함수가 호출됩니다.
- **코드 위치:** `AuthContext.js` (제공된 파일)
- **동작 원리:**
    1. `credentials`(아이디/비번 객체)를 받습니다.
    2. `authApi.login`을 호출하여 백엔드로 HTTP `POST` 요청을 보냅니다.
    3. 이때 데이터는 JSON 형태로 직렬화되어 네트워크를 타고 날아갑니다.
```javascript
// AuthContext.js 내부
const login = useCallback(async (credentials) => {
    try {
        // 1. 백엔드(/member/login)로 요청 발송
        const data = await authApi.login(credentials); 

        // 2. 백엔드가 정상적으로 토큰을 줬는지 확인
        if (data.token) {
            // ... (저장 로직은 1-3에서 설명) ...
            return { success: true, data };
        }
        // ... 실패 처리 ...
    } catch (error) { ... }
}, []);
```
### 1-2. [Spring Boot] 검증과 토큰 발행 (여권 발급)
요청이 서버의 `/member/login` 엔드포인트에 도착합니다. `SecurityConfig`에서 이 경로는 `permitAll()`로 설정되어 있어, 필터 검사를 받지 않고 컨트롤러로 직행합니다.
- **서버 내부 동작 (Controller & Service):**
    1. DB에서 `userId`로 회원을 찾습니다.
    2. `PasswordEncoder.matches()`로 비밀번호가 일치하는지 확인합니다.
    3. **핵심:** 인증에 성공하면 `JwtUtil`을 사용해 토큰을 찍어냅니다.
- **토큰 생성 코드 (JwtUtil):**
    - `Jwts.builder()`가 작동합니다.
    - **Payload(내용물):** `setSubject(userId)`를 통해 "이 토큰의 주인은 누구인가"를 기록합니다.
    - **Expiration(만료일):** `new Date(now.getTime() + expiration)`으로 토큰의 수명을 설정합니다.
    - **Signature(서명):** `signWith(getSignKey())`를 통해 서버만 아는 `secret` 키로 도장을 쾅 찍습니다. 이 서명 때문에 해커가 토큰 내용을 조작하면 즉시 들통납니다.
```java
// JwtUtil.java
public String generateToken(String userId) {
    // ... 시간 설정 ...
    return Jwts.builder()
               .setSubject(userId) // "누구의 토큰인가?"
               .setIssuedAt(now)   // "언제 만들었나?"
               .setExpiration(expiryDate) // "언제까지 유효한가?"
               .signWith(getSignKey()) // "서버의 비밀키로 암호화 서명"
               .compact(); // 최종적으로 eyJhbG... 형태의 문자열 생성
}
```
### 1-3. [React] 응답 수신 및 금고 저장 (Storage)
서버가 `200 OK`와 함께 `{ token: "eyJ...", user: {...} }`를 응답합니다. 이제 React는 이 귀중한 정보를 **브라우저의 금고(Local Storage)**에 보관합니다.
- **코드 위치:** `AuthContext.js`
- **저장 프로세스:**
    - `localStorage.setItem("token", data.token)`: 토큰을 문자열 그대로 저장.
    - `localStorage.setItem("user", JSON.stringify(...))`: 사용자 객체는 문자열로 변환하여 저장.
    - `setUser(...)` & `setIsAuthenticated(true)`: **React 앱의 전역 상태를 업데이트합니다.** 이 순간, 화면이 '로그인 전' UI에서 '로그인 후' UI로 바뀝니다.
---
## 🛡️ 2막: 인가 (Authorization) - 검문소 통과
로그인 후 사용자가 "내 정보 수정"이나 "게시글 쓰기" 버튼을 누릅니다. 이제부터는 **모든 요청마다 여권(토큰) 검사**가 이루어집니다.
### 2-1. [React] Axios 인터셉터: 여권 보여주기
개발자가 매번 API 요청 코드에 토큰을 넣을 필요가 없습니다. `axios.js`에 설정된 **Request Interceptor**가 자동으로 처리해줍니다.
- **코드 위치:** `axios.js`
- **동작 원리:**
    1. 요청이 나가기 직전(가로채기), `localStorage`에서 `token`을 꺼냅니다.
    2. 토큰이 있다면 헤더의 `Authorization` 필드에 `Bearer {토큰}` 형태로 붙여넣습니다.
    - _Q: 왜 Bearer인가요?_
    - _A: "이 토큰을 가진 사람(Bearer)에게 권한을 부여하라"는 표준 규약입니다._
```javascript
// axios.js
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token){
        // 헤더에 여권 부착 완료!
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```
### 2-2. [Spring Boot] JwtAuthenticationFilter: 입국 심사대
요청이 스프링 서버에 도착하면, 컨트롤러에 가기 전에 **Filter Chain**이라는 관문을 통과해야 합니다. 여기서 `JwtAuthenticationFilter`가 활약합니다.
- **코드 위치:** `JwtAuthenticationFilter.java`
- **상세 검증 프로세스 (`doFilterInternal` 메서드):**
    1. **헤더 추출:** `request.getHeader("Authorization")`으로 헤더를 봅니다.
    2. **접두사 확인:** `Bearer` 로 시작하는지 확인하고, 실제 토큰 값만 잘라냅니다 (`substring(7)`).
    3. **유효성 검증 (`jwtUtil.validateToken`):**
        - 서버의 비밀키로 서명을 풀어봅니다. 풀리면 "위조되지 않음"이 증명됩니다.
        - 만료 시간(`exp`)을 확인합니다. 현재 시간보다 전이라면 "만료됨"으로 판단합니다.
    4. **사용자 식별:** 토큰이 유효하다면 `jwtUtil.getUserIdFromToken(token)`을 통해 페이로드에 들어있던 `userId`를 꺼냅니다.
    5. **인증 객체 생성 (가장 중요!):**
        - DB에서 `userId`로 `UserDetails`를 로딩합니다.
        - `UsernamePasswordAuthenticationToken`이라는 **'스프링 내부용 신분증'**을 만듭니다.
        - `SecurityContextHolder.getContext().setAuthentication(authToken)`: **이 요청이 끝날 때까지 "이 사람은 인증된 사용자입니다"라고 스프링에게 알립니다.**
```java
// JwtAuthenticationFilter.java 핵심 요약
if (jwtUtil.validateToken(token)) { // 1. 토큰이 진짜인가?
    // 2. 진짜라면 스프링 내부 신분증 발급
    UsernamePasswordAuthenticationToken authToken = ...;
    // 3. 보안 컨텍스트에 등록 (이제 컨트롤러에서 @AuthenticationPrincipal 사용 가능)
    SecurityContextHolder.getContext().setAuthentication(authToken);
}
```
---
## 🔁 3막: 상태 유지 (Persistence) - 새로고침의 마법
웹 브라우저는 새로고침(F5)을 하면 React 앱을 메모리에서 지우고 새로 시작합니다. 이때 로그인이 풀리면 안 되겠죠?
### 3-1. [React] 앱 초기화와 AuthProvider
앱이 다시 로드될 때 `AuthProvider` 컴포넌트가 가장 먼저 실행됩니다.
- **코드 위치:** `AuthContext.js`
- **복구 메커니즘 (`useEffect`):**
    1. `isLoading` 상태를 `true`로 시작합니다.
    2. `localStorage`를 뒤져서 `token`과 `user` 정보가 살아있는지 봅니다.
    3. 정보가 있다면 다시 `setUser`와 `setIsAuthenticated(true)`를 호출해 메모리 상태를 복구합니다.
    4. 만약 `JSON.parse`가 실패하거나 정보가 없으면, 보안을 위해 `removeItem`으로 찌꺼기를 치웁니다.
    5. 모든 작업이 끝나면 `setIsLoading(false)`로 바꿉니다.
### 3-2. [React] PrivateRoute의 대기
`PrivateRoute` 컴포넌트는 `isLoading`이 `true`인 동안에는 화면을 보여주지 않고 "로딩 중..."을 띄웁니다.
- **코드 위치:** `PrivateRoute.md`
- **이유:** 인증 확인도 안 끝났는데 로그인 페이지로 튕겨버리는 것을 막기 위함입니다. `isLoading`이 `false`가 되고, `isAuthenticated`가 `true`로 확정되면 그때 자식 컴포넌트(페이지)를 보여줍니다.
---
## 📡 4막: 웹소켓 (WebSocket) - 실시간 통신의 특별한 인증
웹소켓은 HTTP와 달리 한 번 연결되면 연결이 끊길 때까지 통로가 열려 있습니다. 그래서 **"최초 연결 시점"**의 인증이 무엇보다 중요합니다.
### 4-1. 언제 인증하는가? (Handshake)
웹소켓 연결은 HTTP 요청(`Upgrade: websocket`)으로 시작됩니다.
- **문제점:** 표준 WebSocket API는 HTTP 헤더(`Authorization`)를 마음대로 수정하기 어렵습니다.
- **해결책:** 보통 **STOMP 프로토콜**을 사용하여 `CONNECT` 프레임 헤더에 토큰을 넣거나, 최초 연결 URL의 **Query Parameter**로 토큰을 보냅니다.
### 4-2. 상세 흐름 (Client Side)
React에서 STOMP를 이용해 연결을 시도할 때의 예시입니다.
```javascript
// React (예시 코드)
const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    const client = new StompJs.Client({
        brokerURL: 'ws://localhost:8080/ws',
        connectHeaders: {
            // STOMP CONNECT 프레임에 헤더 추가
            Authorization: `Bearer ${token}`,
        },
        // ...
    });
    client.activate();
};
```
### 4-3. 상세 흐름 (Server Side) - ChannelInterceptor
스프링 시큐리티의 일반 필터(`JwtAuthenticationFilter`)는 HTTP 요청만 막습니다. 웹소켓 메시지는 **`ChannelInterceptor`**를 통해 별도로 검사해야 합니다.
- **동작 시점:** 클라이언트가 `CONNECT` 메시지를 보내면, 메시지가 브로커에 도달하기 전에 `preSend` 메서드가 가로챕니다.
```java
// Spring Boot (WebSocketConfig 내 ChannelInterceptor 예시)
@Override
public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

    // 1. 연결 요청(CONNECT)인지 확인
    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
        // 2. 헤더에서 토큰 추출
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        String token = authHeader.substring(7);

        // 3. 토큰 검증 (JwtUtil 재사용)
        if (!jwtUtil.validateToken(token)) {
            throw new IllegalArgumentException("유효하지 않은 웹소켓 토큰입니다.");
        }
        
        // 4. 인증 정보 컨텍스트에 심기 (선택사항, 채팅 등에서 유저 구분용)
        // SecurityContextHolder...
    }
    return message;
}
```
- **검증 빈도:**
    - **최초 연결 시:** 필수적으로 검증합니다. 실패하면 연결을 끊습니다.
    - **메시지 전송 시:** 매 메시지마다 검증할 수도 있지만, 보통은 연결 시점에만 강력하게 검증하고 이후에는 연결된 세션을 신뢰하는 방식을 많이 사용합니다.
---
## 🚨 5막: 예외 상황과 로그아웃
### 5-1. 토큰 만료 (401 Unauthorized)
사용자가 API를 호출했는데 토큰 수명이 다했습니다.
1. **Server:** `JwtAuthenticationFilter`에서 `validateToken`이 `false`를 반환하거나 예외를 던집니다. 서버는 `401` 상태 코드를 응답합니다.
2. **Client:** `axios.js`의 **Response Interceptor**가 에러를 잡습니다.
    - `case 401:` 구문이 실행됩니다.
    - `localStorage.removeItem('token')`: 만료된 토큰 삭제.
    - `window.location.href = '/login'`: 강제 로그아웃 처리.
### 5-2. 로그아웃 (Logout)
사용자가 [로그아웃] 버튼을 누릅니다.
- **코드 위치:** `AuthContext.js`
- **과정:**
    1. `authApi.logout()` 호출: 서버에 "나 나간다"고 알립니다. (Refresh Token을 쓴다면 이때 DB의 Refresh Token을 지워야 합니다.)
    2. **클라이언트 정리 (Finally 블록):** API 성공 여부와 관계없이 브라우저의 `token`, `user` 정보를 무조건 삭제하고 상태를 초기화합니다.
---
이 설명이 현재 구축하신 시스템의 "혈관"을 이해하는 데 도움이 되셨나요?
아주 견고하게 잘 짜인 구조이니, 이 흐름을 머릿속에 그리며 개발하시면 훨씬 수월하실 거예요! 추가로 궁금한 점이 있다면 언제든 물어봐 주세요.