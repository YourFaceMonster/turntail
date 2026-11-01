# RPG local update · 2026-11-02 · 0.6.59

The user's handoff narrative takes precedence over earlier in-game location copy.

- Six connection sequences: ST1 PRE 20s / POST 15s, ST2 PRE 20s / POST 15s, ST3 PRE 30s / POST 25s. 23 caption blocks, 125 seconds. Dialogue is the handoff's reconstructed draft adopted for implementation, not recovered historical quotations. Both twin guardians remain separate speakers.
- Prologue player accepts connection data and artwork without replacing the original prologue. Automatic playback, tap advance, escape/skip share the existing completion latch. Assets preload with an 8-second fallback; missing images cannot block progression indefinitely.
- Before-battle playback completes into the existing journey-node action. Victory playback is gated by allocation status, before reward selection. Seen POST IDs persist through the existing save route, with optional fields for old saves. Interrupted scenes replay from the beginning; their playback does not repeat combat settlement. Map replay returns to the map; result replay closes to the result. Neither replay executes the advance/reward action. Repeated runs can skip immediately.
- The moon map connects the snowy gate, village square, tavern and northern fortress. Node coordinates and connecting paths use the new map's uncropped composition. The RPG hub uses this map and existing approved cartoon-v4 profession assets, with larger full-art presentation. General stage-challenge settings are unchanged.
- Tavern painting depicts Serin on the left, Mor in the center, Pio on the right, fireplace on the far left and bag on the lower right. Transparent hit areas follow these positions. Dialogue and shops open below the scene rather than covering it with a centered popup. The original prologue tavern images remain intact.
- Removed only the one-round test menu button; its adapter/data remain. Enlarged three equipped relic slots and placed RPG victory text above tile glow.

## Artwork provenance

Built-in ImageGen, reference style from `public/prologue/snow-inn-v3.png`; tavern edit based on `tavern-interior-v2.png`; twin identities from `public/rpg-twins-v1.webp`, redrawn in the approved inked cartoon style. Five new project assets: `moon-region-map-v1.png`, `tavern-cast-v1.png`, `connection-gate-v1.png`, `connection-square-v1.png`, `connection-twins-v1.png`. Generation originals remain under the Codex generated-images directory. Story sequences reference five distinct images (map, three character scenes, existing dawn road); the tavern asset is separate. These are actual file counts, not the handoff's seven proposed storyboard slots or twelve logical placements.

## Validation performed this turn

- TypeScript `tsc --noEmit`: passed.
- Connection, prologue, journey, preview and phase-one tests: 16 passed / 0 failed.
- The former preview test expected the removed button; updated its assertion to require only screen preview while retaining the one-round adapter assertions.
- The initial test command used the older documented loader path under `source/tools` and failed before executing tests. The discovered loader is `turntale-local-2026-10-25/turntale-local-handoff/tools/register-tests.mjs`; the successful runs used it.
- Diff whitespace check passed. No production build, upload, remote save, push or deployment. Version remains 0.6.59.
- Browser/mobile interaction and listening were not performed: no existing development server or Playwright package was available during this check. Passing automated tests is not a claim of visual or full-play verification.

Voice creation, new relic balancing and further cloud-region gameplay are not added by this update.
