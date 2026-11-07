# 2026-11-07 RPG 장성룰 개편 — 로컬 구현·검증

## 작업 상태

- 기준: main / 0.7.1 / HEAD 37b131525f911c7d065dd4d6d8d62441bd4181d4. 시작 시 미커밋 변경 없음.
- 첨부 TurnTale_RPG_Rework_Codex_2026-11-07.md의 확정 규칙 적용. 앱 진입점은 createRpgJourneyGame이며 새 RPG만 rework.version=2로 구분한다.
- 로컬 파일 저장만 수행. 운영 빌드, 로컬 커밋, GitHub push, Cloudflare 배포 없음. package.json/lib/version.ts 및 pnpm@11.25.0/잠금 파일 유지.
- 기존 프롤로그·컷씬·NPC 원화·BGM·지도·퀘스트 장소·이야기 패/도감 식별자 보존. 새 이미지·미구현 ST4~10 장면은 만들지 않았다.

## 변경 파일과 이유

| 파일 | 주요 변경 |
|---|---|
| lib/rpg-rework.ts (신규) | RPG 전용 장성룰 정산, 동률 정책, 11종 유물, 최대 HP, 정찰/선견지명, 후보·계승·10스테이지 시험 HP |
| lib/game.ts | 새 RPG에만 12/18장 분배·바닥24장/4×3 적용, 활성 seat 정산, 확정 트릭 정찰·비공개 바닥뷰. 기본 정산·분배 유지 |
| lib/rpg-game.ts | 새 여정 v2 초기화, 기존 판 종료 후 다음 분배 전환, 다음 스테이지 HP 연결 |
| lib/rpg.ts | v2 상태 타입·최대 HP 최초 활성화 연결, 새 RPG 상점/소모품 경로 차단. 공유 카탈로그 보존 |
| lib/rpg-phase-one.ts | 보상 선택을 새 유물 전용 처리로 분기, 새 RPG 중간 HP 탈락·조합 회복 차단 |
| lib/rpg-items.ts | 새 RPG 전투 아이템 차단, seat별 개인 정찰뷰, AI도 본인 확인 패로만 외곽 취득 판단 |
| lib/rpg-storage.ts | 구 저장 pendingRework 표시, 첫 후속 저장 전 원문 백업, 중복 전환 방지, 완료 여정 원본 lastCompleted 보관 |
| lib/rpg-demo-catalog.ts | v2 보상 후보를 구 아이템전 유물로 복구하지 않도록 분리 |
| lib/rpg-journey.ts | 여행자 돕기/편지 회복/세린 재화 제거, 장착 HP 계산. 퀘스트 플래그·푸른 유리 퀘스트 획득 보존 |
| lib/rpg-preview.ts | 저장 없는 기존 화면 테스트를 새 규칙에 연결, 2인 18장 화면, 결과 HP 기준 기록 보정 |
| app/components/RpgReworkResult.tsx (신규) | 단일 판 정산창에 활성 참가자 순위·잔여패·예정 HP 정산·실제 HP 및 유물 선택 표시 |
| app/components/RpgStageResult.tsx | 새 결과창 분기와 기존 이야기/승리 후 장면 유지 |
| app/components/RpgJourney.tsx, SinglePlayer.tsx | 새 RPG 직업 선택 제거, 12/18/24 안내 |
| app/components/RpgJourneyScene.tsx | 새 RPG 주화·소모품·상점 UI 제거, 여행자·편지 대사 최소 변경, 푸른 유리/유물 설명·소문·후보 미리 보기 |
| app/components/RpgEquippedRelics.tsx, RpgHeaderStats.tsx, RpgStatusPanel.tsx | RPG v2 효과 설명·개인 HP 상한, 재화·직업 표시 제거 |
| app/components/RpgPreviewTools.tsx | 테스트 모드의 2인전·18장 바로 보기 |
| app/page.tsx, app/rpg-phase-one.css | 새 RPG 아이템/직업 효과/주화 버튼 제거, 본인 정찰 층 표시, AI 개별 HP 상한. 바닥 크기 계산 유지 |
| tests/rpg-rework.test.tsx (신규) | 새 규칙·실제 엔진·저장·스토리·화면 검사 27개 |
| tests/fixtures/legacy-rpg-journey.ts (신규), legacy-profession.ts | 구버전 저장 호환 검사용 생성/진행 fixture. 실제 새 여정은 위 신규 검사에서 직접 검증 |
| tests/blue-glass, journey-*, rpg-demo-items/dialogue/journey/preview/prologue/shop-cart/starting-supplies/story-cards/village-shop, stage-all-rewards | 주화·직업·운명력 관련 이전 규칙 검사를 구 저장 fixture로 명시해 유지 |
| tests/rpg-phase-one.test.ts | 저장 읽기의 pendingRework 메타데이터 기대값 갱신 |

공유 hp-limit.ts, bot.ts, 독립 item-battle-* 정의, 폭탄시장전 엔진은 수정하지 않았다. lib/game.ts의 기존 분배/정산 경로도 조건부로 보존했다.

## 정산·유물 실제 검사

| 입력 | 결과 |
|---|---|
| 3인 0·4·8장 / HP 60·50·50 | +12/+4/−16 → HP72/54/34 |
| 공동 2등 5·0·5장 | −5/+10/−5 |
| 2인 0·7장 / HP70·0·10 | +7/0/−7 → HP77/0/3 |
| 3인 HP80·10·30, 잔여0·8·4 | HP92·0·34 → 다음 판18·0·18장 + 바닥24장 |
| 금이 간 심장 HP60/100 첫 장착 | 80/120; 해제/재장착은 반복 회복 없음 |
| 심장 두 개 | 최대130, 해제 시 현재 HP를 새 상한으로 제한 |
| HP0 + 마지막 매듭 | 부활 없음, 실패 우선 |
| 저장 후 동일 결과 재정산 | HP·보상 중복 없음 |

페어1/트리플2/일반5장3/포카드4/스트플5, 5장 장갑+1을 트릭 승리 확정 후 적용. 마지막 손패 소진은 불필요한 정찰을 생략하고 다음 판 선견지명3(모래시계5)을 저장한다. 푸른 유리는 매 판 추가1장. 위·아래층 미확인 숨김 패를 중복 없이 개인에게만 공개하고 취득/판 종료 시 만료한다. AI 판단에는 redacted view와 해당 seat의 정찰만 제공한다.

일반 보상2택1, 챕터 보스3택1, 갈라진 거울+1, 후보 부족 시 가능한 만큼 제공한다. 푸른 유리/주화·공격·독립 아이템전 전용 유물은 일반 풀에서 제외한다. 챕터 초기화는 100/100·계승1개 뒤 최초 장착 효과를 적용하며 도감·해금·이야기는 유지한다. 실제 데모는 ST3에서 종료하며 마지막 선택과 퀘스트 상태는 archive.lastCompleted에 보관한다. ST4~10은 수치·순수 전환 함수만 준비했다.

## 이번 실행 결과

| 검증 | 결과·한계 |
|---|---|
| 새 RPG 검사 | 27/27 통과 |
| 전체 검사 | 338개: 291 통과 / 47 실패 |
| 변경 전 백업 소스 전체 검사 | 311개: 264 통과 / 47 실패. 최종 전체 실패 이름 47개가 모두 동일, 추가 실패0 |
| 최종 작은 수정 후 관련 검사 | RPG 신규/기존·미리보기·저장 슬롯 37/37 통과 |
| TypeScript | noEmit 통과 |
| git diff --check | 통과 (Windows 줄끝 정규화 안내만 있음) |
| 실제 Chrome | 로컬 127.0.0.1:5173, 신규 안내·직업 선택 생략·2인 18장·탈락 AI·장갑 효과·주화 버튼 제거 확인 |
| 모바일 크기 | 390×844 세로와844×390 앱 가로 모드 확인. 18장 자동 선택으로 풀하우스5장 선택·제출. 바닥12스택 유지 |
| 결과 화면 | 단일 HP 정산·공동2등·유물2후보 브라우저 확인 |
| 운영 빌드/공개 사이트/실제 Android·iOS | 실행하지 않음 |

테스트 로더는 현재 존재하는 scripts/register-tests.mjs 사용. 과거 README의 tools/register-tests.mjs는 실제 경로에 없었다. 기존47실패에는 Bomb의 오래된 인원 기대값과 Windows의 next/link CommonJS 해석 오류, 옛 화면 문자열 기대값 등이 포함된다. 이번 작업으로 이를 수정하지 않았다. 전체 결과를 모두 통과로 표현하지 않는다.

전체 비교는 시작 시 clean HEAD와 같은 editable-source 백업의 app/lib/tests/docs를 FS 읽기 overlay로 로드해 같은 node_modules·현재 불변 자산·테스트 명령으로 실행했다. 재현 loader는 local-backups/rpg-rework-2026-11-07/baseline-loader.mjs다. 처음 탐색적 실패 로그와 마지막 회귀 로그를 분리 보관했다.

증거: artifacts/rpg-rework-tests.txt, rpg-rework-regression-final.txt, rpg-rework-baseline.txt, rpg-rework-final-targeted.txt, rpg-rework-typecheck.txt. 화면: rpg-rework-390x844.png, rpg-rework-landscape-844x390.png, rpg-rework-result-390x844.png.

## 밸런스 결과 — 목표 판수 미충족

강제 종료·추가 공격·HP 자동 조정을 넣지 않았다. 다음은 플레이어도 같은 판단 정책으로 자동 플레이한 표본이며 사람 플레이테스트와 구분한다.

- level1 저비용 정책5회: 완료/실패한 구간에 27~256판.
- level3 정책3회: ST1 16/58/119판, ST2 48/68/141판, ST3 관측23/365판(모두 해당 단계 실패 포함).
- 운영 chooseBotAction 실제 판단1회:1000행동 동안 ST1 43판, HP100/0/8로 계속 진행 중. 관찰 예산 종료이며 게임을 강제로 종료하거나 클리어하지 않았다.
- 1등뿐 아니라3인전2등도 HP를 얻고, 2인전에서는 비슷한 실력끼리 HP를 되돌려 받는 구조라 장기화 가능성이 크다. 이는 원인에 대한 추론이며 통계적 밸런스 확정은 아니다.

일반3~5판/보스5~7판 목표는 현재 검증 표본에서 달성되지 않았다. 수치/정산식은 요청 확정값 그대로 두었다. 실제 사람과 AI의 추가 플레이테스트 및 별도 기획 결정이 필요하다.

## 사용자 검토용 구현 기본값

1. 같은 잔여 패수는 공동2등, 서로 지불 없이 각자 잔여패만 1등에게 지불.
2. 두 번째 반지는3인전2등(공동2등 포함)에만 적용, 2인 패자에게 적용하지 않음.
3. 선견지명은 같은 스테이지 다음 판에만 유지. 스테이지 종료 때 만료.
4. 여행자: ‘응급 약초 1개를 건넨다’→‘여행자를 돕는다’; 아이템/주화 조건 제거, 기존 도움 컷·파수탑 단서 플래그 유지.
5. 편지: 주화30→HP5 회복 + 기존 유물 소문. 완료 플래그로1회만 적용.
6. 세린: 기존3판·순위·승패 반응·재대결 유지, 주화 지급/주화 보상 화면 제거. 일반 미니게임 패 분배/점수 규칙은 보존.
7. 피오의 잡화점 권유는 광장 승부 안내로 대체. 벽난로는 무료 반복 회복을 추가하지 않고 기존 서술만 유지. 모르의 깃펜 장착 시 주점 피오 열람으로 기존 등불 소문을 추가 기록.
8. 기존 푸른 유리/등불 소문 본문 중 약초·조합 효과 설명만 새 효과로 교체. 원래 카탈로그와 이전 저장용 대사 정의는 보존.
9. 쌍침 나침반은 준비 중 다음 스테이지의 실제 후보 시드·풀을 그대로 미리 계산. 미리 보기 때문에 보상을 지급하지 않음.

## 저장·백업·롤백

- 소스 전체 Git 아카이브: ../local-backups/rpg-rework-2026-11-07/source-before.zip. 편집 가능 원본: 같은 폴더 editable-source/. 현재 사용자 저장·첨부·node_modules 정션·배포 보관본은 삭제/이동하지 않았다.
- 기존 RPG를 읽으면 인메모리 pendingRework만 추가한다. 원래 저장 키의 JSON은 읽기만으로 바꾸지 않는다.
- 기존 진행 중 판은 기존 계산으로 마친다. 다음 분배(또는 다음 스테이지 준비 완료 뒤 진입)에서만 v2로 전환한다. 구 전투·주화·소모품 효과를 새 판에 혼합하지 않는다.
- 기존 저장이 있는 첫 후속 저장 전에 원문 전체를 turntale-rpg-before-rework-v2에1회 백업한다. 백업 쓰기 실패 시 현재 저장을 덮어쓰지 않는다. v2 저장은 다시 불러와도 재초기화/유물 회복/정산/보상 반복 없음.
- 구 유물은 새 효과가 있는 것만 전투 소지/장착으로 이전하고 발견 도감·해금·퀘스트·이야기 플래그는 보존한다. 제거된 소모품/주화 원본은 백업 JSON에 남는다. 기존 HP는100 범위로 보존한 뒤 심장 첫 활성화를 적용한다.
- 롤백 시 먼저 현재 로컬 작업/브라우저 저장을 별도 보관하고 소스 아카이브와 비교해 필요한 변경 파일만 복원한다. 브라우저 저장은 동일 origin의 백업 JSON을 기존 RPG 키로 복구한다. 독립 아이템전·기본 전적 키를 덮어쓰지 않는다.
- GitHub/Cloudflare 및 Sites에 접근·저장·게시하지 않았다. 다음 배포 버전 상승과 운영 빌드는 별도 요청 시 수행한다.
