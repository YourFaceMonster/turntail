# v0.6.69 컷씬 보완 업데이트 · 2026-11-05

사용자 커밋·업데이트 요청으로 앞선 로컬 승인 수정분을 GitHub main과 Cloudflare 운영 사이트에 반영한다. 버전0.6.69 유지. 네 가지 이야기 패 전체 미리보기/미획득 비활성 표시는 이번 범위에서 계속 보류.

## 변경

- 실제 승부·패 없는 돌기둥 발견·열린 기록·편지 없는 모르 의뢰 등4장면의 가로/세로 원화8장 연결.
- ST2 포코/밀라 가로/세로4장의 옛 패 문양을 현 왕관·열쇠·성화·철문으로 보정, 기존 원본 보존.
- 프롤로그 첫 초대/내기/승부/보상 및 돌기둥 발견/패 비교의 행동 순서를 분리. 모르가 편지를 실제로 돌려받은 이후에만 기존 편지 그림을 사용.
- 확정 대사·BGM/효과음·전투/보상·저장 형식 유지. 상세 local-scene-supplements-2026-11-05.md, 생성 원문 art-generation-scene-supplements-2026-11-05.json.

## 검증

- 앞선 동일 수정본의 관련9개 테스트 파일47개 및 TypeScript noEmit 통과 기록 확인. 소스 추가 수정 없이 게시하므로 같은 검사를 반복 실행하지 않음.
- 이번 git diff 공백 검사 및 운영 빌드5단계 통과. 큰 청크 및 라우트 정적 분류 안내는 기존과 동일. 로그 ../../artifacts/scene-supplements-release-build-2026-11-05.log.
- 앞선 로컬 Chrome390×844/844×390에서 모르 의뢰와 기록 컷·반응형 로드·가로 넘침 없음을 확인. 전체 여정 연속 플레이/전체 프롤로그 실시간 감상/실제 모바일 기기·음향은 미검증.

## 게시

소스 d7fcb2bd0c1c76108b8cfaed6e7db19a834b4cb1를 GitHub main에 push하고 Cloudflare Worker f4f26e4b-c10a-4d81-8abe-4bd55cce978c 배포 완료. 홈페이지 HTTP200 및 원화12장/공개 JS·CSS 등 총20개 파일의 SHA-256이 운영 빌드와 모두 일치했다. 상세 deployment-scene-supplements-2026-11-05.json.

공개 Chrome390×844에서 저장 없는 화면 테스트로 모르 의뢰에 편지가 없는 mor-request 원화가 표시되는 것을 확인. 공개 이미지 로드·가로 넘침 없음·테스트 종료 후 저장된 게임 없음 유지 및 viewport 복원 확인. 공개 전체 여정/프롤로그 연속 감상은 반복하지 않았다.

사이트 https://turntail.yousexybaby.workers.dev. 캡처 ../../artifacts/public-scene-supplements-mor-2026-11-05.jpg, 배포 로그 ../../artifacts/scene-supplements-release-deploy-2026-11-05.log.

 이후 별도 요청 없는 수정은 로컬 저장만 한다.
