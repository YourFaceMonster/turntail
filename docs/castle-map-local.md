# 성 구조 통일 지도 (2026-11-02, 로컬)

## 사용자 승인 지도 v3 반영

- 최종 승인: 성 밖 비석·눈길 → 정면 성문 → 성벽 안 마을·광장 → 뒤쪽 높은 성채 구도. 이전 v2의 좌우 배치를 대체한다.
- 승인 원본은 루트 artifacts/castle-map-review/moon-castle-map-v3-preview.png에 보존, 실제 자산은 public/prologue/moon-castle-map-v3.png에 복사했다. 생성 프롬프트는 같은 artifacts 폴더의 prompt-v3.txt에 있다. 이번 작업에서 이미지를 새로 생성하지 않았다.
- RPG 메뉴, 여정 지도, ST3 마지막 연결 컷의 가로·세로 참조를 모두 승인된 한 장으로 연결했다. 비석은 그림에만 표현하며 방문 노드·기능은 추가하지 않는다.
- 성문·주점·광장·성채와 기존 선택 장소의 위치 및 경로를 새 구도에 맞췄다. 세로 전용 이전 지도와 위치 덮어쓰기를 해제했다. 좁은 여정 화면에서는 가로 비율을 유지한 채 좌우 스크롤한다.
- 이번 검증: 타입 검사 통과, 관련 테스트 2개 파일의 4개 검사 통과. 이전 로더가 없어 artifacts/castle-map-review/register-tests.mjs로 기존 검사를 실행했다. 저장 왕복·진행 잠금·보상 중복 방지·컷씬 재생 및 자산 존재 검사를 포함한다. 실제 브라우저·기기 화면 조작은 미검증.
- 버전 0.6.61 유지. 로컬 파일 저장만 수행했고 빌드·원격 저장·push·게시하지 않았다. 이전 그림 및 사용자 미커밋 파일은 보존했다.

## 이전 v2 작업 기록 (최종 승인본 아님)

- 기준: 0.6.61, 작업 시작 Git 변경 없음.
- 사용자 요청: 지도를 기존에 제작한 성과 같은 모습으로 수정.
- 기존 ST1의 큰 아치형 관문·석벽·청색 깃발과 ST2의 성 안 마을을 지도에 반영했다. 가로·세로 지도를 새 파일로 보존하고 RPG 메뉴·여정 지도·ST3 후속 컷에 연결했다.
- 장소 버튼과 가로 경로를 새 그림에 맞췄다. 기존 지도 원본과 진행·보상·저장은 보존한다.
- 생성: 내장 image_gen, 승인된 turntale-cartoon-fantasy + imagegen 스킬 적용. 참조는 기존 지도, gate-before-r61, square-continuity-after-r61. 상세 프롬프트는 castle-map-prompts.json.
- 새 자산: public/prologue/moon-castle-map-v2.png, public/prologue/moon-castle-map-portrait-v2.png.
- 빌드·업로드·원격 저장·push 없음. 실제 브라우저 조작 검증은 수행하지 않았다.
- 이번 검증: `node node_modules/typescript/bin/tsc --noEmit` 통과. 관련 검사 2개 파일 실행은 안내된 이전 source/tools/register-tests.mjs 부재로 시작하지 못했다(검사 통과로 집계하지 않음). 생성된 가로·세로 그림은 직접 확인했다.
