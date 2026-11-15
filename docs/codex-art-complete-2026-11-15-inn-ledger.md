# 주점 보완·장부 이미지 생성 완료 · 2026-11-15

요청서: codex-art-request-2026-11-15-inn-ledger.md.
시작 기준: 로컬 package.json 0.7.30 / git pull --ff-only origin main: Already up to date.
도구: built-in image_gen. TURNTALE 승인 2D 카툰 판타지 스킬 적용.

## 저장 파일 (PNG 원본 + 같은 이름 WebP)
- public/story/inn-3-portrait-v2 (1024×1600)
- public/story/inn-3-wide-v2 (1672×941)
- public/story/inn-talk-moran-portrait-v1 / inn-talk-moran-wide-v1
- public/story/inn-talk-dokan-portrait-v1 / inn-talk-dokan-wide-v1
- public/story/inn-talk-moro-portrait-v1 / inn-talk-moro-wide-v1
- public/story/inn-talk-rine-portrait-v1 / inn-talk-rine-wide-v1
- public/story-events/st7-ledger-v2 (900×1100)

대화 8장도 세로 1024×1600 / 가로 1672×941. 총 그림11장, PNG11 + WebP11 = 22파일.
기존 v1 배경·초상·장부는 모두 보존.

## 제작과 이번 확인
A: 검은 고양이의 고개를 들고 노란 눈·푸른 림라이트를 추가. 기존 모로·리네·상자·탁자 위치를 원화와 비교해 시각 확인.
B: 초상을 인물 기준으로 참조하여 해당 주점의 대화 장면으로 새로 생성. 인물과 소품을 크게, 하단은 어두운 단순 여백. 도칸 세로본은 팔 연결이 모호한 초안을 교정하여 두 팔·두 손 최종본을 사용.
C: 펼친 가죽 장부에 정확히4줄, 점1/2/3/4개와 서명 흔적. 세 번째 줄 1등칸은 얼룩만, 2등칸은 빨간 왕관, 3등칸은 서명. 오른쪽 페이지 촛농·깃펜·빈 메모.
최종 그림 및 세로/가로 컨택트 시트 직접 확인.
Pillow로 PNG/WebP 22개 크기·디코딩 통과.
생성 도구가 반환한 크기와 요청 크기가 다른7장은 최종 저장 시 리사이즈. 이미지 내용 수정 없이 크기·형식 정규화; 실제 생성 원본은 artifacts에 모두 보존. 상세 원본·최종 크기는 validation.json.
PNG 합계 23,517,121bytes / 앱용 WebP 합계 2,209,252bytes.
실제 앱 연결·이름표 겹침·자막/버튼 배치·StoryPuzzle 클릭은 이번 미검증.

## 장부 줄 좌표 (전체 이미지에 대한 %)
표 x: 약9.0~47.8%.
| 줄 | y 시작 | y 끝 | 내용 |
|---|---:|---:|---|
| 1 | 31.5% | 40.4% | 점1 + 서명3 |
| 2 | 40.4% | 49.4% | 점2 + 서명3 |
| 3 | 49.4% | 58.2% | 점3 + 빈1등 + 빨간왕관2등 + 서명3등 |
| 4 | 58.2% | 67.1% | 점4 + 서명3 |

기계용 좌표: docs/st7-ledger-v2-hit-areas.json. object-fit 여백을 제외한 실제 이미지 영역 기준으로 투명 버튼을 배치할 것. 이미지 전체 너비를 누르기 영역으로 쓰지 말고 왼쪽 페이지 표 영역에 맞춘다.

## Claude 후속
요청서의 연결 항목에 따라 A 배경버전, B 대화 장면, C 그림+투명 누르기 영역 연결. 원래 대사 및 퍼즐 규칙 유지.
이름표 기존 좌표(모로 세로20/30%, 가로25/38%)는 실제 화면에서 재확인.
이번 작업은 이미지·생성 기록·인계 문서 로컬 저장만 수행. 기존 코드 미커밋 변경은 수정하지 않음.
빌드·커밋·push·배포 없음.

## 원본·프롬프트·검증·미리보기
artifacts/inn-ledger-2026-11-15/manifest.json — 최종 프롬프트11개와 저장/생성 경로
artifacts/inn-ledger-2026-11-15/validation.json — 크기, 바이트, SHA256
artifacts/inn-ledger-2026-11-15/*-generated.png — 도구 생성 원본
artifacts/inn-ledger-2026-11-15/inn-talk-dokan-portrait-rejected-anatomy.png — 교정 전 초안 보존
artifacts/inn-ledger-2026-11-15/portrait-contact-sheet.jpg
artifacts/inn-ledger-2026-11-15/wide-contact-sheet.jpg
