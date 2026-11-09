# 2026-11-09 · 길가의 여행자: HP 5를 나눠 응급처치 (로컬 · 미배포)

사용자 확정: 새 RPG에는 소모품(응급 약초)이 없으므로, 여행자를 도울 때 내 HP 5를 나눠 응급처치한다.

## 변경
- `lib/rpg-journey.ts` `giveHerbToWayfarer`
  - 새 RPG(`run.rework`)에서는 HP 5를 쓴다(`WAYFARER_AID_HP`). HP가 5 이하이면 도울 수 없다(HP 0이 되지 않게).
  - 완료 플래그, 파수탑 단서(소문), 파수탑 열림은 그대로다.
  - 예전 RPG 저장(소모품 있음)은 지금처럼 약초 1개를 건넨다.
- `lib/rpg-dialogue.ts`: 새 대사 `travelerInjured`·`travelerTreated`
  - 피가 멈추지 않는 다리 → 망토 자락으로 동여매고 기운을 나눠 일으켜 세운다 → 파수탑 단서
- `app/components/RpgJourneyScene.tsx`
  - 버튼 문구: "HP 5를 나눠 응급처치한다". HP가 5 이하이면 버튼이 꺼지고 안내 줄이 붙는다.
  - **버그 수정:** 기존 화면은 새 RPG에서도 약초 개수(항상 0)로 버튼을 막고 있었다. 그래서 "여행자를 돕는다"를 누를 수 없었다.

## 검증
- `rpg-rework`·`blue-glass`·`rpg-dialogue`·`journey-unlimited-inventory` 테스트 42개 통과. 타입 오류 0
  - 새 검사: HP 5이면 거절, HP가 5 줄어듦, 두 번은 불가
- 브라우저(화면 테스트 모드)
  - 지도 → 길가의 여행자 → 버튼이 켜져 있음 → 누르면 HP 78 → 73, 응급처치 대사가 이어진다.

## 남은 점
- 도운 뒤 그림(`traveler-aided`)에는 여행자가 동전과 약초 주머니를 내미는 모습이 있다. 예전(약초를 받고 주화 +8을 주던) 버전 기준이라, 새 이야기와는 조금 맞지 않는다.
