# 0.7.27 · ST4~10 가로 그림 연결 (2026-11-14)

사용자 요청: "가로 연결해주고 업데이트까지해줘 커밋배포 고고". 그림은 Codex가 만든 40장(`docs/art-generation-landscape-daily-result-2026-11-14.md`)이다.

## 변경
- **장면 그림:** 가로 화면에서 ST4~10 승부 전·후, 엔딩, 서브퀘스트 5개, 안개 나루 주사위판이 세로 그림 액자 대신 가로 그림(`/story/<key>-wide-v1.webp`)을 쓴다(`lib/rpg-chapters.ts` `chapterArt`).
- **이야기 패 장면 7장:** `*-wide-special-v1.webp` (`lib/rpg-story-card-art.ts`).
- **영역 이동 6장:** `cross-*-wide-v1.webp` (`lib/rpg-chapter-scenes.ts`).
- **주점 2곳:** `inn-2/3-wide-v1.webp` (`lib/rpg-inns.ts`).
- **영역 지도 3장:** 가로 화면에서는 가로 지도를 화면 가득 쓰고(1구역과 같은 16:9 배치), 장소 위치는 Codex가 잰 실제 중심 좌표로 바꿨다(`lib/rpg-journey.ts` x/y). 세로 화면은 그대로다(`app/rpg-journey.css`).
- **미리 불러오기:** 다음 스테이지 그림을 화면 방향에 맞는 파일로 미리 불러온다.
- 동물 프로필 4장(`public/avatars/`)은 이번에 연결하지 않았다.
- 버전 0.7.27.

## 이번 검증 (PC 로컬)
- TypeScript 통과. 프로덕션 빌드 성공. 전체 테스트 424개 통과(옛 "가로도 세로 그림" 테스트 2개를 가로 그림 기준으로 바꿨다).
- 점검 브라우저가 숨겨져 실제 화면에서 지도 아이콘 위치와 장면 표시는 보지 못했다. 좌표는 Codex의 `map-centers.json`과 같다.
