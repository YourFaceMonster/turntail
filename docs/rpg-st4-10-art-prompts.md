# RPG ST4~10 그림 프롬프트표 (세로 먼저)

작성: 2026-11-11 · 목록 원본: [rpg-st4-10-art-requests.md](rpg-st4-10-art-requests.md) · 인물 외모: `lib/stage-theme.ts` · 대사 맥락: `lib/rpg-chapter-scenes.ts`

## 진행 순서

1. 지역 지도 3장 → 2. 스테이지 장면 14장 → 3. 서브퀘스트 6장 → 4. 이야기 장면·엔딩 7장 → 5. 이야기 패 4장 → 6. 선택 그림 2장
- 이번에는 **세로(941×1672, 9:16)만** 만든다. 가로(1672×941)는 나중에 같은 프롬프트에 완성된 세로 그림을 첨부해 "같은 장면을 가로로 다시 그려줘"로 만든다.
- 세로 그림만 먼저 오면, 반영할 때는 가로 칸에도 임시로 같은 세로 그림을 쓸지, 가로 그림이 올 때까지 기존 임시 그림을 그대로 둘지 그때 정한다.
- ChatGPT가 1024×1536으로 내보내면 반영할 때 좌우를 잘라 9:16으로 맞춘다. 그래서 프롬프트에 "중요한 것은 가운데"를 넣었다.

## 사용법

1. 새 대화를 열고 **참고 그림**(각 항목에 적음)을 첨부한다.
2. 아래 **공통 스타일**을 먼저 붙여넣고, 이어서 해당 항목의 프롬프트를 붙여넣는다. 같은 대화에서 다음 항목을 이어서 만들 때는 항목 프롬프트만 붙여넣어도 된다.
3. 받은 PNG를 표의 **파일 이름**으로 저장해서 전달한다. 같은 장면을 다시 뽑은 경우에는 `-v2`처럼 번호를 바꾼다.

### 참고 그림 위치 (`site-publish-checkout/public/prologue/`)

| 용도 | 파일 |
|---|---|
| 바깥 장면 밝기 (승인본) | `snow-inn-v3.png` |
| 실내 장면 밝기 (승인본) | `tavern-interior-v2.png` |
| 바로 앞 장(ST3) 이어짐 | `st3-record-portrait-v1.png` |
| 지역 지도 1 형식 | `iron-gate-village-map-portrait-v3.png` |
| 주점 패 건네기 구도 (P05~P12) | `tavern-wager-portrait-v2.png` |
| 이야기 패 테두리·새김 | `../story-cards/iron-gate-two-front-v1.png`, `iron-gate-two-back-v1.png` |

### 공통 스타일 (매번 먼저 붙여넣기)

```
Hand-drawn 2D cartoon fantasy game illustration, expressive irregular ink outlines, simplified cel-shaded forms with two or three clear shading values, restrained rough painted texture, muted indigo, slate blue, charcoal and moss palette with small warm amber light accents, readable silhouettes and environment. Match the attached approved reference's brightness and rendering. Avoid photorealism, glossy 3D rendering, plastic skin, smooth airbrushed shading, heavy bloom and dense decorative detail.
Format: tall vertical 9:16 portrait (941×1672). Keep the main subject inside the central 80% of the width, because the sides may be cropped. Keep the bottom quarter calm and uncluttered for game subtitles.
Absolutely no text, letters, numbers, runes, signatures or watermarks anywhere in the image, unless the prompt explicitly asks for a symbol.
The world: floating sky islands above a sea of clouds, old stone and timber, quiet mysterious adventure mood. Animal-folk residents are anthropomorphic, wear clothes, and are drawn as cartoon characters, not realistic animals.
```

---

## 1. 지역 지도 (3장)

지도에는 **장소 표시(점·글자)를 그리지 않는다**. 장소 표시는 앱이 덮어 그린다. 대신 각 장소가 아래 위치(가로 %, 세로 %)에 알아볼 수 있게 놓이도록 한다. 그림이 오면 `lib/rpg-journey.ts`의 좌표를 그림에 맞춘다.
참고 그림: `iron-gate-village-map-portrait-v3.png` + `snow-inn-v3.png`

| 파일 이름 | 프롬프트 |
|---|---|
| `region-2-map-portrait-v1.png` | Illustrated fantasy region map seen from a high three-quarter bird's-eye view, painted like a game world map. A winding path climbs upward through one sky-island region. Bottom center: a tall misty waterfall pouring off the island edge into the clouds, with a small stone landing and table beside it. Lower left: a quiet riverbank where soaked old papers lie drying on rocks. Upper right, below the cliff: a small old boathouse half hidden in mist. Center: a long swaying rope-and-plank sky bridge spanning between two floating islands, with a small rest platform in its middle. Right side near the bridge: a thick worn rope knot anchor post. Upper left: a small ruined stone archive room. Top center: a collapsed stone colonnade with faded purple banners. Readable path linking all places, twilight sky, cool blue mist, small warm lanterns at each place. No labels, no markers, no text. |
| `region-3-map-portrait-v1.png` | Illustrated fantasy region map seen from a high three-quarter bird's-eye view, painted like a game world map, higher and colder than the previous region. Bottom center: an enormous ancient tree with silver branches and hanging blue lanterns under moonlight. Right side: a small white stone letter archive with an arched door. Center: a high sanctuary of white pillars surrounded by golden-leaved trees, glowing honey-amber. Upper left: scattered blackened stones and old ash marks beside the path. Top center: a black obsidian altar on a rocky ridge with a smoldering brazier and drifting ash. A path climbs from the tree to the altar. Moonlit twilight, clouds below. No labels, no markers, no text. |
| `region-4-map-portrait-v1.png` | Illustrated fantasy map view of the summit above the clouds. In the center, one colossal world tree with crimson-red leaves rises from a single floating island, its roots wrapping a huge round table plateau. Many small floating islands drift far below in a sea of clouds. A single stone stairway path approaches the tree from the bottom of the image. Late twilight with deep indigo sky and warm red leaves as the main accent, majestic but quiet. No labels, no markers, no text. |

## 2. 스테이지 장면 (14장)

참고 그림: 바깥 장면은 `snow-inn-v3.png` + `st3-record-portrait-v1.png`. 인물은 장면마다 두 명만 그린다.

| 파일 이름 | 프롬프트 |
|---|---|
| `st4-before-portrait-v1.png` | Edge of a floating island where a misty waterfall pours endlessly down into the clouds. A flat blue stone game table on the wet rocks by the water, with blank white game tiles on it. Two residents wait at the table: a cheerful brown otter fisherman with a light muzzle, a worn straw hat, a teal vest and a short fishing rod over his shoulder; and a slender blue-grey heron messenger with a long thin beak, white forehead feathers and a navy scarf, standing upright and neat. Cool blue mist, wet glistening stone, faint rainbow in the spray. |
| `st4-after-portrait-v1.png` | Close view of a soaked old parchment record spread on the blue stone table by the waterfall, the writing washed into blurry stains, and over it a faint crown-shaped emblem mark that is still clear. The heron messenger's wing-hand and the otter's paw are at the edges of the frame. Mist and water drops, quiet discovery mood. The crown mark is a simple outline symbol only, no letters. |
| `st5-before-portrait-v1.png` | Middle of a long rope-and-plank sky bridge between two floating islands, with a small wooden rest platform and a game table in the middle. The bridge sways in the wind; one rope knot on the railing is visibly frayed while others are fine. Two residents: a small energetic red squirrel bridge mender with tufted jagged ear fur, a hemp headband and a coil of rope on the shoulder; and a young adult man guide with light brown skin, short black hair, blue goggles on his forehead and a bronze compass necklace. Clouds far below, wind-blown banners, sense of height. |
| `st5-after-portrait-v1.png` | View from the end of the sky bridge looking ahead: across the bridge, the ruins of a long stone colonnade with faded purple banners appear on the next island. The squirrel mender and the goggle guide stand at the bridge end, small in the frame, looking toward it. Evening wind, drifting clouds. |
| `st6-before-portrait-v1.png` | A collapsed stone colonnade with broken pillars and old faded purple banners, a heavy black basalt game table in the middle. Two guardians at the table: a self-moving ancient iron helmet-and-armor guardian (empty armor, only a helmet with a narrow slit glowing faint amber, one horn ornament on the iron shoulder broken off); and an adult woman banner keeper with dark skin, short silver-grey hair, a purple cloak and brass leaf-shaped earrings, standing proud. Solemn, heavy, quiet. |
| `st6-after-portrait-v1.png` | The same ruined colonnade after the match, a little calmer: the iron armor guardian lowers its helmet slightly; beside the table a small brass owl automaton record keeper (one monocle lens, one round glass eye, a small purple ribbon) opens an old ledger. Dust floats in the light from a broken roof. Wistful mood. |
| `st7-before-portrait-v1.png` | Under an enormous ancient tree with silver branches and hanging blue glass lanterns at night, a long record-keeping table with books and blank game tiles. Two residents: a deer scholar with deep teal fur, silver twig-like antlers, small round glasses and an old bookmark necklace; and an adult man moon-lantern keeper with long black hair tied low, a silver hairpin, navy clothes and a blue glass lantern at his shoulder. Soft moonlight, calm but tense. |
| `st7-after-portrait-v1.png` | Close view of an old match record book open on the table under blue lantern light. The rows are blank lines without readable writing; on the second row there is no name, only a small crown emblem and a faded crest. The deer scholar's hand points at it from the edge. Moonlight, silver leaves falling. Crown emblem as a simple outline symbol only, no letters. |
| `st8-before-portrait-v1.png` | A high sanctuary of white pillars surrounded by golden-leaved trees, warm honey-amber light, a game table of amber stone. Two residents: an older woman sanctuary recorder with short platinum hair, half-moon glasses, a cream hood and an amber brooch, kind and curious; and an ivory-furred white fox stargazer with golden eyes, a navy headband with a star ornament and a small brass astrolabe. Starry dusk sky above the pillars. |
| `st8-after-portrait-v1.png` | Close view of an old folded letter with a red wax seal stamped with a crown emblem, lying on the amber stone table next to an open archive box. The older woman recorder's hand holds the box lid. Warm amber light, golden leaves, quiet and moving mood. No readable writing on the letter. |
| `st9-before-portrait-v1.png` | A black obsidian altar on the last rocky path toward a red world tree, a brazier that never cools and ash drifting in the wind. An obsidian game table. Two residents: an adult woman ember keeper with short reddish-brown hair, ash-grey skin, a scar through one eyebrow, a deep red hood and bronze ornaments, stern; and a black lizard obsidian carver with red eye rims, small bronze glasses and an obsidian shard necklace. Dim red embers against indigo dusk. |
| `st9-after-portrait-v1.png` | The obsidian altar after the match: the brazier glows softer, two carved emblems interlocking on the altar face are lit by embers. The ember keeper stands looking up the path; in the far distance the red world tree is visible above the clouds. Ash floating, solemn hope. Emblems are simple carved shapes only, no letters. |
| `st10-before-portrait-v1.png` | Summit above the clouds under a colossal world tree with crimson leaves; a huge round table carved from black world-tree wood with red grain and golden sap lines. Across the table sit two guardians who look exactly identical: tall figures in matching old dark-crimson and black armor with deep hoods, their faces hidden in hood shadow, same height, same pose mirrored. They are guardians, not kings: no crowns. Falling red leaves, deep indigo sky, majestic and quiet. |
| `st10-after-portrait-v1.png` | The same round table under the red world tree after the final match: the two identical hooded guardians have stood up and face each other, one slightly turned away, the last game tiles lying face down on the table. Red leaves drifting, golden light from the tree's sap. Bittersweet, final mood. |

## 3. 서브퀘스트 (6장)

참고 그림: 바깥 장면은 `snow-inn-v3.png`, `dice-den`만 `tavern-interior-v2.png`

| 파일 이름 | 프롬프트 |
|---|---|
| `quest-4-portrait-v1.png` | By a misty stream below the waterfall, the blue-grey heron messenger with a navy scarf carefully unfolds a dripping old parchment record pulled from the water, showing it toward the viewer. The writing is washed away; only a faint emblem remains. Cool mist, river stones. |
| `quest-5-portrait-v1.png` | On the sky bridge, the small red squirrel mender with a hemp headband reweaves a frayed rope knot on the bridge railing; a pair of traveler's hands (viewer's side, gloved, plain brown sleeves) holds the other end of the rope to help. Wind, clouds below, teamwork mood. |
| `quest-6-portrait-v1.png` | In a small ruined stone archive room, the brass owl automaton (monocle lens, round glass eye, purple ribbon) opens a huge old ledger on a lectern. One entry's name space is scraped blank. Dust in a beam of light, purple banner scraps. No readable text. |
| `quest-8-portrait-v1.png` | Inside a small white stone letter archive, the older woman recorder (short platinum hair, half-moon glasses, cream hood, amber brooch) takes a sealed old letter out of a wooden archive box, red wax seal facing the viewer. Warm amber candle light. No readable text. |
| `quest-9-portrait-v1.png` | At the obsidian altar, the ember keeper woman (short reddish-brown hair, ash-grey skin, eyebrow scar, deep red hood) crouches with the traveler and examines two interlocking carved emblems on the altar stone, lit by a small ember she holds up. Ash drifting, dim red light. |
| `dice-den-portrait-v1.png` | Dark interior of an old boathouse under a waterfall, fog seeping through plank walls, a small lantern. On a worn wooden table lie five dice. Across the table sits a wandering gambler: a wide-brimmed hat shading his eyes, a sly half smile, a worn long coat, rolling one ivory die in his fingers. Rope coils and an old boat in the background. Dim but readable, small warm light, cool mist. Dice faces with pips are allowed. |

## 4. 이야기 장면·엔딩 (7장)

| 파일 이름 | 참고 그림 | 프롬프트 |
|---|---|---|
| `st6-flame-two-portrait-v1.png` | `snow-inn-v3.png`, `iron-gate-two-front-v1.png` | At the end of the ruined colonnade, an old stone pedestal in a beam of light holds a single cream stone game tile, carved like the attached tile reference: a large dark number 2 and a sacred flame emblem below it. Dust motes, purple banners around. This tile is the only place where the number 2 and the symbol appear. |
| `st9-key-two-portrait-v1.png` | `snow-inn-v3.png`, `iron-gate-two-front-v1.png` | Inside a blackened, scorched stone pedestal at the obsidian altar, a cream stone game tile is revealed among cooling embers, carved like the attached tile reference: a large dark number 2 and a secret key emblem below it. Red ember glow, ash. This tile is the only place where the number 2 and the symbol appear. |
| `ending-thrones-portrait-v1.png` | `snow-inn-v3.png` | Beneath the crimson world tree, behind the great round table, two empty ancient thrones of black world-tree wood stand side by side, slightly dusty, red leaves resting on the seats. No one sits there. Golden sap light, falling leaves, deep quiet. |
| `ending-kings-portrait-v1.png` | `snow-inn-v3.png` | A memory scene with soft hazy edges: two young kings, brothers, in simple crowns. Upper half: the elder brother standing before a massive closing iron gate, pushing it shut, seen from behind. Lower half: the younger brother kneeling before a sacred flame in a brazier, shielding it with his hands. Faces kept blurry and unclear. Muted, dreamlike, sorrowful. |
| `ending-handoff-portrait-v1.png` | `tavern-wager-portrait-v2.png`, `tavern-interior-v2.png` | Same composition as the attached tavern reference: a dark candlelit tavern, a worn wooden table in the foreground, a hand sliding one white stone game tile toward the viewer. This time the one handing it over is the traveler who finished the journey: a hooded traveler in a weathered travel cloak, face mostly in hood shadow, a calm smile. The tile shows a crimson crescent moon emblem and the number 2 like the reference. A new young wanderer's hands at the bottom edge reach for it. Fireplace glow, moonlit window. |
| `true-ending-record-portrait-v1.png` | `tavern-interior-v2.png` | On an old worn wooden table, an ancient leather-bound record book lies open under a single candle: the record of the first gambler. The pages show only faint lines and small tile emblems (crown, iron gate, flame, key), no readable writing. Four cream stone game tiles rest beside it. Dark warm interior, reverent mood. |
| `true-ending-village-portrait-v1.png` | `tavern-interior-v2.png` | Inside the snowy village tavern at night, the new wanderer sits at a table spreading out game tiles while telling a story; a few villagers and children lean in to listen, warm fireplace light, snow visible through the window. Cozy, hopeful ending mood. Tiles shown with simple emblems only, no text. |

## 5. 이야기 패 (4장, 1024×1536)

참고 그림: `iron-gate-two-front-v1.png`, `iron-gate-two-back-v1.png`. 공통 스타일의 "no text" 줄은 빼고, 아래 문장을 그대로 쓴다.

| 파일 이름 | 프롬프트 |
|---|---|
| `sacred-flame-two-front-v1.png` | Recreate the attached tile reference exactly in frame, material, chipped cream stone, carving style, lighting and dark vignette background, 1024×1536. Change only the symbol: a large carved dark number 2 at the top and below it a sacred flame emblem (a single torch-like flame rising from a small bowl), carved in the same thick line style. No other text. |
| `sacred-flame-two-back-v1.png` | Recreate the attached tile back reference exactly in frame, material and carving style, 1024×1536. The back shows one carved image only: two layered flames, one inside the other, still burning. No number, no text. |
| `secret-key-two-front-v1.png` | Recreate the attached tile reference exactly in frame, material, chipped cream stone, carving style, lighting and dark vignette background, 1024×1536. Change only the symbol: a large carved dark number 2 at the top and below it a secret key emblem (an old ornate key, vertical), carved in the same thick line style. No other text. |
| `secret-key-two-back-v1.png` | Recreate the attached tile back reference exactly in frame, material and carving style, 1024×1536. The back shows one carved image only: two old keys overlapping and merging into one shape. No number, no text. |

## 6. 선택 그림 (2장)

| 파일 이름 | 프롬프트 |
|---|---|
| `haro-ivory-die-v1.png` (정사각, 1024×1024) | Single game item icon: an old ivory six-sided die with dark carved pips, slightly yellowed and chipped, on a plain dark transparent-friendly background, centered, bold ink outline, cartoon fantasy style. No text. |
| `st10-guardian-portrait-v1.png` (정사각, 1024×1024) | Character portrait bust of one of the two identical summit guardians: tall figure in old dark-crimson and black armor with a deep hood, face hidden in hood shadow with only a faint glint of eyes, no crown, red world-tree leaves behind. Same look for both guardians (one image used for both). No text. |

## 받은 뒤 반영 (Claude가 로컬에서)

- PNG는 `public/story/{키}-portrait-v1.png`(장면), `public/story-cards/{id}-front/back-v1.png`(패)에 원본으로 보존하고, 같은 이름의 `.webp`를 만든다.
- 장면 키를 `lib/rpg-chapters.ts`의 `CHAPTER_ART_READY`에 넣고, 지도 좌표는 `lib/rpg-journey.ts`에서 맞추고, 패 경로는 `lib/rpg-story-card-art.ts`에서 바꾼다. 선택 그림은 `lib/item-battle-relics.ts`의 `relicImage`와 `RPG_GUARDIANS` 아바타를 바꾼다.
- 브라우저에서 확인하고 테스트를 실행한 뒤 로컬에만 저장한다. 빌드·배포는 따로 요청이 있을 때만 한다.
