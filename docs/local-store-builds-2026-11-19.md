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
