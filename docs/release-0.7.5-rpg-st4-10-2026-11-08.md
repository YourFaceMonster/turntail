# 0.7.5 · RPG ST4~10 여정 · 누구든 HP 0이면 스테이지 종료 · 화면 정리

사용자 요청(2026-11-08): 로컬 작업 확인 후 커밋·배포.

## 변경 내용

### RPG 규칙
- 누구든 HP 0이 되면 그 판으로 스테이지가 끝난다.
  - 내가 0이면 실패이고, 같은 판에서 나와 AI가 동시에 0이 되어도 실패다.
  - AI 한 명이라도 0이 되면 클리어다.
  - 1대1 이어하기는 없다.
- 적 HP 표(`RPG_STAGE_HP`)는 바꾸지 않았다(사용자 확정).

### ST4~10 여정 (스토리 기획서 v1.4 기준, 그림은 임시)
- **진행:** 여정이 ST3에서 끝나지 않고 ST10까지 이어진다.
  - 지역은 철문(1~3), 성화(4~6), 열쇠(7~9), 왕관(10)이다.
  - 지도에는 현재 지역의 장소만 표시한다.
- **상대:** ST4 수리·네아, ST5 타래·하온, ST6 카르덴·세라, ST7 루엔·시온, ST8 엘라·아스텔, ST9 재온·오닉, ST10 두 수호자(같은 외형).
- **장면:**
  - ST4~10 승부 전·후 대사를 넣었다.
  - 2회차에는 ST1~3에 짧은 대사를 더한다.
  - 서브퀘스트 선택에 따라 일부 대사가 달라진다.
- **서브퀘스트 5개:** ST4·5·6·8·9.
  - 선택만 기록하고 보상은 없으며, 건너뛰어도 진행할 수 있다.
  - ST7은 그 스테이지 판을 2등으로 마치면 대사 한 줄이 추가된다.
- **이야기 패:** ST6 클리어 때 성화 2, ST9 클리어 때 비밀의 열쇠 2를 얻는다.
- **엔딩:**
  - 첫 여정은 정상 엔딩으로 끝난다.
  - 다음 여정은 2회차 프롤로그로 시작하고, ST10을 깨면 진엔딩이 나온다.
  - 저장에 `storyProgress`(정상 엔딩·진엔딩)를 남긴다.
- **그림:** 기존 배경과 주점 그림을 임시로 쓴다. 요청 목록은 `docs/rpg-st4-10-art-requests.md`.
- **TEST 화면 바로가기:** ST1~10 전투, 보상, 서브퀘스트, 지역 지도 4개, 2회차 프롤로그, 정상·진엔딩까지 36개.

### 화면
- RPG 세로 화면의 "최근" 열을 오른쪽 유물 칸과 대칭인 모양·어둡기로 바꿨다. 판 테두리에 잘리던 좌우 칸은 판 안쪽으로 1px 들였다.
- RPG 세로 화면에서 "1장 가져오기"와 "선택 후 내기" 버튼을 같은 폭으로 맞췄다.

## 주요 파일
- 신규 `lib/rpg-chapters.ts`, `lib/rpg-chapter-scenes.ts`, `tests/rpg-chapters.test.tsx`
- 수정
  - 엔진·저장: `lib/rpg-journey.ts`, `lib/rpg-rework.ts`, `lib/rpg-game.ts`, `lib/rpg-story-cards.ts`, `lib/rpg-story-card-art.ts`, `lib/rpg-storage.ts`, `lib/rpg-preview.ts`
  - 화면: `app/page.tsx`, `app/components/RpgJourneyScene.tsx`, `QuestCutscene.tsx`, `RpgReworkResult.tsx`, `RpgPreviewTools.tsx`, `RpgJourney.tsx`, `SinglePlayer.tsx`, `RpgRecentPlays.tsx`
  - 스타일: `app/rpg-journey.css`, `app/rpg-phase-one.css`

## 이번 검증 (PC 로컬, Node 24.22.1)
- TypeScript `--noEmit` 통과.
- 새 여정 테스트 6개 통과(같은 파일 8회 반복 통과).
  - ST1→ST10 진행, 상대, 챕터 HP, 이야기 패
  - 서브퀘스트, 2회차 대사, 엔딩 기록
  - TEST 바로가기 36개
- 전체 349개 중 312 통과·37 실패. 실패 37개는 이번 작업 전과 같은 기존 실패다.
- 인앱 브라우저 375×812에서 확인한 것:
  - 성화의 영역 지도, 서브퀘스트 선택, ST4 승부(HP 100 회복·보스 유물 1개 계승)
  - TEST 메뉴 36개, ST9 전투, 정상 엔딩 재생
- 미확인
  - ST5~10을 처음부터 이어서 직접 플레이한 화면
  - 가로 화면의 새 지역 지도
  - 실제 사람 플레이 밸런스

## 배포
GitHub `main` push → Cloudflare Workers Builds 자동 배포. 공개 사이트 확인 결과는 README에 기록한다.
