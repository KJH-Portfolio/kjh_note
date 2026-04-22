---
{"dg-publish":true,"permalink":"/01-dev-stack/03/06-react/04-router/browser-router/","dg-note-properties":{"작성일":"2026-01-09T18:15","수정일":"2026-02-09T14:30"}}
---

# React Router 기능별 상세 구현 및 보안 전략 아키텍처
> [!summary] 요약
> `react-router-dom` API 체계의 구조적 분석, Web Storage 연계 보안 전략, `<Navigate>`의 `state` 속성을 활용한 선언적 경로 보존 및 복구 메커니즘 정립.
---
## 핵심 컴포넌트 체계
* **BrowserRouter**: 브라우저 History API 기반 라우팅 컨텍스트 제공 최상위 컴포넌트.
* **Routes & Route**: 경로 매칭 및 컴포넌트 렌더링 정의.
* **Link**: 새로고침 없는 선언적 페이지 이동 인터페이스.
* **NavLink**: 현재 경로 활성화 상태(`isActive`) 기반 조건부 스타일링 지원.
```jsx
// Route 설정 및 Link/NavLink 활용 예시
<BrowserRouter>
  <nav>
    <Link to="/">Home</Link>
    <NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""}>About</NavLink>
  </nav>

  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    // :/id 같은 방식으로 동적으로 라우팅 가능
    <Route path="/user/:id" element={<UserDetail />} />
  </Routes>
</BrowserRouter>
```
---
## Hooks 기반 데이터 및 경로 제어
* **useParams**: 동적 경로 파라미터 객체 추출.
* **useLocation**: 경로명(`pathname`), 상태(`state`), 검색 쿼리(`search`) 정보 참조.
* **useSearchParams**: URL 쿼리 스트링 읽기 및 조작 인터페이스.
* **useNavigate**: 명령형 경로 전환 및 히스토리 제어.
### Hooks 주요 기능 비교

| Hook 명칭             | 주요 용도           | 반환 데이터 형식                 |
| ------------------- | --------------- | ------------------------- |
| **useParams**       | 경로 파라미터 획득      | Object (key-value)        |
| **useLocation**     | 현재 URL 상태 정보 참조 | Location Object           |
| **useSearchParams** | 쿼리 스트링 제어       | [URLSearchParams, Setter] |
| **useNavigate**     | 프로그램 방식 이동      | Navigate Function         |
```jsx
// Hooks 활용 데이터 추출 및 이동 제어
const UserProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const handleAction = () => {
    const sort = params.get('sort');
    console.log("Current Path:", location.pathname);
    navigate("/home", { replace: true });
  };

  return <button onClick={handleAction}>User {id} Action</button>;
};
```
---
## Navigate 및 고도화된 라우팅 패턴
* [[3. Resource/01.Dev_Stack/03.웹 생태계/06.React/03.API/02.Navigate\|02.Navigate]]
* **state 속성**: History API 기반 비노출 데이터 은닉 전달 및 경로 보존.
* **중첩 라우팅 (Nested Routing)**: 상위 Route 내 하위 자식 Route를 포함하는 계층적 구조.
* **Outlet**: 부모 컴포넌트 내 자식 라우트 컴포넌트 렌더링 영역 지정.
* **Index Route**: 부모 경로와 정확히 일치할 때의 기본 자식 컴포넌트 설정.
```jsx
// Navigate 활용 및 중첩 라우팅 구조
const Layout = () => (
  <div>
    <aside>Sidebar</aside>
    <main><Outlet /></main>
  </div>
);

// 라우트 정의
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Dashboard />} />
    <Route path="users" element={<UserList />} />
  </Route>
  <Route 
    path="/old-path" 
    element={<Navigate to="/new-path" state={{ from: "old" }} replace />} 
  />
</Routes>
```
#### 부록 Navigate vs useNavigate

| **상황**                                   | **추천 도구**      | **이유**                             |
| ---------------------------------------- | -------------- | ---------------------------------- |
| **이벤트 처리**<br>(클릭, 폼 제출, 타이머 종료 등)       | `useNavigate`  | 특정 시점에 함수를 실행해서 이동시켜야 하니까!         |
| **인증 가드**<br>(로그인 안 한 사용자 쫓아내기)          | `<Navigate />` | 특정 페이지에 접근했을 때 '렌더링' 단계에서 막아야 하니까! |
| **Redirect** <br>(잘못된 경로로 왔을 때 메인으로 보내기) | `<Navigate />` | 컴포넌트가 마운트되자마자 이동시키는 게 더 선언적임!      |

---
## 보안 전략 및 통합 시스템 구현
* **Web Storage 연계**: `localStorage`(인증 토큰) 및 `sessionStorage`(세션 데이터) 기반 상태 관리.
* **ProtectedRoute**: 인증 유무 및 권한에 따른 조건부 렌더링 분기 및 접근 제어 로직.
* **경로 복구 메커니즘**: 로그인 완료 후 `state.from` 정보를 참조하여 이전 목적지로 자동 복귀.
### 인증 데이터 저장소 분류

| 구분 | 저장 위치 | 데이터 수명 | 주요 용도 |
| --- | --- | --- | --- |
| **Auth Token** | localStorage | 브라우저 종료 후 유지 | 자동 로그인, 인증 유지 |
| **Session Data** | sessionStorage | 탭 종료 시 삭제 | 임시 보안 데이터, 일회성 상태 |
```jsx
// ProtectedRoute 구현 및 로그인 경로 복구 로직
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  return token 
    ? children 
    : <Navigate to="/login" state={{ from: location.pathname }} replace />;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleLogin = () => {
    localStorage.setItem('token', 'auth_success');
    navigate(from, { replace: true });
  };

  return <button onClick={handleLogin}>Login</button>;
};
```