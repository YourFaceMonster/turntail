# 아이템전 코드 정리 2단계 (로컬 · 2026-11-15)

사용자 지시: "13이어서다해줘". 범위는 사용자가 고른 "죽은 분기만 삭제"(스토리가 쓰는 파일 이름은 그대로 둠). 빌드·배포 없음.

## 왜 지워도 되는가
- 아이템전 게임은 `createHpItemGame`으로만 만들어졌고, 앱은 이 함수를 더 이상 부르지 않았다(1단계 0.7.26에서 메뉴 제거).
- 옛 아이템전 저장은 이어하기 목록에서 이미 숨겨져 있었다.
- 따라서 `game.hpItemMode`가 참인 분기는 실행될 수 없는 코드였다.

## 지운 것
- `Game` 필드: `hpItemMode`, `hpItemVariant`, `hpItemRules`, `hpItemMatch`, `completedBattles`, `floorCoins`.
- 파일(lib): `hp-item-mode`, `floor-coins`, `coin-presentation`, `item-battle-bot`, `item-battle-ai`, `item-battle-plan`, `item-battle-shopping`, `item-battle-public-relics`, `hp-item-skills`, `hp-item-characters`, `hp-round-totals`, `hp-item-summary`.
- 파일(app): `HpItemShop`, `HpRoundBreakdown`, `FloorCoins`, `HpCharacterSkills`.
- `game.ts`: 아이템전 상점·돈 정산·HP 전투·바닥 동전·아이템전 AI 분기.
- `page.tsx`: 아이템전 저장 상태, 상점 화면, 결과 화면, 동전 표시, 아이템전 머리글·규칙 안내.
- `hp-item-battle.ts`는 스토리가 쓰는 전투 이벤트 타입과 연출 시간 상수만, `hp-item-shop.ts`는 스토리 HP 표시 함수 2개만 남김.
- `HpItemMatch.tsx`의 `HpItemResult`는 옛(개편 전) 스토리 판 정산 화면으로만 남김.
- 테스트: 아이템전만 검사하던 13개 파일과 개발 도구 `tools/measure-profession-balance.ts`를 지움. 스토리와 섞인 테스트는 아이템전 경우만 걷어냄(`profession-immediate-071` 5개, `profession-round-070` 4개, `rpg-rework` 2개 테스트 제외).

## 남긴 것
- 옛 아이템전 저장(`turntale-hp-items-2-v1`)은 저장 관리 목록에 "아이템전 · 종료된 모드"로 보여 삭제할 수 있다. 이어하기는 여전히 안 됨.
- 스토리가 쓰는 `item-battle-rules`, `item-battle-relics`, `rpg-items`, `profession-*`, `rpg-profession-combat` 파일 이름은 그대로(사용자 선택).
- 1단계 전 백업: `git stash list`의 `before item-battle phase 2 (2026-11-15)`.

## 확인
- TypeScript 통과. 전체 테스트 404개 통과(아이템전 테스트를 지워 432 → 404). 프로덕션 빌드 성공.
- 375×812 화면 테스트 ST5 대결에서 패를 내고 AI가 받아치는 것까지 확인. 콘솔 오류 없음(자동 클릭으로 인한 진동 차단 경고만).
