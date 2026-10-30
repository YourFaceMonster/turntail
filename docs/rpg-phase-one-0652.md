# RPG 1차 개발 · 0.6.52 로컬

2026-10-30 사용자 RPG 1차 개발 지시서 적용. 기준 커밋은 배포된 0.6.51의 `80d024a0bd3e3ecb25dde0533b5366d32377c556`이다. **프로덕션 빌드·배포·게시·push는 실행하지 않았다.** 이번 검증과 과거 배포 기록을 구분한다.

## 구현

- 새 RPG: 직업 선택 → 시작 유물 ‘금이 간 심장’ → 스테이지 1 → 보상 선택 → 2 → 3 → 개발 구간 완료. 기존 RPG 시범 저장은 이전 규칙으로 읽는다.
- 플레이어 HP 100, 적 초기 HP는 70/70 → 75/75 → 85/85. 숫자는 `lib/rpg-phase-one.ts`에 모았다.
- 적 HP 0은 손패 제거·차례 제외·결투 결과 제외로 처리한다. 좌석 ID는 유지해 아이템 소유자와 연출 대상이 바뀌지 않는다. 살아 있는 참가자의 패와 현재 바닥은 그대로 유지한다.
- 2인 전환 시 진행 중인 패는 재분배하지 않는다. 이후 손패 소진으로 새 카드 판을 시작할 때만 기존 2인 분배(각 12장, 6열 바닥)를 사용한다. 퇴장한 좌석은 새 패를 받지 않는다.
- 두 적 HP 0에서만 클리어, 내 HP 0이면 실패한다. 아이템전의 ‘첫 HP 0에서 대전 종료’ 분기는 유지한다.
- 클리어 기본 회복은 최대 HP의 10%. 기존 등불 보너스 +5, 시험 조합 보너스 +2를 차례로 적용하고, 선택한 추가 회복 +20은 그 뒤에 적용한다. 모두 HP 100 한도다.
- 보상은 유물 1개 / RPG 주화 30 / 추가 회복 20 중 하나. 보상 미선택·중복 선택·3 이후 진입을 막는다. 선택 이력도 RPG 저장에 남긴다.
- 기존 유물 8종만 후보로 사용한다. 시작 1개, 최대 6개, 보유 유물 모두 자동 적용. 가득 찼으면 기존 유물 교체 또는 새 유물 포기. 실패 시 여정 유물은 비우고 발견·해금 기록은 유지한다.
- 시험 조합 1개: 금이 간 심장 + 회복의 등불 = ‘지켜낸 등불’, 클리어 회복 +2. 재료는 소모하지 않으며 하나가 빠지면 해제된다.
- 기존 네 직업, 스킬 수치·기본 연출·전투 유물 효과를 재사용한다. RPG 게이지는 시작 1칸, 결투 3회마다 +1, 스테이지 사이 이월. 기존 아이템전의 판 종료 충전은 변경하지 않는다.
- AI 카드 판단은 기존 것을 재사용한다. RPG 카드 판단에 살아 있는 참가자만 전달하고 좌석을 변환한다. 새 RPG의 3스테이지 AI도 다른 손패를 공유하지 않는다. 기존 시범 RPG의 특수 규칙은 별도 유지한다.
- 새 RPG의 시작 소모품은 나·AI 모두 0개다. 이전 시범판의 AI 무료 아이템 5종 지급은 새 RPG에 적용하지 않는다. AI 아이템 판단 자체는 보유 아이템이 있을 때 기존 코드로 동작한다.
- 준비 상점에는 기존 응급 약초 30주화, 작열탄 45주화만 연결했다. 각 1개 재고를 여정 내 유지한다. 별도 경제·스토리·보스 능력·XP·레벨·4~10스테이지는 추가하지 않았다.

## 저장

새 진행 키는 `turntale-rpg-journey-phase1-v1`이다. 기존 `turntale-rpg-state-v1` 원문은 새 여정을 저장할 때 덮어쓰지 않는다. 새 키가 없을 때 기존 RPG 저장을 읽고, 새 키가 생긴 뒤에는 새 여정을 우선 표시한다. 기존 저장의 발견·해금 기록은 새 기록에 합친다. 일반전·아이템전 키는 쓰지 않는다.

기존 RPG 진행 원본은 보존되지만 새 여정 생성 후 기존·새 RPG를 동시에 고르는 추가 메뉴는 만들지 않았다. 새 여정이 끝나도 이전 진행을 자동으로 다시 노출하지 않는다.

## 변경 파일

| 영역 | 파일 | 핵심 변경 |
|---|---|---|
| 새 진행 규칙 | `lib/rpg-phase-one.ts` | 스테이지·퇴장·클리어·보상·조합·RPG 게이지 데이터와 처리 |
| 전투 연결 | `lib/game.ts`, `lib/rpg-game.ts`, `lib/rpg.ts` | 모드 분기, 생존자 턴·분배, 새 여정 생성과 다음 판 |
| 효과·AI | `lib/rpg-profession-combat.ts`, `lib/profession-actives.ts`, `lib/item-battle-rules.ts`, `lib/rpg-items.ts`, `lib/local-bot.ts` | RPG 피해 이후 퇴장 정리, 생존 대상, 기존 효과 재사용, 공개 정보 카드 판단 |
| 결투 표시 | `lib/hp-item-battle.ts`, `lib/hp-battle-summary.ts` | RPG 퇴장 좌석의 후속 결투 결과 제외. 기존 아이템전에는 제외 목록 없음 |
| 저장 | `lib/rpg-storage.ts`, `lib/save-slots.ts` | 별도 키, 이전 저장 호환, 이어하기·선택 삭제의 정확한 키 연결 |
| 화면 | `app/page.tsx`, `app/components/RpgStageResult.tsx`, `app/components/RpgJourney.tsx`, `app/components/SinglePlayer.tsx` | 기존 메뉴·모달 흐름에서 시작 유물, 결과·보상·상점·다음 스테이지 |
| 정보 | `app/components/RpgHeaderStats.tsx`, `app/components/RpgProfessions.tsx`, `app/components/ProfessionActives.tsx`, `app/components/RpgEquippedRelics.tsx`, `app/components/RpgTacticalPouch.tsx` | RPG 전용 설명·게이지·6개 유물·조합·퇴장 대상 제한 |
| 스타일 | `app/rpg-phase-one.css`, `app/layout.tsx` | RPG에 한정된 퇴장 표시·유물 6슬롯·보상 반응형 배치 |
| 버전 | `lib/version.ts`, `package.json` | 로컬 0.6.52. 잠금 파일·의존성·pnpm 지정 유지 |
| 검사 | `tests/rpg-phase-one.test.ts`, `tests/rpg-stage-ui.test.tsx` | 상태·전투 경계·저장·UI 출력 검증 |

실행 결과·실제 브라우저 확인 범위·캡처·미검증 항목은 워크스페이스 루트의 `TURNTALE_RPG_PHASE1_REPORT.md`를 따른다.
