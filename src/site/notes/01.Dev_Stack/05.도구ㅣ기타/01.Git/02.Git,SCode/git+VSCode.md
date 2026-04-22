---
{"dg-publish":true,"permalink":"/01-dev-stack/05/01-git/02-git-s-code/git-vs-code/","dg-note-properties":{"작성일":"2026-01-26T11:05","수정일":"2026-01-29T09:08"}}
---

# VSCode, antigravity git# VSCode 및 GitHub Desktop 초기 연동 설정
> [!summary] 요약: Git 설치 단계의 에디터 및 브랜치 기본값 구성, GitHub Desktop 내 외부 에디터 통합 설정을 통한 VSCode 연동 프로세스.
## Git 및 저장소 초기 설치
- **Git 설치 환경 구성**
    - 기본 에디터 설정: **Use Visual Studio Code as Git's default editor** 선택.
        - 안된다면 **notepad도** 큰 오류 없이 돌아간다
    - 브랜치 명칭 지정: **Override the default branch name for new repositories** 항목 내 **main** 입력.
    - 설치 진행: 나머지 항목 기본 설정 유지 및 단계별 진행.
- **GitHub Desktop 저장소 관리**
    - 원격 저장소 준비: GitHub 웹사이트 내 신규 리포지토리 생성.
    - 로컬 복제: **Clone** 기능을 활용한 저장소 내려받기.
    - 저장소 연결 해제: **Remove** 기능을 통한 리포지토리 목록 제외.
```xml
// Git Installation & Repository Setup
// Editor: Visual Studio Code
// Default Branch: main
// Operation: Clone / Remove
```
## VSCode 외부 에디터 연동 설정
- **환경 설정 메뉴 진입**
    - 경로: 상단 메뉴 **File** > **Options** (macOS의 경우 **GitHub Desktop** > **Settings**) 선택.
- **인티그레이션(Integrations) 설정**
    - 탭 이동: 설정창 왼쪽 메뉴의 **Integrations** 항목 클릭.
    - 에디터 선택: **External editor** 드롭다운 메뉴에서 **Visual Studio Code** 지정.
    - 설정 저장: **[Save]** 버튼 클릭을 통한 변경 사항 적용.
- **연동 확인**
    - 버튼 활성화: 메인 화면 내 **[Open in Visual Studio Code]** 버튼 생성 및 작동 여부 점검.
```xml
// VSCode Integration Settings
// Path: Options > Integrations > External editor
// Target: Visual Studio Code
// Result: [Open in Visual Studio Code] button active
```
