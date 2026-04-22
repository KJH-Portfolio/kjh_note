---
{"dg-publish":true,"permalink":"/01-dev-stack/03/06-react/05/caching/","dg-note-properties":{"작성일":"2026-02-13T14:22","수정일":"2026-02-13T14:32"}}
---

# React Client-Side Caching Strategy
> [!summary] 핵심 요약
> 
> 불필요한 네트워크 요청 방지 및 렌더링 성능 최적화를 위한 클라이언트 계층의 데이터 관리 전략.
> 
> Server State 라이브러리(TanStack Query, SWR)를 활용한 비동기 데이터 캐싱 및 동기화 자동화.
> 
> React 내장 Hook(useMemo, useCallback)을 통한 연산 결과 메모이제이션(Memoization).
## Server State Management (Data Caching)
- **개요**
    - 서버에서 가져온 데이터를 클라이언트에서 관리하며 캐싱, 동기화, 업데이트를 처리하는 전용 라이브러리 활용.
    - 전역 상태 관리 라이브러리(Redux 등)의 보일러플레이트 코드 감소 및 비동기 로직 분리.
- **주요 라이브러리**
    - **TanStack Query** 가장 강력한 기능 제공 (DevTools, Infinite Scroll 등), 엔터프라이즈급 표준.
    - **SWR (Stale-While-Revalidate):** Vercel에서 개발, 가볍고 직관적인 API, Next.js와 높은 호환성.
- **핵심 기능 (Key Features)**
    - **Stale-While-Revalidate:** 캐시 된 데이터(Stale)를 먼저 보여주고, 백그라운드에서 최신 데이터(Fresh)를 가져와 갱신.
    - **Window Focus Refetching:** 사용자가 브라우저 탭으로 돌아올 때 자동으로 최신 데이터 동기화.
    - **Request Deduping:** 동일한 API 요청이 동시에 여러 컴포넌트에서 발생 시 단 한 번만 요청 수행.
    - **Cache Invalidation:** 데이터 변경(Mutation) 시 관련된 쿼리를 무효화하여 자동 갱신 유도.
### TanStack Query 구현 예시
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// API Fetcher 함수
const fetchUserData = async (userId) => {
  const response = await axios.get(`/api/users/${userId}`);
  return response.data;
};

const UserProfile = ({ userId }) => {
  const queryClient = useQueryClient();

  // [조회] useQuery 훅 사용
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId], // 캐시 키 (배열 형태)
    queryFn: () => fetchUserData(userId),
    staleTime: 1000 * 60 * 5, // 5분간 데이터를 Fresh 상태로 유지 (API 요청 안 함)
    gcTime: 1000 * 60 * 10,   // 10분 후 캐시 메모리에서 삭제 (Garbage Collection)
  });

  // [수정] useMutation 훅 사용
  const mutation = useMutation({
    mutationFn: (newUser) => axios.put(`/api/users/${userId}`, newUser),
    onSuccess: () => {
      // 데이터 수정 성공 시 'user' 키를 가진 쿼리 무효화 -> 자동 재조회
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={() => mutation.mutate({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  );
};
```
## Built-in Memoization (Computation Caching)
- **개요**
    - React 내부의 렌더링 연산 비용을 줄이기 위한 메모이제이션 기법.
    - 네트워크 요청 캐싱이 아닌, **CPU 연산 결과 및 컴포넌트 재사용**에 초점.
- **주요 Hooks**
    - **useMemo:** 복잡한 연산의 **결과값**을 캐싱 (의존성 배열 내 값이 변경될 때만 재연산).
    - **useCallback:** **함수 정의** 자체를 캐싱 (불필요한 함수 재생성 방지).
    - **React.memo:** 컴포넌트의 Props가 변경되지 않으면 리렌더링 방지 (HOC).
```typescript
import React, { useMemo, useState } from 'react';

const ExpensiveComponent = ({ list }) => {
  // list 배열이 변경되지 않는 한, 정렬 연산을 다시 수행하지 않음
  const sortedList = useMemo(() => {
    console.log("Sorting...");
    return list.sort((a, b) => a - b);
  }, [list]);

  return <div>{sortedList.join(', ')}</div>;
};
```
## Browser Persistence (Storage Caching)
- **Local Storage / Session Storage**
    - 브라우저에 데이터를 영구(Local) 또는 세션(Session) 동안 저장.
    - 새로고침 해도 유지되어야 하는 데이터(토큰, 테마 설정, 장바구니 등)에 적합.
    - `redux-persist` 또는 `zustand/middleware`를 통해 상태 관리 라이브러리와 연동 가능.