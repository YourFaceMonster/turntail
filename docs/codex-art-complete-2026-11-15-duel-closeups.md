# 승부 직전 클로즈업 14장 생성 완료 · 2026-11-15

기준: 로컬 main 8c8cbc4 / 0.7.29. 작업 시작 시 git pull --ff-only origin main 결과 Already up to date.
요청서: codex-art-request-2026-11-15-duel-closeups.md.
도구: built-in image_gen. TURNTALE 승인 카툰 판타지 스킬 적용.

## 저장
public/story/st{4..10}-duel-portrait-v1.png 및 .webp
public/story/st{4..10}-duel-wide-v1.png 및 .webp
총 그림 14장 / PNG 14개 + WebP 14개.
세로 1024×1536, 가로 1672×941. 원본 생성 크기부터 모두 요청 크기와 일치.
PNG 합계 37,276,655 bytes, WebP 합계 4,383,224 bytes.

## 이번 검수
14장 생성 결과 및 세로/가로 컨택트 시트 직접 확인.
스테이지별 before 원화 가로·세로, tavern-wager 일반 대결 패 원화 확인 후 참조 입력.
ST10은 guardian 원화 추가 참조.
인물·의상·소품·색감, 두꺼운 크림색 일반 패의 빈 뒷면, 여행자 앞쪽 손 시점 확인.
ST5 초안 2장은 상대가 패를 놓아 시점 교정 후 최종본으로 저장. 초안도 artifacts에 보존.
Pillow로 PNG와 WebP 전부 재열기, 정확한 크기 및 디코딩 28파일 통과.
하단은 자막용으로 단순한 탁자와 어두운 색 중심으로 생성. 실제 자막과 손/패 겹침은 앱 연결 후 화면 검수 필요.
앱 연결·실제 브라우저 검수·빌드·커밋·push·배포는 이번 작업에서 수행하지 않음.
기존 코드 미커밋 변경은 이번 이미지 작업과 별개이며 수정하지 않음.

## Claude 후속 연결
요청서의 Claude가 할 연결 항목을 그대로 적용:
- CHAPTER_ART_SLOTS에 st4-duel~st10-duel 슬롯 추가, 앱 참조는 WebP.
- before 마지막 줄에 연결, 기존 대사 유지.
- stageArtToPreload 포함, 관련 검증 및 375×812·1366×768 화면 확인.
- 이미지 작업만으로 빌드·배포 권한이 생기지 않음.

## 생성 기록 / 미리보기
../artifacts/duel-closeups-2026-11-15/manifest.json: 최종 프롬프트 14개, 원본 경로, 저장 경로, 도구.
../artifacts/duel-closeups-2026-11-15/validation.json: 크기, 바이트 수, PNG SHA256.
../artifacts/duel-closeups-2026-11-15/portrait-contact-sheet.jpg
../artifacts/duel-closeups-2026-11-15/wide-contact-sheet.jpg
