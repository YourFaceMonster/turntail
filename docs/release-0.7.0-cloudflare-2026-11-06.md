# 0.7.0 Cloudflare 운영 배포

2026-11-06 사용자의 명시적인 Cloudflare 배포 요청으로 기존 운영 Worker turntail에 배포했다. 배포 전 공개 홈페이지 HTTP200·0.6.72를 확인하고 로컬 package.json·lib/version.ts·빌드 번들이0.7.0임을 재확인했다.

- 기능 소스 bf6932c326892eed922dce1b18109cfd0655b4cb, GitHub main 빌드 기록 ec6e297c7ebd353d2d067d3fe39462623676bd17.
- 직전 요청에서 통과한 운영 빌드5단계 산출물을 사용했다. 이후 변경은 README와 빌드 문서뿐이고, 주요 번들3개의 SHA-256이 빌드 기록과 같음을 배포 직전에 확인했다. 이번에 같은 빌드를 다시 실행하지 않았다.
- 이번 `wrangler deploy --config dist/server/wrangler.json` 종료 코드0. 정적 파일10개 업로드, 기존386개 재사용.
- 배포 반환 Worker 버전 afcc33f9-c3c4-494e-b0c6-3665d2785245.
- 사이트: https://turntail.yousexybaby.workers.dev.

## 이번 공개 확인

공개 홈페이지 HTTP200·0.7.0 표시와 page-DvLaDUjr.js의 새 판 전체 정산 코드를 확인했다. 공개 파일9개가 HTTP200이며, 앱·이야기·봇·프레임워크·런타임·CSS 등7개 SHA-256이 로컬 빌드와 일치했다.

배포 후 deployments list에서 후속 Worker0605d7d8-75bd-47a3-8811-839292c2f79f(2026-11-06T11:33:08Z, source wrangler)가100% 트래픽을 받는 상태도 확인했다. 후속 배포를 실행한 경로는 확인하지 않았다. 현재 공개 진입 index-DALREyyD.js와 layout-segment-context-BdNp9f_z.js는 로컬 파일명과 달라 HTTP200만 확인하고 로컬 해시 일치로 기록하지 않았다. 서비스 중인 후속 배포를 임의로 되돌리지 않았다. 현재 앱·이야기·봇 등 핵심7개 파일의 일치는 이 후속 배포 상태에서 직접 검사한 결과다.

세부 증거: deployment-0.7.0-2026-11-06.json. 로그: ../../artifacts/deploy-0.7.0-2026-11-06.log. 공개 다운로드 사본: ../../artifacts/verify-0.7.0-2026-11-06/.

관련43개 검사·타입·diff는 앞선 기능 수정 때 통과했으며 운영 빌드는 앞선 빌드 요청 때 통과했다. 이번에 새로 수행한 것은 배포·배포 이력 조회·공개 HTTP/파일 검증이다. 실제 브라우저/모바일 플레이와 체감 밸런스는 이번에 검증하지 않았다.

이후 별도 요청 없는 수정은 로컬만 저장한다. 다음 기능 변경 배포는0.7.1 이상으로 올리고 실제 공개 버전과 로컬 버전을 다시 확인한다.
