# 영역 주점 이미지 완료 · 2026-11-13 (로컬 미게시)

요청: `docs/codex-art-request-2026-11-13-region-inns.md`. PC 로컬에서 `git pull --ff-only origin main` 실행, Already up to date 확인. 작업 시작 앱 버전 0.7.23. built-in `image_gen`으로 제작했다. 승인 TURNTALE 카툰 판타지 스킬, 기존 주점 실내와 까마귀 모르 원화를 참조했다.

## 전달 이미지

모두 `public/story/`에 PNG와 WebP 쌍으로 저장했다. 기존 파일은 덮어쓰지 않았다.

| 파일 이름(확장자 제외) | 크기 | 내용 |
|---|---|---|
| `inn-2-portrait-v1` | 1024×1600 | 안개 나루 배 주점, 모란·수달·도칸 |
| `inn-3-portrait-v1` | 1024×1600 | 달빛 등불 뿌리 주점, 모로·검은 고양이·리네 |
| `region-2-map-portrait-v3` | 1024×1600 | 폭포 왼쪽 작은 배 주점 추가 |
| `region-3-map-portrait-v3` | 1024×1600 | 고목 왼쪽 작은 굴 주점 추가 |
| `inn-portrait-moran-v1` | 512×512 | 회색 땋은 머리, 호탕한 까마귀 누나 |
| `inn-portrait-dokan-v1` | 512×512 | 회색 수염, 그을린 앞치마와 망치의 대장장이 |
| `inn-portrait-moro-v1` | 512×512 | 동그란 안경, 조끼·깃펜의 까마귀 막내 |
| `inn-portrait-rine-v1` | 512×512 | 별자리 망토, 작은 망원경의 별지기 소녀 |

모르의 형제는 까마귀 종족으로 통일했다. 첫 실내 생성에는 참조 인물 모르가 함께 들어가 해당 인물만 제거한 편집본을 최종 선택했다. 초상은 최종 실내 그림을 참조했다. 글자와 숫자 없이 제작했다.

## 지도 보존과 이번 검증

지도는 v2 원본을 image_gen으로 부분 편집한 뒤, 생성된 주점 주변 부분만 원본에 적용했다. 원본의 다른 장소·길·크기·색은 보존했다. 편집한 주점 부분을 요청 좌표에 맞춰 소폭 옮겼다. PNG에서 아래 사각형 밖의 변경 픽셀은 0개임을 비교했다. WebP는 손실 압축이므로 원본과 픽셀 일치를 보장하는 검사는 PNG 기준이다.

- 영역2 적용 범위: x105~374, y1140~1344. 아이콘 기준 약 x24%, y79%.
- 영역3 적용 범위: x132~301, y1150~1304. 아이콘 기준 약 x22%, y76%.
- 8장 전체 PNG·WebP 크기 검사 통과. 최종 모아보기와 지도 전후 비교 이미지를 직접 확인했다.
- 앱 테스트·빌드·실제 앱 화면 확인은 이번 이미지 작업에서 실행하지 않았다.

## 생성 기록과 비교 자료

`artifacts/region-inns-2026-11-13/`:

- `prompts.json`: 모든 최종·초기 생성 및 편집 프롬프트, 참조 파일 경로.
- `*-generated.png`: 도구에서 받은 생성 원본. 지도 전체 편집 원본도 별도 보존.
- `*-rejected-extra-mor.png`: 제외한 모르 동반 초기 실내 그림.
- `region-2-comparison.jpg`, `region-3-comparison.jpg`: 수정 전후 나란히 보기.
- `region-2-overlay.png`, `region-3-overlay.png`: 수정 전후 50% 겹치기.
- `region-2-difference.png`, `region-3-difference.png`: 변화 부분 강조.
- `contact-sheet.jpg`: 8장 모아보기.
- `validation.json`: 실제 크기, 바이트 수, SHA256, 원본 해시, 편집 범위와 범위 밖 변경 0개 기록.
- `save-assets.py`: 규격 저장, WebP 변환, 부분 적용 및 검증 재현 스크립트. 출력이 이미 존재하면 덮어쓰지 않고 중단한다.

## Claude 후속 연결

요청서대로 연결은 Claude가 담당한다. `INN_ART_READY`의 2·3, 지도 `ART_VERSION`의 region-2·3 버전3, 지도 검사, 주점 메뉴 초상 및 필요 시 아이콘 좌표를 반영한다. 앱 참조는 WebP를 사용한다. 기존 사용자/Claude 미커밋 소스는 건드리지 않았다. 버전 변경·커밋·push·빌드·배포 없이 로컬 이미지와 기록만 저장했다.
