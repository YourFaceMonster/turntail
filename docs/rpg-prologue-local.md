# RPG 프롤로그 · 로컬 구현 (2026-11-01)

작업 시작 시 실제 로컬은 **0.6.57**. 기존 `README.md`, `SinglePlayer.tsx`, `lib/version.ts`, `package.json`, `docs/local-0.6.57.md` 미커밋 변경을 보존했다. 버전 번호·잠금 파일은 이번에 바꾸지 않았다. 빌드·커밋·push·원격 저장·배포는 하지 않았다.

## 이번 변경 파일

| 파일 | 변경 |
|---|---|
| `app/page.tsx` | 기존 새 RPG 임시 객체를 자동 프롤로그에 연결. 기존 시작 유물 안내 패널을 대체. 시작 입력에서 오디오 활성화, 컷씬 중 메뉴 음악 정지, 종료 후 기존 음악 복귀. 같은 객체의 저장·입장 중복 방지 |
| `app/components/RpgPrologue.tsx` | 전체 화면 컷씬, 하단 자막, 탭·키보드 진행, 스킵/Escape, 포커스 제한, 이미지 사전 로드, 가시성·pagehide/pageshow 대응 |
| `app/rpg-prologue.css` | 설원·주막·3인 탁자·낡은 패·석비 임시 미술, 눈발·느린 줌·패 뒤집기·암전 페이드, 모바일 가로/세로 배치와 동작 줄이기 |
| `app/layout.tsx` | 프롤로그 CSS 연결 |
| `app/components/RpgStory.tsx` | 옛 수동 오프닝과 역사 설명을 새 프롤로그로 연결. 기존 야영지/보스 대화 유지 |
| `lib/rpg-prologue.ts` | 1회차 68초 타임라인, 2회차 준비 데이터·연결 인터페이스, 일회 종료·가시 시간 시계 |
| `lib/rpg-prologue-audio.ts` | 기존 AudioContext·효과음 버스·패 접촉음을 재사용. 짧은 자체 합성 바람/장작 및 조용한 주막 선율. 음악·효과음 설정 독립 적용, 정리 시 소스 중지 |
| `tests/rpg-prologue.test.tsx` | 타이밍·스킵·중복 저장·배경 정지·첫 패 보존·동일 문양·음소거/오디오 실패 검증 5개 |
| `docs/rpg-prologue-local.md` | 이 보고서 |

루트 `README.md`에도 이번 로컬 작업의 시작점을 추가했다.

## 진입과 저장

싱글플레이 → RPG 모드 → 새 RPG 여정 시작 → 프롤로그 → 기존 달 영역 지도 → ST1 별빛 관문. 자연 종료와 스킵은 동일한 기존 `saveRpgGame`/`launchPreparedGame` 루틴을 한 번만 실행한다. 시작 유물은 기존 생성 코드가 지급하며 마지막 컷에서 이름을 안내한다. 이야기 속 낡은 2는 시각 소품뿐이다. 전투 손패·아이템·유물·보상에 넣지 않았다.

기존 저장 형식·키·전투·AI·지도·튜토리얼은 변경하지 않았다. 기존 저장 이어하기는 프롤로그를 거치지 않는다. 현재 시청 기록이 없어 새 여정마다 1회차를 재생하며, 시청 플래그를 임의로 추가하지 않았다. 새 여정 교체 확인은 기존 동작을 사용한다. 컷씬 도중 페이지를 완전히 종료하면 아직 저장되지 않은 새 여정은 확정되지 않고 기존 저장은 유지된다.

일반 엔딩 완료 플래그와 엔딩 패 전달 장면이 현재 없다. ST3 개발 구간 완료를 일반 엔딩으로 해석하지 않는다. `prologueCuts({normalEndingCleared,handoffSceneReady})`는 두 선행조건이 모두 충족될 때만 2회차 데이터를 반환한다. 실제 앱은 현재 **FIRST_PROLOGUE만 재생**한다. 2회차 대본/컷 데이터는 준비했고 받는 사람 시점의 완성 아트·엔딩 연결은 보류했다. 엔딩 시스템은 확장하지 않았다.

## 이번 실행 검증

- 프롤로그 신규 **5개 통과**: 68초 자동 진행·1/2회차 선행조건, 자연 종료/모든 컷 스킵의 일회 저장·ST1 첫 패 보존, 백그라운드/화면 잠금 대응 시계, 모든 컷 정적 렌더·패/석비 문양 일치, 음악/효과음 분리·음소거·재생 준비 실패 시 안전 종료.
- 기존 `rpg-journey`, `rpg-phase-one`, `rpg-profession-combat`, `atmosphere-audio` **4개 파일 통과**.
- 추가 기존 `rpg-stage-ui`, `rpg-items`, `match-rules` **3개 파일 통과**. 합계 이번 검사 **12개 통과**(신규 세부 검사 5개 + 기존 파일 7개).
- 추가 `hp-item-battle.test.ts` **1개 실패**: 폐기된 전술 아이템 기대에서 `보유한 전술 아이템을 확인해 주세요.`. 해당 엔진/테스트는 HEAD와 변경이 없으며, 이 파일의 과거 실패 기록은 `docs/local-0.6.33.md`와 루트 `artifacts/publish-0656/regression-comparison.json`에도 있다. 이번 전체 152개 재실행을 의미하지 않는다.
- 최종 TypeScript `--noEmit --incremental false` 통과. 신규 코드·테스트 대상 ESLint 오류 0. `RpgStory.tsx`는 기존 `<img>` 최적화 경고 1개, 오류 0. 전체 앱 린트는 실행하지 않았다.
- PostCSS로 새 CSS 80개 규칙 구문 확인, 재사용 배경 2개 존재 확인, `git diff --check` 통과.
- 첫 `node --test`는 샌드박스 하위 프로세스 `spawn EPERM`으로 실행되지 않았고, 승인 후 동일 명령으로 위 9개 검사를 통과했다. 후속 신규 검사 5개도 다시 통과했다.
- **실제 브라우저 실행·모바일 세로/가로·PC 시각·실제 청감·브라우저 자동 재생 차단·실기기 화면 잠금/복귀는 미검증**. 브라우저 도구가 `Local browser use is disabled in Work settings`를 반환했다. 단위 검사·정적 렌더 통과를 실제 화면 검증으로 표현하지 않는다. 개발 서버·운영 빌드를 이번에 실행하지 않았다.

## 미술·사운드 교체와 남은 확인

현재는 플레이 흐름을 우선 연결한 임시 미술이다. 설원·먼 주막·인물·손·패·석비는 CSS/인라인 SVG이며 완성 일러스트가 아니다. 주막 내부는 `/turntale-empty-room-portrait.webp`, 본편 연결은 `/environments/stage-1-0520.webp`를 재사용한다. 최종 교체 위치는 **`app/components/RpgPrologue.tsx`의 `ProloguePicture`/`Traveler`/`StoryTile`/`TwoCrowns`**, **`app/rpg-prologue.css`의 `.prologue-landscape`/`.prologue-inn`/`.prologue-company`/`.prologue-hand`/`.prologue-stone`**다.

교체 파일의 권장 정확한 경로(현재 파일은 없으며 연결을 변경할 때 추가):

| 예정 파일 | 사양 |
|---|---|
| `public/prologue/snow-pass.webp` | 설원 고갯길, 1920×1080 이상, 세로 중앙 크롭과 하단 자막 여백 고려 |
| `public/prologue/roadside-inn.webp` | 같은 설원·작은 주막의 따뜻한 창문, 같은 크롭 기준 |
| `public/prologue/finished-table.webp` | 승부 직후의 평범한 3인 탁자, 긴 UI/문자 없이 구성 |
| `public/prologue/story-two-front.webp`, `story-two-back.webp` | 각 512×768 이상. 낡은 빨간 2, 같은 가장자리 마모·오른쪽 아래 파손·흠집. 뒷면 겹친 두 왕관, 발광 없음 |
| `public/prologue/crown-stone.webp` | 같은 두 왕관을 새긴 석비. 패와 문양이 정확히 일치해야 함 |
| `public/prologue/ending-handoff-receiver.webp` | 정식 일반 엔딩 확정 후 같은 장소·복장·탁자·패를 받는 사람 시점으로 제작 |

합성 바람·장작·짧은 주막 선율은 `lib/rpg-prologue-audio.ts`에 있고 외부 음원은 사용하지 않았다. 최종 자체 제작 음원으로 교체한다면 `public/audio/prologue-wind.ogg`, `prologue-hearth.ogg`, `prologue-tavern.ogg`에 두고 이 모듈에서 연결한다(현재 미존재/미연결). 실제 청감 확인 뒤 전환의 음량·여운을 조정해야 한다.

추가 아이디어(이번 구현 제외): 정식 미술 확정 후 교체, 영구 엔딩 기록이 마련되면 2회차 연결, 별도 다시 보기 UI는 후속 범위에서 검토한다.
