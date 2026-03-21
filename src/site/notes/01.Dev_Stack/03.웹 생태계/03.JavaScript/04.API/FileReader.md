---
{"dg-publish":true,"permalink":"/01-dev-stack/03/03-java-script/04-api/file-reader/"}
---

# React useRef 및 FileReader 핵심 요약 노트

>[!summary]
리액트의 **가상 DOM 제약 극복(useRef)** 및 브라우저 **로컬 파일 독취(FileReader)**를 통한 실무 기능 구현 전략. 렌더링 성능 최적화와 외부 라이브러리 제어권 위임이 핵심임.

---

## 1. useRef: 리액트의 비밀 통로

### 1.1 핵심 정의 및 성격

> **참조 객체(Reference):** 리렌더링을 유발하지 않으면서 컴포넌트 생명주기 전체 동안 유지되는 자바스크립트 객체. `{ current: 초기값 }` 형태.

### 1.2 주요 활용 패턴

| 구분 | 상세 활용 사례 | 핵심 메서드 및 속성 |
| --- | --- | --- |
| **DOM 제어** | 입력창 포커스, 스크롤 이동, 요소 크기 측정 | `ref.current.focus()`, `scrollIntoView()` |
| **변수 보존** | 타이머 식별자, 최초 마운트 플래그, 이전 상태값 저장 | `ref.current = timerId`, `ref.current = state` |
| **라이브러리 연동** | Chart.js, Google Maps 등 실제 노드 주소 전달 | `new Library(ref.current)` |

### 1.3 작동 원리 (왜 가리키는가?)

1. **연결 예약:** JSX의 `ref={mapRef}` 속성 지정.
2. **주소 주입:** 리액트 엔진이 실제 DOM 생성(Commit 단계) 직후, 해당 노드의 메모리 주소를 `current`에 자동 할당.
3. **접근 보장:** `useEffect` 실행 시점에는 할당 완료 상태.

---

## 2. FileReader: 브라우저 내장 파일 처리기

### 2.1 기술적 정체

* **표준 웹 API:** 별도 설치 없는 브라우저 기본 내장 객체.
* **비동기 메커니즘:** 대용량 파일 처리 시에도 브라우저 멈춤 없는 백그라운드 작동.

### 2.2 핵심 기능 및 메서드

* **readAsDataURL:** 파일을 **Base64 문자열**로 변환. (이미지 미리보기 `src`용)
* **readAsText:** 텍스트 파일 내용을 문자열로 추출.
* **onload 이벤트:** 파일 읽기 성공 시점의 후속 작업(상태 업데이트 등) 정의.

---

## 3. 실전 통합 예시 (Example)

```jsx
import { useRef, useState, useEffect } from "react";

const IntegratedComponent = () => {
  const inputRef = useRef(null);   // 텍스트 입력용
  const fileRef = useRef(null);    // 파일 입력용
  const mapRef = useRef(null);     // 외부 지도 연동용
  const [preview, setPreview] = useState("");

  // 외부 라이브러리 연동 시뮬레이션
  useEffect(() => {
    if (mapRef.current) {
      // 실제 노드 주소(mapRef.current)를 외부 도구에 전달
      console.log("지도 라이브러리 연결 완료:", mapRef.current);
    }
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader(); // API 인스턴스 생성
      reader.onload = () => setPreview(reader.result); // 완료 시 상태 저장
      reader.readAsDataURL(file); // 데이터 변환 개시
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* DOM 직접 제어 영역 */}
      <input ref={inputRef} placeholder="이름 입력" />
      <button onClick={() => inputRef.current.focus()}>포커스</button>
      
	      {/* 외부 라이브러리 점유 영역 */}
	      <div ref={mapRef} style={{ height: "100px", background: "#ddd" }}>지도 영역
	      </div>
	      
      {/* 파일 처리 영역 */}
      <input type="file" ref={fileRef} onChange={handleFile} style={{ display: "none" }} />
      <button onClick={() => fileRef.current.click()}>이미지 선택</button>
      {preview && <img src={preview} width="100" alt="미리보기" />}
    </div>
  );
};

```
