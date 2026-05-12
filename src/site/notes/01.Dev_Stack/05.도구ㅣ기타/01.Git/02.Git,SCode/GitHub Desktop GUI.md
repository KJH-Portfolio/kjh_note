---
dg-publish: true
작성일: 2026-01-26T12:34
수정일: 2026-01-26T12:34
---
# GitHub Desktop 기반 VSCode 연동 및 Git 워크플로우
> [!summary] 요약: GitHub Desktop GUI를 활용한 브랜치 생성, 작업 저장(Commit), 서버 전송(Push), 최신화(Pull) 및 병합(Merge) 충돌 해결 절차 정리.
## 브랜치 관리 및 VSCode 연동
- **브랜치 생성 및 전환**
    - 상단 **Current branch** 영역 클릭 후 **New Branch** 버튼을 통한 새 작업 공간 생성.
    - 브랜치 목록 내 특정 항목 선택을 통한 작업 브랜치 즉시 전환.
- **VSCode 실행**
    - 메인 화면의 **Open in external editor** 버튼 또는 **Ctrl + Shift + A** 단축키를 통한 VSCode 프로젝트 진입.
```xml
// 브랜치 관리 UI 대응
// [Current branch] > [New Branch]: 브랜치 생성
// [Current branch] > [목록 선택]: 브랜치 체크아웃
```
## 작업 내역 반영 (Commit & Push)
- **변경 사항 확인 및 커밋(Commit)**
    - 좌측 **Changes** 탭 내 수정/삭제된 파일 목록 자동 감지 및 표시.
    - 좌측 하단 **Summary** 필드에 작업 핵심 요약 입력.
    - 파란색 **Commit to [브랜치명]** 버튼 클릭을 통한 로컬 저장소 기록.
- **원격 전송 (Push)**
    - 커밋 완료 후 상단 **Push origin** 버튼 클릭을 통한 GitHub 서버 업로드.
    - 작업물 공유를 위한 **Create Pull Request** 버튼 활성화 확인.
```xml
// 반영 프로세스 UI 대응
// [Changes] 탭: 스테이징 확인
// [Summary] 입력창: 커밋 메시지 작성
// [Commit to 브랜치명]: 로컬 반영
// [Push origin]: 서버 전송
```
## 저장소 최신화 및 병합 (Pull & Merge)
- **최신 상태 갱신 (Pull)**
    - 상단 **Fetch origin** 클릭을 통한 원격 저장소 변경 사항 조회.
    - 서버에 새 변경 사항 존재 시 **Pull origin** 버튼 클릭을 통한 로컬 동기화.
- **브랜치 병합 (Merge)**
    - 상단 메뉴 **Branch** > **Merge into current branch** 선택.
    - 현재 브랜치에 합칠 대상 브랜치를 목록에서 지정 후 **Merge [대상] into [현재]** 클릭.
```xml
// 동기화 UI 대응
// [Fetch origin]: 변경 사항 체크
// [Pull origin]: 변경 사항 내려받기
// [Branch] 메뉴 > [Merge into current branch]: 브랜치 합치기
```
## 충돌 대처 (Conflict Resolution)
- **충돌 감지 및 에디터 연결**
    - 병합 시 동일 코드 라인 수정 중복으로 인한 **Conflicts** 알림 확인.
    - **Open in Visual Studio Code** 버튼 클릭을 통한 충돌 지점 수정 화면 이동.
- **코드 수정 및 병합 완료**
    - VSCode 내 **Accept Current Change**(현재 유지), **Accept Incoming Change**(가져온 코드 반영) 등 선택 또는 수동 편집.
    - 수정 완료 후 저장 시 GitHub Desktop의 **Continue Merge** 버튼 활성화 확인.
    - 최종 병합 커밋 생성을 통한 충돌 상황 종료.
```xml
// 충돌 해결 UI 대응
// [Conflicts 발생 알림]: 충돌 인지
// [Open in Visual Studio Code]: 해결 도구 실행
// [Continue Merge]: 충돌 해결 후 병합 최종 승인
```
---
- **노트 내용 수정/추가/삭제 사항 안내:** 명령어 기반 설명을 배제하고 제공된 이미지의 GUI 버튼 및 메뉴 명칭 중심으로 구조화 완료.
- **노트 내용 수정/추가/삭제 제안:** 협업 시 필수적인 'Pull Request(PR)' 생성 후 GitHub 웹사이트에서의 승인 및 머지 절차에 대한 단계별 안내 추가 제안.
- **노트 내용에 대한 관련 사항들 질문:** 현재 사용 중인 저장소에서 팀 단위 협업 시의 브랜치 전략(Git Flow 등)을 GUI 상에서 표현하는 방법이 필요함?