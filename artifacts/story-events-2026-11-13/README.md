# ST4 / ST7 이벤트 그림 생성 · 2026-11-13

요청: `docs/codex-art-request-2026-11-13-story-events.md`.
기본 제공 `image_gen`으로 각 파일을 개별 생성했다. TURNTALE 승인 2D 카툰 판타지와 기존 장면의 종이를 참조했다.

## Claude 연결용 파일

| 앱용 WebP | PNG 원본 | 크기 |
|---|---|---|
| `/story-events/st4-fragment-1.webp` | `public/story-events/st4-fragment-1.png` | 900×280 |
| `/story-events/st4-fragment-2.webp` | `public/story-events/st4-fragment-2.png` | 900×280 |
| `/story-events/st4-fragment-3.webp` | `public/story-events/st4-fragment-3.png` | 900×280 |
| `/story-events/st7-ledger-page.webp` | `public/story-events/st7-ledger-page.png` | 900×1100 |

모두 종이 밖은 실제 알파 투명이며 글자·숫자·이름이 없다. ST4의 찢긴 끝은 이어지는 인상을 위한 형태이며 픽셀 단위로 맞물리는 마스크는 아니다. ST7 표는 머리행 1개와 기록행 4개, 세로 구분선 3개다. 앱 글자는 밝은 빈 영역에 올린다.

## 기록과 확인

- 전체 프롬프트·참조·저장 경로: `manifest.json`. ST4 두 번째·세 번째 생성은 직전 생성 조각도 참조해 색과 질감을 맞췄다.
- 생성 해상도 원본: `*-generated.png`. 탈락본 없음.
- 최종 크기·PNG/WebP 알파·투명 모서리·해시·용량: `validation.json`.
- `save-assets.py`는 리사이즈와 PNG/WebP 인코딩만 수행하며 기존 파일 덮어쓰기를 거부한다.
- 기존 이미지와 진행 중 소스 변경은 보존했다. 앱 연결은 요청서대로 Claude 담당이다.
- 이번 작업에서 앱 코드 수정·빌드·커밋·push·배포는 하지 않았다.
