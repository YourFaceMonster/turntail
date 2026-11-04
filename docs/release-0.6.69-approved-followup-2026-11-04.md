# v0.6.69 승인 직업·열쇠A·운명력3 배포

2026-11-04 사용자의 커밋/업로드 요청에 따라 로컬에서 확인한 수정분을 GitHub main과 Cloudflare에 게시한다. Sites 사용 없음.

승인한4직업 v5, 열쇠A, RPG 우선 메뉴와 시작 후 직업 선택 팝업, 운명력3/HP0 시1개 차감/HP100 같은 스테이지 지도 재도전/소지품·주화 유지/0이면 게임오버, 퀘스트 HUD, 대화/세린 점수·초상/실패 화면 및 결과 테스트 바로가기를 포함한다. 상세 변경 내용은 [로컬 검증 기록](local-approved-followup-2026-11-04.md), 이미지 프롬프트·원본은 [생성 기록](art-generation-approved-professions-v5.json).

## 이번 배포 전 검증

이번 턴 관련13개 파일38개 검사 통과. TypeScript --noEmit 및 git diff --check 통과. GitHub main과 로컬 HEAD 분기0/0 확인. 이전에 실행한 추가 character-visuals 검사의 '(1회)' 문구 기대 실패는 로컬 기록에 보존하며38개 통과에 포함하지 않음.

패 글리치는 로컬에서 재현되지 않아 SVG 참조를 보정한 상태이며, 사용자 실제 기기에서의 해결을 보장하지 않는다. 전체 전투/퀘스트 연속 플레이는 이번 배포 검증 범위 밖이다. 버전0.6.69 유지. 빌드·배포·공개 확인 결과는 완료 후 추가한다.

## 게시 완료

소스 커밋286069f, GitHub main 반영. 운영 빌드 통과(기존 큰 청크/라우트 분류 안내 유지). Cloudflare Worker d4de37f0-d73d-46c7-b8f1-d16d88285dcf 배포 성공. 공개 홈페이지HTTP200/현재CSS 참조 확인, CSS3개·관련JS1개·직업PNG4개 총8개 HTTP200 및 로컬 빌드 SHA-256 일치. [파일 검증](deployment-approved-followup-2026-11-04.json).

공개390×760에서 RPG 우선 메뉴, 새 시작 후 직업 선택 팝업/승인4직업 이미지, 운명력3 지도와 결과 테스트 바로가기를 저장 없는 RPG 모드로 확인했다. 화면 근거: 루트 artifacts/public-approved-professions-2026-11-04.png 및 public-approved-serin-2026-11-04.png. 전체 연속 전투/실제 사용자 단말 패 글리치 검증을 대신하지 않는다.

게임: https://turntail.yousexybaby.workers.dev/ . 버전0.6.69 유지. 이후 별도 배포 요청 없는 수정은 로컬 저장만 한다.
