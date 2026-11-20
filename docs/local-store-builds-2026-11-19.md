# itch.io 무료판 · 원스토어 웹 게임판 로컬 빌드 (2026-11-19)

## 기준과 범위

- PC `site-publish-checkout/`에서 `git pull --ff-only origin main`: Already up to date.
- 버전 0.7.36, HEAD `ed3e52f`. 클로드의 11-19 미커밋 QA 수정(그림 순차 로딩, 상대 체력 상한, 대사·오류 안내 등)을 포함했다. 해당 변경을 되돌리거나 별도 커밋하지 않았다.
- 이번 산출물은 **로컬 검토판**이다. GitHub push·Cloudflare 배포·스토어 업로드·광고 ID 발급은 하지 않았다. 운영 0.7.36을 갱신한 것이 아니며, 실제 변경 배포 시에는 다음 패치 버전으로 올려야 한다.

## 산출물

폴더: `outputs/stores/0.7.36-2026-11-19T04-02-33-783Z/`

| 대상 | ZIP | 압축 크기 | 압축 해제 크기 | 파일 수 |
|---|---|---:|---:|---:|
| itch.io | TURNTALE-0.7.36-itch-local.zip | 275,518,465 bytes | 276,943,076 bytes | 792 |
| 원스토어 | TURNTALE-0.7.36-onestore-local.zip | 275,519,875 bytes | 276,945,049 bytes | 794 |

ZIP 최상위에 `index.html`이 있다. 두 묶음 모두 itch.io 기본 제한(1,000파일, 해제 500MB, 단일 파일 200MB, 경로 240자)을 확인했다. 파일별 SHA-256은 각 대상 `manifest.json`, ZIP 및 소스 상태는 `source-state.json`에 기록했다.

원스토어 산출물은 **Web 상품용 정적 파일**이며 APK/AAB가 아니다. 원스토어 웹 게임 입점과 HTTPS 호스팅이 필요하다.

## 구현

- `vite.store.config.ts`, `store/`에서 동일한 게임 소스로 두 대상 빌드. 기존 Cloudflare 빌드 명령은 유지했다.
- 하위 경로/CDN에서 실행되도록 배포용 JavaScript 이미지·오디오 경로를 상대 경로로 바꾼다. 소스의 기존 웹 경로는 유지한다. CSS·Worker는 Vite가 상대 주소로 출력한다.
- itch.io판에서는 원스토어 SDK 모듈을 빌드에서 제외한다. 브라우저 검사에서도 SDK 요청 0회를 확인했다.
- 원스토어판은 공식 H5 SDK v1.2.0 초기화·로딩 완료·게임 시작·광고 preload/readiness/show 순서를 연결했다. 일반 브라우저나 SDK 연결 실패에서는 광고 없이 진행한다.
- 광고 대상은 스테이지 전체 클리어, 도전 실패(운명력 재도전 포함), 오늘의 판 종료뿐이다. 일반 판 정산·주점 미니게임·RPG 테스트는 제외한다. 결과 화면에서 다음 진행 또는 나가기 시 요청한다.
- 동일 결과 중복 요청 방지, 3분 간격(자체 운영값), 준비 확인 1.5초 초과 시 생략, no-fill/오류 시 진행. 실제 광고 종료는 SDK 완료 결과를 기다린다. 보상형 광고·추가 보상은 넣지 않았다.
- 진행은 기존 동기 저장 경로를 유지한다. SDK pause/resume에 게임 동작·배경음·AudioContext를 연결하고, exit에서는 최신 여정을 동기 저장한다. 일반 웹/무료판에서는 기존 동기 나가기 흐름을 유지한다.
- API 호출을 `gameFetch`로 통합했다. 기존 웹판은 동일 출처, 배포판은 지정 HTTPS 서버를 사용한다. 서버에는 정확히 등록한 출처만 허용하는 OPTIONS/CORS 처리를 추가했다. 아직 배포하지 않았다.

## 최적화

- public 원본은 1,686,560,355 bytes(약 1.57GiB). 원본 PNG·WAV·보관 HTML/JSON 대부분을 배포 묶음에서 제외하고 WebP·MP3와 아이콘을 보수적으로 포함해 약 264.1MiB로 줄였다(약 83.6% 감소). 원본 파일은 삭제·변환하지 않았다. 구버전 WebP까지 전부 사용 여부를 판정해 제거한 것은 아니다.
- 첫 터치의 효과음 일괄 다운로드를 메뉴 효과음 5종으로 줄였다. 대결 진입 시 나머지를 준비하고, 미준비 효과는 개별 요청하되 늦게 재생하지 않는다. 파일별 디코딩 캐시는 재사용한다.
- JavaScript/CSS 압축·vendor 분리·게임 동적 import. Vite에는 큰 게임 청크 경고가 남아 있다(게임 JS 약 885KB, gzip 약 292KB). 모든 이미지나 음악을 첫 화면에 다운로드하는 구조는 아니다.

## 이번 검증

- 전체 Node 검사 **450/450 통과**: `outputs/store-tests-final-2026-11-19.log`.
- 마지막 광고 유무 분기 보완 후 관련 검사 **19/19 통과**, TypeScript `tsc --noEmit` 통과: `outputs/store-followup-tests-2026-11-19.log`.
- 두 대상 로컬 배포 빌드 통과: `outputs/store-build-delivery-2026-11-19.log`.
- Edge headless, 실제 묶음의 하위 주소에서 세로 390×844·가로 844×390을 검사했다. 메인·싱글·스토리 선택, 새 여정 프롤로그·지도·로컬 저장을 검사한다. 결과/스크린샷은 산출물 `checks/`에 있다.
- API는 검사 중 의도적으로 503 응답으로 대체했다. 실제 온라인 대결·순위 서버 연결이 통과했다는 뜻이 아니다.
- 실제 원스토어 앱·안드로이드 실기기·실광고·입점 심사는 미검증이다. 클로드의 과거 공개 사이트 QA 기록과 이번 검증은 구분한다.

## 실제 게시 전 남은 것

1. itch.io 등록 시 HTML Game, No payments, Mobile Friendly, 클릭 후 실행/전체 화면. 그림·음악의 실제 AI 사용 내역을 AI Disclosure에 기입한다.
2. 원스토어 Web 상품 등록 및 광고 지면 ID 발급. `TURNTALE_ONESTORE_PLACEMENT` 환경변수를 지정하고 다시 빌드해야 실광고 요청을 활성화할 수 있다. 현재 ZIP에는 ID가 없어서 **실광고가 비활성**이다.
3. 정적 게임 파일을 HTTPS로 호스팅하고 원스토어 테스트 URL을 등록한다. 앱 안에서 SDK·중단/복귀·회전·광고 실패·닫기·실제 광고 세 지점을 확인한다.
4. 서버의 `TURNTALE_ALLOWED_ORIGINS`에 실제 itch CDN 및 게임 호스팅 출처를 쉼표로 지정하고 CORS 변경을 배포해야 오늘의 판 순위/멀티가 연결된다. 와일드카드나 모든 itch 페이지를 허용하지 않는다. 현재 운영 서버는 아직 이 변경이 없다.
5. 도메인이 달라지면 브라우저 저장도 별개다. 기존 웹사이트 저장을 자동 이전하지 않는다. 계정 저장 연동은 이번에 추가하지 않았다.
6. 게임 등급·개인정보 안내·광고 SDK 이용/정산 조건은 입점 과정에서 확정한다.

## 다시 빌드/미리보기

이 PC에서는 기본 PATH에 node가 없어 Codex 런타임의 node.exe를 사용한다.

```powershell
& 'C:/Users/SONG/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' --max-old-space-size=6144 scripts/build-stores.mjs
& 'C:/Users/SONG/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' scripts/preview-stores.mjs outputs/stores/0.7.36-2026-11-19T04-02-33-783Z 5189
```

선택 환경변수: `TURNTALE_API_ORIGIN`(HTTPS 출처), `TURNTALE_ONESTORE_PLACEMENT`(원스토어 발급 전면 광고 ID). 새 빌드는 타임스탬프가 붙은 별도 폴더를 만든다. pnpm@11.25.0·잠금 파일·기존 node_modules 정션을 유지했다.

공식 참고: [itch.io HTML5](https://itch.io/docs/creators/html5), [원스토어 IAA](https://onestore-dev.gitbook.io/dev/docs/apps/product/monetization/iaa), [공식 SDK API 자료](https://github.com/ONE-store/onestore_web_sdk_skills/blob/main/skills/onestore-web-sdk/references/sdk-context.md).

## 0.7.40 호스팅 (2026-11-19)
- 원스토어판 호스팅: https://turntale-onestore.pages.dev (Cloudflare Pages, 직접 업로드). 다시 올리기: build-stores.mjs 실행 후 `wrangler pages deploy outputs/stores/<새 폴더>/onestore/game --project-name turntale-onestore --branch main`.
- 서버 허용 주소는 wrangler.jsonc vars에 넣었다. 남은 것: 원스토어 Web 상품 등록·광고 지면 ID 발급 → TURNTALE_ONESTORE_PLACEMENT 지정 재빌드·재업로드 → 원스토어 앱 안 실기기 확인.
## 0.7.41 호스트 (2026-11-20)
- 채팅 삭제판 0.7.41을 다시 빌드해 turntale-onestore에 올렸다(5개 파일 변경). 광고 ID는 아직 없다.

## 0.7.42 광고 ID (2026-11-20)
- 원스토어 전면 광고 지면 ID: xNFN7-Y8TD-MFWV-9ESD. 원스토어판을 다시 빌드할 때마다 TURNTALE_ONESTORE_PLACEMENT에 이 값을 넣어야 광고가 켜진다.
- 개인정보처리방침 주소: https://turntail.yousexybaby.workers.dev/privacy.html (스토어 빌드에는 포함 안 됨).

## 원스토어판만 다시 올림 (2026-11-20, 버전 표시 0.7.42 그대로)
- 펀치홀: 원스토어 앱 전체화면에서 카메라 구멍이 맨 윗줄을 가려, 원스토어판만 위 32px(또는 기기가 알려 주는 값 중 큰 쪽) 검은 띠를 두고 게임 전체를 내렸다(store/onestore-safe-area.css). 게임 CSS의 vh/dvh는 빌드 때 --app-vh로 바꾼다(vite.store.config.ts). 가로 화면은 기기 값만 쓴다.
- 스토리 테스트 모드를 원스토어판에서 숨겼다.
- 광고 시험: 테스트 URL https://turntale-onestore.pages.dev/?adtest=1 로 열면 설정 창에 '광고 시험' 버튼이 나와 전면 광고를 바로 요청하고 결과를 글로 보여 준다.
- 오늘의 판: 판이 끝날 때마다 띄우던 광고를 없애고, 오늘 두 번째 이후 도전(연습판 포함)을 시작할 때 전면 광고를 띄운다(3분 간격 규칙은 같음). 본 사이트는 광고가 없어 변화 없음.
- 빌드 outputs/stores/0.7.42-2026-11-20T01-24-21-191Z, Pages 공개 CSS에 새 규칙 확인. 테스트 450/450, tsc 통과. 본 사이트(GitHub)에는 아직 push하지 않았다. 앱 안 광고·펀치홀 확인은 사용자 몫.
- 폰 확인(사용자): 광고는 뜸. 광고 뒤 오늘의 판 화면이 나무판만 보이고 멈춤 → 광고 중 받은 일시정지가 풀리지 않던 것. 광고가 끝나면, 화면이 다시 보이거나 터치하면 일시정지를 푼다. 탁자 배경·팝업은 body에 바로 그려져 띠를 덮었으므로 띠 기준을 #root에서 body로 옮겼다. 다시 올림: outputs/stores/0.7.42-2026-11-20T01-38-40-976Z.
- 띠 꾸미기(사용자 선택 A+B, 시험판): 검은 띠 대신 지금 화면 맨 위에 실제로 보이는 배경(메뉴 그림, 대결 탁자 나무 무늬 등)을 띠까지 이어 그리고 살짝 어둡게 한다(store/onestore-band.ts). 대결 화면에서는 윗줄의 턴테일 로고를 띠 왼쪽 작은 로고(public/ui/onestore-band-wordmark-v1.webp, 원본 wordmark-v035에서 잘라 만듦)로 올리고 원래 자리는 비운다. 가로 화면은 로고 없음. ?adtest=1 칸에 기기가 알려 주는 안전 영역·화면 크기를 표시한다. 빌드 outputs/stores/0.7.42-2026-11-20T01-58-23-683Z.
- 띠 수정(사용자): 띠를 어둡게 하던 그림자를 없애고 배경만 이어 그린다. 작은 띠 로고 파일은 지우고, 대결 화면 윗줄의 턴테일 로고를 1.26배로 키워 띠까지 올렸다(세로 화면만, 375px 폰 기준 탁자 이름 글자 왼쪽에서 끝남). 로고가 잘리지 않게 대결 화면 main의 세로 넘침을 보이게 했다. 빌드 D:\CHATGPT_CODEX\17_Turntail\site-publish-checkout\outputs\stores\0.7.42-2026-11-20T02-11-03-001Z.
- 띠 최종 시험(사용자 B안, 다른 게임 참고): 로고는 원래 자리·크기로 되돌리고 띠는 배경만 이어 그린다. 팝업이 화면을 어둡게 하면 띠도 같이 어둡게(--band-shade). 원스토어 앱의 오른쪽 위 ⋮ 버튼(약 40px 폭)을 피해 대결 윗줄 버튼을 28px 왼쪽으로(라운드·탁자 이름도 조금씩), 메인 '내 프로필'·프롤로그 건너뛰기를 오른쪽 52px로 옮겼다(세로 화면). 빌드 D:\CHATGPT_CODEX\17_Turntail\site-publish-checkout\outputs\stores\0.7.42-2026-11-20T02-24-08-618Z.
- 띠 그라데이션(사용자): 띠 위쪽 끝을 어둡게(검정 78%) 하고 아래로 갈수록 투명하게 해 게임 화면과 자연스럽게 잇는다. 빌드 D:\CHATGPT_CODEX\17_Turntail\site-publish-checkout\outputs\stores\0.7.42-2026-11-20T02-25-18-689Z.
- ⋮ 자동 피하기(사용자 '나머지도'): 세로 화면에서 화면 오른쪽 위 38px×58px(원스토어 ⋮ 자리)에 들어온 버튼은 어느 화면이든 자동으로 왼쪽으로 옮긴다(같은 작은 버튼 묶음은 함께, onestore-band.ts clearHostMenu). 미리보기에서 설정·튜토리얼 창의 × 버튼이 옮겨지는 것 확인. 프롤로그·컷씬처럼 그림을 img로 그리는 화면도 띠가 그림을 이어받게 했다(미리보기 창이 숨겨져 프롤로그 로딩이 느려 직접 확인은 못 함). 빌드 D:\CHATGPT_CODEX\17_Turntail\site-publish-checkout\outputs\stores\0.7.42-2026-11-20T02-37-38-656Z.
- 컷씬 띠 이음매(사용자): 띠에 그림을 따로 그리면 컷씬 카메라 확대·이동과 어긋나므로, 프롤로그·컷씬 그림(.prologue-picture)과 누르는 면을 띠까지 위로 늘렸다(body·잘라내는 조상은 overflow:clip + overflow-clip-margin). 어두운 위쪽 그라데이션은 body::before로 모든 것 위에 둔다. 새 그림은 필요 없음. 빌드 D:\CHATGPT_CODEX\17_Turntail\site-publish-checkout\outputs\stores\0.7.42-2026-11-20T02-48-04-983Z.
- 폰 확인: 컷씬 위가 여전히 잘림 → 폰 WebView가 overflow-clip-margin을 무시한 것으로 보고, 로고 시험 때 폰에서 통한 overflow:visible 방식으로 바꿨다(body, 그리고 세로 화면에서 .prologue-picture를 잘라내던 조상). 그림 자체(.prologue-picture)는 계속 자기 영역을 잘라 카메라 확대가 밖으로 넘치지 않는다. 빌드 D:\CHATGPT_CODEX\17_Turntail\site-publish-checkout\outputs\stores\0.7.42-2026-11-20T03-09-46-935Z.
- 방식 변경(사용자 '왜 띠를 다시 그려야 해?' → '해'): 게임 전체를 내리고 띠를 다시 그리던 방식(배경 복사·그라데이션·컷씬 늘리기, onestore-band.ts)을 모두 걷어 냈다. 배경은 화면 전체를 채우고 글자·버튼만 내린다. 원스토어 WebView가 safe-area-inset-top을 0으로 주므로, 빌드 때 게임 CSS의 env(safe-area-inset-top)를 var(--store-safe-top)(세로 최소 32px)로 바꾼다. env를 안 쓰던 대결 윗줄(.table-v211>.topbar)과 지도 HUD(.journey-game-hud)는 직접 위 여백을 준다. ⋮ 자동 피하기는 onestore-layout.ts로 옮겨 유지. 미리보기: 메인 '내 프로필' 32px, 대결 윗줄 32px, 맨 아래 버튼 795px(화면 812). 빌드 outputs/stores/0.7.42-2026-11-20T03-22-30-633Z.
- 위쪽 그라데이션(사용자): 모든 화면 맨 위 32px에 어두운→투명 그라데이션(html::after, 터치 통과)을 얹었다. 배경은 그대로. 빌드 D:\CHATGPT_CODEX\17_Turntail\site-publish-checkout\outputs\stores\0.7.42-2026-11-20T03-25-31-399Z.
- 프롤로그 뒤 깜빡임(사용자 제보): 새 여정이 일반 대결용 입장 연출(탁자·'새로운 승부를 준비하고 있어요')을 거쳐 지도가 덮이면서 대결 화면이 잠깐 보였다. 방금 저장한 여정이므로 '이어서 하기'와 같은 방법(fadeIntoSavedTable)으로 연다(미리보기·테스트 여정은 기존 경로). 공용 코드 app/page.tsx 변경이라 본 사이트는 다음 배포 때 반영. 빌드 D:\CHATGPT_CODEX\17_Turntail\site-publish-checkout\outputs\stores\0.7.42-2026-11-20T03-53-02-996Z.
