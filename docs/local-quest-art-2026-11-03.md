# 2026-11-03 · 퀘스트 전용 컷씬 원화 연결

기존 프롤로그 그림 재사용에서 전용 원화로 교체했다. 내장 `image_gen`과 승인된 TURNTALE 손그림 2D 화풍을 사용했다. 최종 그림은 `public/quests/`에 가로/세로 각 6장, 총 12장으로 저장했다. 생성 원본은 Codex generated_images 폴더에 보존했다.

|장면|파일 이름 접두사|연결 위치|
|---|---|---|
|모르의 봉인 편지 설명|mor-letter|주점 모르 의뢰/편지 전달|
|편지를 들고 승부를 거는 도둑|alley-thief|시장 뒤 골목|
|다친 다리를 감싼 여행자|traveler-injured|약초 전달 전|
|주화를 건네며 탑을 가리키는 여행자|traveler-aided|약초 전달 후|
|파수탑과 계단 아래 푸른 등잔|watchtower-arrival|파수탑 조사 전|
|깨진 등잔에서 푸른 유리를 꺼내는 손|blue-glass-discovery|파수탑 조사 후|

각 접두사에 `-wide-v1.png` / `-portrait-v1.png`가 붙는다. [생성 프롬프트와 참조 기록](quest-cutscene-art-prompts-2026-11-03.json). 여행자 후속 그림에 불필요하게 생성된 조연을 제거하고, 플레이어를 향해 답례하는 모습으로 수정해 최종 선택했다.

`QuestCutscene`은 진행 상태에 맞는 그림을 선택하고, 기존 picture의 가로/세로 source를 사용한다. 퀘스트 보상/저장 규칙은 유지했다. 이미 완료한 퀘스트도 지도 오른쪽 아래 **장면 선택 → 퀘스트** 항목에서 다시 볼 수 있다. 다시 보기에서는 보상이나 저장 상태를 변경하지 않는다.

## 이번 확인

- 생성된 12개 그림을 직접 열어 화풍·인물·소품·가로/세로 구도를 확인했다.
- `node --experimental-strip-types scripts/check-quest-art.mjs --local` 통과: 12개 PNG 시그니처, 해상도, 가로/세로 비율, 로컬 HTTP 200 및 실제 바이트 일치.
- `pnpm exec tsc --noEmit`: 새 변경 오류는 없고 기존 bomb 테스트의 nullable 오류 3개로 전체 실패.
- `git diff --check` 통과. 실제 브라우저 클릭/모바일 기기 확인은 미실행이다.
- 버전 0.6.66 유지. 로컬 저장만 했으며 빌드·커밋·push·배포하지 않았다.
