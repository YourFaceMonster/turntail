# 남은 일 정리 (2026-11-11 오후, 운영 0.7.12 이후)

운영 배포본: 0.7.12(29c72d3). 아래 "로컬 수정"은 커밋·배포하지 않았다.

## 1. 로컬에서 고쳤고 아직 배포 안 함

| 항목 | 내용 | 파일 | 확인 |
|---|---|---|---|
| HP 옆 정산 미리보기 삭제 | RPG 대결 중 HP 옆 −20·+20 숫자 제거. 판 끝 정산 화면은 그대로 | `app/page.tsx` | 타입 검사·관련 테스트 통과. 계산 함수 `rpgSettlementPreview`와 그 테스트는 남겨 둠 |
| 컷씬 배경음 끄기(C안) | 프롤로그·스테이지 전후 이야기·서브퀘스트 대화·이야기 다시 보기 동안 배경음 멈춤, 끝나면 다시 재생. 프롤로그의 합성 주점 선율도 끔. 바람·모닥불 같은 효과음은 유지 | `lib/cutscene-music.ts`(새 파일), `app/components/RpgPrologue.tsx`, `app/components/QuestCutscene.tsx`, `app/page.tsx`, `tests/cutscene-music.test.ts` | 새 테스트 통과. 실제 소리는 아직 귀로 확인 안 함 |

| 싱글플레이 메뉴 카드 정렬(승인 후 수정) | 폭탄시장전 카드의 정렬용 인라인 스타일을 지우고 다른 카드처럼 가운데 정렬, 잘리던 작은 글씨를 `BOMB MARKET`으로. 요트다이스 카드 주사위 3개 → 5개(위 3·아래 2) | `app/components/SinglePlayer.tsx`, `app/journey-polish.css` | 375×812 브라우저에서 확인, 전체 테스트 389개 중 371 통과·실패 0·건너뜀 18, 타입 검사 통과 |

| 요트다이스 멀티 2·3인전 | 멀티플레이 메뉴에서 "패 대전 / 요트다이스" 선택. 친구끼리 방 코드로 2인·3인(AI 자리 없음). 차례 60초, 넘기면 그 차례는 AI가 굴리고 3번 연속이면 AI가 자리를 이어받음(그 사람 전적은 안 남김). 전적은 새 `yacht_records` 표(처음 쓸 때 자동 생성)에 저장, 패 대전 기록·순위와 섞이지 않음. 방장이 같은 멤버로 새 판 | `lib/yacht-room.ts`, `lib/yacht-room-server.ts`(새 파일), `app/api/game/route.ts`, `app/components/YachtOnline.tsx`, `app/components/yacht-online.css`(새 파일), `app/page.tsx`, `tests/yacht-online.test.ts`(새), `tests/online-timeout.test.ts`·`tests/leaderboard.test.ts`(모듈 경로 추가) | 새 테스트 5개 통과, 전체 394개 중 376 통과·실패 0·건너뜀 18, 타입 검사 통과. 로컬 개발 DB에 표가 없어 실제 서버로는 못 돌렸고(기존 패 대전도 로컬에선 같은 오류), 브라우저에서 같은 규칙 코드로 만든 가짜 서버로 대기실·굴리기·남기기·점수·게임 끝 화면을 375×812에서 확인. 두 기기 실제 대전은 배포 후 확인 필요 |

| 세로 지역 지도 위치 | 지역 2·3·4 세로 지도를 HP 창 아래 ~ 아래 버튼 줄 위 칸에 통째로 맞춤(HP 창 높이는 화면에서 재서 맞춤). 남는 위아래 띠는 같은 지도를 흐리고 어둡게 채움. 가로 화면·지역 1은 그대로 | `app/components/RpgJourneyScene.tsx`, `app/rpg-journey.css` | 375×812·412×915에서 지역 2·3 확인(ST9 등 맨 위 장소가 HP 창에 안 가림) |
| 컷씬 움직임 | ST4~10 이야기 컷씬에 느린 카메라 이동 + 지역 효과(ST4 물안개, ST5 바람·살짝 흔들림, ST6 먼지, ST7 푸른 반딧불, ST8 금빛 낙엽, ST9 잿불·불빛 일렁임, ST10 붉은 잎·빛). 서브퀘스트 컷씬도 느린 카메라 이동. '동작 줄이기' 설정이면 끔 | `app/story-motion.css`(새), `app/components/RpgPrologue.tsx` | ST9 승리 이야기에서 애니메이션 적용 확인(화면 테스트). 전체 테스트·타입 검사 통과 |

| 가로 화면(PC·폰 가로) 세로 그림 액자 | 사용자 선택: 가로 그림이 생기기 전까지 ST4~10 컷씬·퀘스트·지역 지도는 예전 임시 가로 그림 대신 새 세로 그림을 가운데 액자로 띄우고 양옆은 같은 그림을 흐리게 채움. 가로 지역 지도도 세로 좌표·세로 경로 사용 | `lib/rpg-chapters.ts`(`chapterArt` 가로 경로 = 세로 그림), `app/components/RpgPrologue.tsx`, `app/story-motion.css`, `app/rpg-journey.css`, `tests/rpg-chapters.test.tsx`(기대값 변경) | 1366×768·812×375에서 지역 2 지도, 퀘스트 5, ST6 승리 이야기 확인. 전체 394개 중 376 통과·실패 0, 타입 검사 통과 |

### 저녁 추가분 (사용자 "다해줘", 제안 1~14번)

| 번호 | 항목 | 내용 | 주요 파일 | 확인 |
|---|---|---|---|---|
| 1·2 | 대사 자동 넘김·지난 대사 | 이야기 컷씬(원래 자동 진행)과 퀘스트 대화(원래 수동)에 "자동 ▶/■"과 "지난 대사" 버튼. 자동 끄기는 두 화면 공통으로 기억. 지난 대사를 여는 동안 컷씬 시계 멈춤 | `lib/dialogue-prefs.ts`, `app/components/DialogueTools.tsx`, `dialogue-tools.css`, `RpgPrologue.tsx`, `QuestCutscene.tsx`, `lib/rpg-prologue.ts`(`hold`) | 1366×768에서 퀘스트 5·프롤로그 확인, 테스트 3개 |
| 3 | PC 대결 화면 | 마우스 PC에서 가로가 세로보다 1.2배 이상 넓으면 처음부터 가로 배치. 거의 정사각형 창은 세로 유지. PC 가로 배치에서 바닥 패 상한 104px → 최대 150px, 왼쪽 칸 가운데 정렬 | `lib/layout.ts`, `app/landscape-stacked.css`, `tests/landscape-stacked.test.ts`(기대값 변경) | 1366×768 일반 대결·RPG ST5 확인 |
| 4 | 폰 가로 퀘스트 대화창 | 812×375에서 대화창 높이 160px → 124px(화면 43% → 33%). 글자·선택지 조금 작게 | `dialogue-tools.css` | 812×375 퀘스트 5 확인 |
| 5 | 오늘의 판 | 싱글플레이 메뉴 아래 띠. 한국 날짜마다 모두 같은 패 배치로 AI 2명과 3인전 한 판. **서버가 판 결과에서 직접 점수 기록**(브라우저가 점수를 보내지 않음). 그날 처음 연 판만 순위 반영, 이후는 연습판. 새 표 `daily_scores`(처음 쓸 때 자동 생성, 14일 보관). 오늘·어제 순위 | `lib/daily.ts`, `lib/daily-server.ts`, `lib/game.ts`(`daily` 필드, 한 판 제한), `app/api/game/route.ts`, `DailyBoard.tsx`, `daily-board.css`, `SinglePlayer.tsx`, `page.tsx` | API 테스트, 1366×768에서 순위 창·대결 시작 확인 |
| 6 | 도전 규칙 | 진엔딩을 본 기기에서 새 RPG 여정 전에 고름: 약한 심장(시작·각 장 HP 70), 거센 상대(상대 시작 HP +20%), 홀로 든 유물(장착 1칸). 어려워지기만 하고 보상 없음 | `lib/rpg-trials.ts`, `rpg-game.ts`, `rpg-rework.ts`, `rpg-journey.ts`, `rpg.ts`, `RpgJourney.tsx`, `RpgJourneyScene.tsx`, `RpgEquippedRelics.tsx`, `systems-0710.css` | 규칙 테스트. 진엔딩 저장이 없어 선택 화면은 못 봄 |
| 7 | 업적 보상 주사위 | 업적 화면 아래에서 요트다이스 주사위 무늬 선택: 상아(기본)·흑요석(업적 3)·비취(6)·금박(10)·세계수(전부). 모양만 바뀜 | `lib/dice-skins.ts`, `app/dice-skins.css`, `Achievements.tsx`, `page.tsx` | 테스트, 온라인 주사위에 흑요석 적용 확인 |
| 8 | 유물 발동 횟수 | 여정 도감 유물 카드에 "발동 N회"(이 기기 누적, 표시만) | `lib/relic-tally.ts`, `RpgEquippedRelics.tsx`, `RpgCodex.tsx` | 테스트 |
| 9·10 | 요트다이스 초대 링크·반응 | 대기실 "초대 링크 보내기"(`/?yacht=코드`, 폰은 공유 창). 링크로 들어오면 멀티 창이 요트다이스+코드로 열림. 고정 이모지 6개 반응(자리당 1.2초 간격, 5초 표시). 반응이 다른 사람의 굴리기를 막지 않도록 "판 진행 키"로 오래된 화면만 거절 | `lib/yacht-room.ts`, `yacht-room-server.ts`, `YachtOnline.tsx`, `yacht-online.css`, `page.tsx` | 테스트, 390×844에서 링크·대기실·반응 확인 |
| 12 | 로컬 DB 표 | `node scripts/local-db-setup.mjs`(`pnpm db:local`): 로컬 개발 D1에 drizzle 표 생성. 운영 DB는 건드리지 않음. 이 PC 로컬 DB에 한 번 실행함 | `scripts/local-db-setup.mjs`, `package.json` | 실행 후 로컬 대결·오늘의 판·요트 방 동작 |
| 13 | 요트 자동 시험 | `node scripts/e2e-yacht-online.mjs 2|3`: 켜진 개발 서버에 클라이언트 2~3개로 방 만들기→참가→반응→한 판 끝까지→전적→새 판 | `scripts/e2e-yacht-online.mjs` | 2인·3인 모두 통과. Playwright가 없어 브라우저 UI 자동 시험은 아님 |
| 14 | 다음 그림 미리 불러오기 | 지도에 있는 동안 다음 스테이지의 전·퀘스트·후 그림을 한가할 때 미리 받음 | `lib/rpg-chapters.ts`(`stageArtToPreload`), `RpgJourneyScene.tsx` | 테스트 |

**15번(아이템전·직업 코드 삭제)은 하지 않음.** 아이템전·직업 관련 모듈을 가져다 쓰는 파일이 60개가 넘고, 핵심 대결 코드 `lib/game.ts`와 RPG 저장·전투(`rpg-game.ts`의 직업 인자, 유물 목록 `item-battle-relics.ts`)에 얽혀 있다. 지우려면 저장 호환을 따로 설계해야 해서 별도 작업으로 남김.

전체 테스트: 405개 중 387 통과·실패 0·건너뜀 18. 타입 검사 통과.

### Codex 그림 수정 검수 (밤)

Codex가 2차 검수 6장(`st6-before`, `st6-after`, `dice-den`, `st5-before`, `true-ending-village`, `quest-9`)과 성화의 영역 지도(요청서 A)를 다시 그렸고, 지도에 맞춰 `lib/rpg-journey.ts` 지역 2 세로 좌표와 `RpgJourneyScene.tsx` 점선 경로를 고쳤다(기록: `local-art-consistency-2026-11-11.md`, `local-region-2-map-paths-2026-11-11.md`).
- 7장 모두 요청과 맞다. 지도 길은 폭포 탁자(ST4) → 왼쪽 계단 → 다리 쉼터(ST5) → 오른쪽 계단 → 회랑(ST6)으로 이어진다. 375×812에서 장소 7곳이 그림 속 제자리에 있다.
- 같은 날 이 세션에서 고친 두 파일(유물 자리 수, 그림 미리 불러오기)과 Codex의 좌표 수정이 모두 남아 있음을 확인했다.
- 작은 점: ST6 승부 전 탁자의 패 4장은 앞면 무늬가 없는 민짜다(뒷면처럼 보임). 원+십자 문양은 계속 장식으로 쓰인다.
  - 후속 사용자 승인으로 ST6 패 4장에 왕관·철문·성화·열쇠 앞면 문양을 각각 적용 완료. 기존 인물·배경·장식 유지, PNG/WebP 로컬 교체. [이번 작업·검증](local-st6-face-up-2026-11-11.md).
- 확인 후 전체 테스트 405개 중 387 통과·실패 0·건너뜀 18, 타입 검사 통과.

## 2. 그림으로 남은 것

- A(성화의 영역 지도)는 위와 같이 반영됨. B(스테이지별 승부 직전 클로즈업 7장, 선택)는 아직 안 그림.

- [codex-art-request-2026-11-11-maps-closeups.md](codex-art-request-2026-11-11-maps-closeups.md): A. 성화의 영역 지도 길 순서 고쳐 다시 그리기(필수), B. 스테이지별 승부 직전 클로즈업 7장(선택).

- 주사위판 장면 그림 `dice-den`: 탁자 위 4개 + 하로 손에 1개. 프롬프트는 "탁자 위 5개"였다. 다시 뽑아야 한다(그림 피드백 6번 표 3번).

## 3. 검토했지만 결정 대기 (바꾸지 않음)

- 유물 수치 조정(B안): 미승인.
- 가로 화면 그림: 지금은 기존 임시 그림. 세로로 써 본 뒤 결정.
- 컷씬 전용 잔잔한 배경음: 나중에 곡이 생기면 다시 논의.
- 원+십자 문양: Codex가 장식으로 유지했다(사용자 반대 없음).
- 아이템전·직업 코드와 건너뛴 테스트 18개: 최종 배포 때 삭제.

## 4. 그림 (Codex 요청용)

[rpg-st4-10-art-feedback.md](rpg-st4-10-art-feedback.md)의 **2차 검수** 절을 그대로 넘긴다. 다시 뽑을 6장: `st6-before`, `st6-after`, `dice-den`, `st5-before`, `true-ending-village`, `quest-9`.

## 5. 아직 확인 못 한 것

- 실제 휴대폰에서의 조작·소리.
- 지역 4 지도 캡처의 "갈라진 거울 발동" 알림 2번: 테스트 메뉴로 스테이지를 연달아 넘겨 겹친 것으로 보이며, 실제 플레이로는 확인 안 함.
- Codex가 고친 코드(지도 세로 좌표, 수호자 초상 연결, 엔딩 첫 그림)는 화면 캡처와 테스트로만 확인했고 코드는 따로 읽어 보지 않았다.
- PC·폰 가로 화면에서 새 0.7.12를 직접 보지 않았다(Codex 캡처만 봄).
