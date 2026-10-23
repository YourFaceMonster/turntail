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


## TURNTALE 0.3.1 — 2026-10-23

- More detailed title crest, gold inset button frames, consistent SVG menu icons, embers and saved profile name/photo. A new portrait composition keeps the lantern, castle window and tabletop visible rather than cropping the landscape center. Both title root and background use dynamic viewport height and content can grow on short screens.
- The opening countdown is text inside the played-tile region. Removed the central modal and screen-dimming treatment; all starting hand faces retain full color while the existing three-second preparation guard runs.
- Played tiles have a bounded current layer and a separate previous layer, only visible during the replacement/review. The central region has explicit independent grid tracks in both orientations. Tile landing bounce reduced to twelve pixels.
- Floor, played tiles and hand now share one continuous wooden table surface, with only light separators between interaction regions.
- The center names the new leader after a rally, with “내가 선!” and “선을 잡았습니다” for the local player; other leaders are named too.
- Music/effects controls use centered 14px SVGs. Profile controls have explicit pointer/touch targeting, a visible saved avatar/name in the title menu, immediate tap feedback and a dedicated modal layer above the other dialogs.
- Checks: TypeScript, tile sizing/layout bounds, challenge/selection/highscores, opening timing/rally reset, AI refinements passed. Browser preview access was denied by the environment security policy, so mobile/desktop visual and click verification could not be completed in this update.

### Portrait title asset

- Path: `public/turntale-room-portrait-v031.png`
- Created with the built-in ImageGen tool using the approved `public/turntale-room.png` as reference.
- Prompt: Portrait 9:16 composition of the same cozy magical nighttime game room, with crisp pixel detail, amber lantern, blue moonlit arched castle window, carved bookshelves, wine-red curtain, flowers, ornate lower wooden table and four ivory sun/star/moon/cloud tiles at the lower corners. Keep the center calm for live menu controls. Fill the entire canvas including the bottom. No text, buttons, logos or watermarks.
