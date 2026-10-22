# 다음 결정 항목

- 멀티 종료 후 상대 손패 공개 여부: 보류. 사용자가 추후 적용 여부를 결정한다. 현재는 본인 손패만 볼 수 있고 다른 참가자의 손패는 API에서도 숨긴다. AI 연습 종료 시에는 참가자별 남은 손패를 보여준다.


## TURNTALE 0.3.0 — 2026-10-23

- Game renamed TURNTALE / 턴테일. Approved pixel room artwork integrated as an image background with live singleplayer, multiplayer, tutorial, records and settings controls. Achievement/RPG/shop features deferred.
- Singleplayer and multiplayer 10-round challenges; fixed capacity; signed settlement scores; ten valid rounds only. A void AI-takeover round retries the same challenge slot. Singles automatically rank during challenges.
- Personal TOP 3 split by single/multi, 2/3/4 players, single-round/ten-round total. Ties preserve first achievement order. Old friend history remains separate. Singleplayer resumes its complete local game state. Explicitly leaving a multiplayer challenge abandons its unfinished total.
- Losing multiplayer participants may reveal or hide their own final hand. Other hands remain hidden until consent.
- Context-sensitive progressive tile selection, minimum legal pair/triple completion and manual colour exchange.
- Guided seven-step interactive tutorial; no match or score writes.
- AI guaranteed finishing sequences favour forced draws before the final combination. No hidden hand or hidden floor identities used.
- Active root uses a flex stage on all screen sizes; floor/played/hand grid regions remain isolated during AI animations.
- Verification: TypeScript; existing engine/rules/strategy/selection/timeout suites; SQLite history checks; real API contract test for ten-round scores and consent; browser main menu, desktop AI match and tutorial steps 1–5. Final mobile visual QA and remaining tutorial interactions were interrupted by browser/environment transport failures.
