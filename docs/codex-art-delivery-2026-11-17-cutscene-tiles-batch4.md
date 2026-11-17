# 컷씬 묶음 4 · 인물 표정 전달 · 2026-11-17 (로컬 미게시)

기준: [그림 요청서](codex-art-request-2026-11-16-cutscene-tiles.md). 앞선 [묶음 2·3 전달](codex-art-delivery-2026-11-17-cutscene-tiles-batch2-3.md)을 마친 뒤 진행했다.

## 수량 확정과 산출물

요청서 본문에는 34표정/68장으로 적혀 있지만 인물별 표를 합하면 **37표정 × 세로·가로 = 74장**이다. 2026-11-17 사용자가 “인물별 표를 모두 따라 74장 생성”으로 확정했다. 인물을 빼거나 표정을 줄이지 않았다.

- 보스: 카르덴·재온·첫 번째 수호자·두 번째 수호자 **22장**.
- 각 스테이지 상대: 수리·하온·루엔·아스텔 **24장**.
- 나머지: 네아·타래·세라·태엽·시온·엘라·오닉 **28장**.
- 합계 **74장**, PNG 원본 + 앱용 WebP **148파일**. 모두 `public/story/`에 새 이름으로 저장.
- 세로 1024×1536, 가로 1672×941. 기본 표정 세로를 먼저 만들고, 그 그림과 기존 장면을 참고해 다른 표정 및 가로 구도를 생성했다.
- `imagegen`·`turntale-cartoon-fantasy` 스킬 적용, **built-in image_gen** 사용. 최종 프롬프트 전체와 참조 경로는 아래 manifest에 보존했다.
- 앱 버전 0.7.33 유지. 기존 그림·미커밋 코드 보존. **앱 연결·빌드·커밋·push·배포 없음.**
- 새 그림에 게임 패는 넣지 않았다. 이야기 특별 패와 기존 대결 패 파일을 수정하지 않았다.

## 저장과 이번 검수

- 원시 생성 PNG, 최종 PNG·WebP 매핑, 실제 프롬프트·참고 그림: `artifacts/cutscene-tiles-2026-11-17-batch4/manifest.json`.
- 파일별 크기·디코딩·SHA-256: 같은 폴더의 `validation.json`.
- 인물별 표정·세로/가로 비교: 같은 폴더의 `review-<인물키>.jpg` 15개.
- 전체 모음: 같은 폴더의 `contact-1.jpg` ~ `contact-10.jpg`.
- 74개 요청 ID와 산출물 ID 일치, PNG·WebP 148파일 크기·디코딩 검사 통과. 원시 크기는 1024×1536, 1672×940 또는 1672×941이며, 가로 높이가 940인 생성본은 Lanczos로 요청 높이 941에 맞췄다.
- 기준 장면과 인물별 비교 모음을 육안 확인했다. 얼굴·종족·머리·복장·소품·조명, 표정 구분, 한 명만 나오는 구도와 자막용 아래쪽 어두운 영역을 점검했다.
- 카르덴은 투구를 유지했다. 따라서 미소는 투구를 벗겨 얼굴을 드러내는 대신 고개·자세로 작게 표현했으며 표정 차이가 제한적이다. 수호자도 두건 아래 그림자를 유지하고, 첫 번째 수호자의 입가와 자세만 조금 바뀐다.
- 태엽은 기계 부엉이 얼굴·금속 깃털·모노클·보라색 목 장식을 유지하고 눈의 초점과 명암으로 진지함을 구분했다.
- Python/Pillow는 생성 이후 크기·포맷 변환, 해시/디코딩 검사, 비교 모음 제작에만 사용했다.
- **실제 앱·모바일 화면 검수는 하지 않았다.** 연결 후 자막 가림·가로 크롭·작은 화면에서 표정 차이가 읽히는지는 별도로 확인해야 한다.
- 최종 교차 검사: 묶음 2·3·4의 요청 ID 102개와 산출물 일치, PNG·WebP 204파일 해시 일치, 참고 원본 16개 해시 보존. 결과는 같은 폴더의 `final-check.json`.
- 마무리 Git HEAD는 `cc57c0f`, 버전은 0.7.33. Git 상태에 코드·테스트 미커밋 8개(`SinglePlayer.tsx`, `StoryPuzzle.tsx`, `story-puzzle.css`, `journey-polish.css`, 테스트 4개)가 보인다. 이번 그림 작업에서는 이 파일들을 수정·되돌리기·스테이징하지 않았다. 그림/기록과 다른 작업의 미커밋 변경을 함께 커밋하지 않도록 구분한다.

## 인물별 합계

| 스테이지 | 인물 키 | 표정 | 장수 |
|---|---|---|---|
| ST6 | `karden` | `calm`, `serious`, `smile` | 6 |
| ST9 | `jaeon` | `calm`, `serious`, `smile` | 6 |
| ST10 | `guardian-1` | `calm`, `serious`, `smile` | 6 |
| ST10 | `guardian-2` | `calm`, `serious` | 4 |
| ST4 | `suri` | `calm`, `smile`, `serious` | 6 |
| ST5 | `haon` | `calm`, `smile`, `serious` | 6 |
| ST7 | `ruen` | `calm`, `smile`, `serious` | 6 |
| ST8 | `astel` | `calm`, `smile`, `serious` | 6 |
| ST4 | `nea` | `calm`, `smile` | 4 |
| ST5 | `tarae` | `calm`, `serious` | 4 |
| ST6 | `sera` | `calm`, `serious` | 4 |
| ST6 | `taeyeop` | `calm`, `serious` | 4 |
| ST7 | `sion` | `calm`, `smile` | 4 |
| ST8 | `ella` | `calm`, `smile` | 4 |
| ST9 | `onik` | `calm`, `serious` | 4 |

## Claude 연결 목록

아래 확장자 없는 경로는 `public/` 기준. 각 경로에 **.png와 .webp 둘 다** 있으며 앱에서는 WebP를 사용한다. 아직 연결하지 않았다.

| 인물 키 | 표정 | 세로 | 가로 |
|---|---|---|---|
| `karden` | `calm` | `story/talk-karden-calm-portrait-v1` | `story/talk-karden-calm-wide-v1` |
| `karden` | `serious` | `story/talk-karden-serious-portrait-v1` | `story/talk-karden-serious-wide-v1` |
| `karden` | `smile` | `story/talk-karden-smile-portrait-v1` | `story/talk-karden-smile-wide-v1` |
| `jaeon` | `calm` | `story/talk-jaeon-calm-portrait-v1` | `story/talk-jaeon-calm-wide-v1` |
| `jaeon` | `serious` | `story/talk-jaeon-serious-portrait-v1` | `story/talk-jaeon-serious-wide-v1` |
| `jaeon` | `smile` | `story/talk-jaeon-smile-portrait-v1` | `story/talk-jaeon-smile-wide-v1` |
| `guardian-1` | `calm` | `story/talk-guardian-1-calm-portrait-v1` | `story/talk-guardian-1-calm-wide-v1` |
| `guardian-1` | `serious` | `story/talk-guardian-1-serious-portrait-v1` | `story/talk-guardian-1-serious-wide-v1` |
| `guardian-1` | `smile` | `story/talk-guardian-1-smile-portrait-v1` | `story/talk-guardian-1-smile-wide-v1` |
| `guardian-2` | `calm` | `story/talk-guardian-2-calm-portrait-v1` | `story/talk-guardian-2-calm-wide-v1` |
| `guardian-2` | `serious` | `story/talk-guardian-2-serious-portrait-v1` | `story/talk-guardian-2-serious-wide-v1` |
| `suri` | `calm` | `story/talk-suri-calm-portrait-v1` | `story/talk-suri-calm-wide-v1` |
| `suri` | `smile` | `story/talk-suri-smile-portrait-v1` | `story/talk-suri-smile-wide-v1` |
| `suri` | `serious` | `story/talk-suri-serious-portrait-v1` | `story/talk-suri-serious-wide-v1` |
| `haon` | `calm` | `story/talk-haon-calm-portrait-v1` | `story/talk-haon-calm-wide-v1` |
| `haon` | `smile` | `story/talk-haon-smile-portrait-v1` | `story/talk-haon-smile-wide-v1` |
| `haon` | `serious` | `story/talk-haon-serious-portrait-v1` | `story/talk-haon-serious-wide-v1` |
| `ruen` | `calm` | `story/talk-ruen-calm-portrait-v1` | `story/talk-ruen-calm-wide-v1` |
| `ruen` | `smile` | `story/talk-ruen-smile-portrait-v1` | `story/talk-ruen-smile-wide-v1` |
| `ruen` | `serious` | `story/talk-ruen-serious-portrait-v1` | `story/talk-ruen-serious-wide-v1` |
| `astel` | `calm` | `story/talk-astel-calm-portrait-v1` | `story/talk-astel-calm-wide-v1` |
| `astel` | `smile` | `story/talk-astel-smile-portrait-v1` | `story/talk-astel-smile-wide-v1` |
| `astel` | `serious` | `story/talk-astel-serious-portrait-v1` | `story/talk-astel-serious-wide-v1` |
| `nea` | `calm` | `story/talk-nea-calm-portrait-v1` | `story/talk-nea-calm-wide-v1` |
| `nea` | `smile` | `story/talk-nea-smile-portrait-v1` | `story/talk-nea-smile-wide-v1` |
| `tarae` | `calm` | `story/talk-tarae-calm-portrait-v1` | `story/talk-tarae-calm-wide-v1` |
| `tarae` | `serious` | `story/talk-tarae-serious-portrait-v1` | `story/talk-tarae-serious-wide-v1` |
| `sera` | `calm` | `story/talk-sera-calm-portrait-v1` | `story/talk-sera-calm-wide-v1` |
| `sera` | `serious` | `story/talk-sera-serious-portrait-v1` | `story/talk-sera-serious-wide-v1` |
| `taeyeop` | `calm` | `story/talk-taeyeop-calm-portrait-v1` | `story/talk-taeyeop-calm-wide-v1` |
| `taeyeop` | `serious` | `story/talk-taeyeop-serious-portrait-v1` | `story/talk-taeyeop-serious-wide-v1` |
| `sion` | `calm` | `story/talk-sion-calm-portrait-v1` | `story/talk-sion-calm-wide-v1` |
| `sion` | `smile` | `story/talk-sion-smile-portrait-v1` | `story/talk-sion-smile-wide-v1` |
| `ella` | `calm` | `story/talk-ella-calm-portrait-v1` | `story/talk-ella-calm-wide-v1` |
| `ella` | `smile` | `story/talk-ella-smile-portrait-v1` | `story/talk-ella-smile-wide-v1` |
| `onik` | `calm` | `story/talk-onik-calm-portrait-v1` | `story/talk-onik-calm-wide-v1` |
| `onik` | `serious` | `story/talk-onik-serious-portrait-v1` | `story/talk-onik-serious-wide-v1` |

## 후속 연결 범위

요청서대로 화자별 표정 그림 표와 대사별 `mood` 값을 연결하고 preload를 추가한다. 기존 대사와 ST6·ST9 특별 패 장면 순서는 유지한다. 화면/동작 검증과 게시 여부는 별도 사용자 지시를 따른다. 이번 기록은 **그림 생성·로컬 저장·파일 검수 완료 기록**이다.

