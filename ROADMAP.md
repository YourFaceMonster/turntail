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

## TURNTALE 0.3.2 — 2026-10-23

- Candle flame SVGs sway gently and lantern glows vary in brightness. The overlays share the same cover framing as the portrait/landscape artwork and ignore pointer events; reduced-motion users get still light.
- Background art was edited with built-in ImageGen to remove only the four painted ivory tiles. Final assets: `public/turntale-room-v032.png` and `public/turntale-room-portrait-v032.png`. Prompt: remove the four standing ivory tiles and reconstruct the tabletop/runner behind them while preserving framing, lighting, candles, furniture, lanterns, window and pixel-art style; no text or UI.
- Four separate decorative foreground tiles now use one identical width/height, face, bevel and front-facing angle. Menu suit emblems reuse game vector artwork with larger high-contrast medallions. Gold letter faces, embossed shadows and vector flourishes decorate the title. Main play buttons have curved mirrored corners and matching inner frames.
- Draw flight is 820ms: approximately 140ms to center, 500ms still, 180ms into the receiving hand. The server/local guard is 900ms; hidden upper draws remain face-down.
- Records default to shared leaderboards with mode × player count × single/ten-round filters. One best record per player per category, first-achievement tie ordering, twenty players per page, and the current device's rank even outside the current page. Personal TOP 3 is retained in its own tab.
- Offline single-player personal bests sync on entry, new results, profile rename and board opening; failed uploads retain local records for retry. These are bounded device-reported records, not an anti-cheat system. Existing multiplayer challenge records are read directly from server settlements and need no reconnect/backfill. Voided or abandoned matches do not rank. Public output contains only nickname, score, achievement time, rank and self marker; profile tokens, device keys, hands and match bodies are not returned.
- Added schema-only shared_scores migration. Live data is preserved. Real SQLite + real route regression tests cover cross-device visibility, negative scores, deduplication, best-per-player, ties, pagination, own rank, old multiplayer records, void exclusion, invalid uploads and origin checks. Existing pacing, selection/challenge, layout and online-timeout API tests pass.
- Preview visual/touch QA remains unavailable after the browser policy denial; no alternate browser surface was used to bypass that restriction.

## TURNTALE 0.3.3 — 2026-10-23

- Restored the original illustrated tabletop composition and viewing angles in both orientations. Removed the separate flat foreground tile controls; adjusted only the illustrated tile sizes to make all four appear like the same tall rectangular pieces while retaining perspective, bevels, shadows and original grouping.
- Added a gently darkened inset background to the hand area, with a subtle divider. Tile faces stay legible and full color during the opening review.
- Draw timing now has exactly 800ms at center, retaining 140ms entry and 180ms collection. Total CSS flight 1120ms, authoritative/local guard 1200ms. Reduced-motion flights use the same updated total.
- Replaced CSS letter effects with a dedicated transparent champagne-gold Korean wordmark reading “턴테일”, with sculpted lettering and restrained leaf flourishes. Accessible heading text is supplied by the image alt label.
- Built-in ImageGen assets: `public/turntale-room-v033.png`, `public/turntale-room-portrait-v033.png`, `public/turntale-wordmark-v033.png`.
- Background prompt: preserve the original room, camera, four angled illustrated rectangular tiles and their original groups; minimally balance their visible sizes; preserve everything else with no text or UI. Logo prompt: exact Korean text “턴테일”, refined fantasy storybook calligraphic serif strokes in champagne gold and bronze bevels, restrained leaf flourishes, tightly framed 3:1 transparent wordmark, no other text/background.
- TypeScript, pacing and online-turn deadline/privacy regression suites passed. Artwork inspected directly; final browser layout/touch QA remains limited by the existing browser access policy denial.

## TURNTALE 0.3.4 — 2026-10-23

- Implements the approved C concept with smooth live Hangul lettering: large flat ivory faces, a restrained bronze offset, small star trio and a fine gold rule. Keeps the warm indie-game mood without pixel-grid letter edges. The rendered wordmark is native text for exact Korean spelling and clarity.
- Main actions are singleplayer, continue, multiplayer in that order. Each uses equal dimensions and one identical radius on all four corners and inner frames. Continue is an equally styled emerald action; if no save exists it remains in its position and is disabled. Short landscape screens use the same reading order across three columns.
- Background edits preserve original illustrated tile placement/view while balancing red/green visible face geometry and emblem weight. Built-in ImageGen final assets: `public/turntale-room-v034.png` and `public/turntale-room-portrait-v034.png`. Prompt: surgical correction to red/green face width, height, tilt, bevel and visual weight; retain original standing two-left/two-right tile grouping and all room/camera details. The generated alternate gold wordmark was discarded in favor of native smooth C letterforms.
- Dedicated text-only table-center start and lead notifications are placed in the floor region above the hand tray. Start retains the three-second countdown; all starting hand faces stay visible. After the final draw/pass resets the rally, a shared 1200ms read interval keeps the new-leader notice visible before human/AI play can begin. Draw reveal itself remains 800ms at center with fast entry/collection. No fullscreen shade or modal.
- TypeScript, pacing (including post-draw lead-read boundary), turn deadlines/privacy, real online API timeout/rematch/challenge tests, selection/challenge/highscores and tile sizing checks passed. CSS syntax and whitespace checks passed. Browser visual/touch QA remains unverified due to the existing policy denial.
