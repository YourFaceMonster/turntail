# TURNTALE 0.6.66

2026-11-03 · GitHub `main` 및 Cloudflare Worker `turntail`

## 업데이트

- 폭탄시장전을 4인 고정으로 변경했다. 참가자당 11장, 공개 시장 16칸, 시작 점수 50점, 5판 정산을 적용한다.
- 차례와 관계없이 폭탄을 선언할 수 있다. 선언 후 모든 참가자에게 3초 반응 시간이 주어지고, 반응 중에는 일반 행동과 AI의 일반 턴을 멈춘다.
- 3인 저장 데이터와 4인 신규 게임을 함께 처리하도록 저장 검증과 표시를 조정했다.
- RPG 주점 게시판에서 한 번 보상을 골라 받을 수 있다: 주화 +5 또는 HP +5.
- 마을 잡화점에 소모품·유물 분류, 전체 유물 목록, 품절·보유·해금·가방 상태 안내를 추가했다.
- 달 마을 관문 가로·세로 그림과 소문 수첩·마을 지도 아이콘을 추가하고 프롤로그 장소 표기를 정리했다.
- 앱 버전을 0.6.66으로 갱신했다.

## 배포 확인

- `pnpm build`: 성공
- Cloudflare Worker `turntail`: 배포 성공
- 공개 URL: https://turntail.yousexybaby.workers.dev/
- 공개 페이지 응답: HTTP 200, 페이지에서 0.6.66 표기 확인
- Worker Version ID: `f648d950-fbe3-44e3-9d58-5a68261135b1`

## 관련 Git 커밋

- `66e3c3c` Add four-player bomb market and RPG journey updates
- `838cedb` Bump app version to 0.6.66
