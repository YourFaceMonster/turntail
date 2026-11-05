# 컷씬 행동 순서 보완 · 2026-11-05 (로컬)

사용자 승인: 검토에서 제안한 컷을 추가하고 필요한 보완을 로컬 코드에 반영. 버전0.6.69 유지. 빌드·커밋·Push·Cloudflare 배포는 요청되지 않아 실행하지 않음.

## 반영

- 이미지젠으로 새 장면4종의 가로·세로8장 제작: 프롤로그 실제 승부, 패를 꺼내기 전 돌기둥 발견, ST3 성화 관련 기록을 펼쳐 살펴봄, 편지 없는 모르의 회수 의뢰.
- ST2 포코/밀라 가로·세로4장: 인물·밤 배경·구도는 유지하면서 패의 달/별/클로버/해 문양을 왕관·열쇠·성화·철문으로 보정. 기존 원화는 삭제/덮어쓰기하지 않음.
- 프롤로그 P05 첫 초대는 기존 중립 주점 그림, P06~07 내기 제안, P08 새 승부 컷, P09 기존 보상 제시, P10~12 기존 앞뒷면. P15~16은 패 없는 돌기둥 발견, P17에서 기존 두 왕관 표식 비교 컷으로 전환.
- ST3_POST_11~12 기록 발견/끊긴 글 대사에 열린 책 컷 연결. 새 위치·지도·남은 패·최종 목적을 원화에서 공개하지 않음.
- 모르 의뢰/진행/실패/편지를 가지고 돌아왔지만 아직 넘기지 않은 상태는 mor-request. 실제 반환 완료 상태에서만 기존 mor-letter. 다시 보기의 의뢰 컷도 같은 기준.
- 확정 P01~P19 대사·길이·읽기 시간, BGM/효과음, 전투·획득 보상·저장 형식은 유지. P13은 기존 주점 그림을 활용하며 별도 원화를 만들지 않음.
- 네 가지 이야기 패 미리보기/미획득 비활성 표시는 사용자 요청대로 다음 업데이트로 보류.

## 파일 및 생성 기록

- 원화: public/prologue/wager-playing-{wide,portrait}-v1.png, stone-arrival-{wide,portrait}-v1.png, st3-record-{wide,portrait}-v1.png, square-{poko,mila}-{wide,portrait}-night-symbols-v5.png, public/quests/mor-request-{wide,portrait}-v1.png.
- 생성 도구: 내장 image_gen.imagegen. 모든 최종 프롬프트·입력 원본·출력 원본 및 실제 사용 경로: art-generation-scene-supplements-2026-11-05.json. 생성 원본은 기본 폴더에 그대로 보존하고 프로젝트로 복사.
- 연결: lib/rpg-prologue.ts, lib/rpg-connection-scenes.ts, lib/rpg-quest-art.ts, lib/rpg-cast-art.ts, app/components/RpgJourneyScene.tsx, app/components/QuestReplay.tsx.

## 이번 검증

- 관련9개 테스트 파일47개 검사 통과. 확정19개 스토리보드의 원문/화자/순서 보존, 저장·보상 격리, 시청/스킵/재생, 모르 상태별 그림, 단계별 배치/프리로드,12장 PNG 비율/해상도 검사 포함.
- TypeScript noEmit 및 diff 공백 검사 통과. 이번 초기 검사에서 전환 기대값1개를 잘못 수정한 것을 기존 정상 overlap으로 바로잡은 뒤47개 모두 통과. 제품 동작 실패는 아님.
- 로그: ../../artifacts/scene-supplements-tests-2026-11-05.log.
- 실제 Chrome390×844/844×390에서 모르 의뢰 mor-request, 열린 기록 st3-record와 반응형 이미지 로드, 대사 구간별 전환, 가로 넘침 없음 확인. 두 기록 컷의 성화 표식과 모르의 빈손이 식별됨. 원화12장 자체 시각 검토 및 프롤로그 신규 컷의 소비 컴포넌트 SSR/사전 로딩/단계 연결은 자동 검사로 확인. 전체 프롤로그를 브라우저에서 끝까지 감상하거나 전체 여정을 연속 플레이하지는 않음. 실제 모바일 기기/음향 재검증도 수행하지 않음.
- 캡처: ../../artifacts/scene-mor-request-portrait-2026-11-05.jpg, scene-mor-request-landscape-2026-11-05.jpg, scene-st3-record-portrait-2026-11-05.jpg, scene-st3-record-landscape-2026-11-05.jpg.
- 저장 없는 테스트 종료 후 이어서 하기 비활성(저장 게임 없음) 유지, viewport 복원. 개발 서버 종료.
