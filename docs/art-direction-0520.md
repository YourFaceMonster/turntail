# TURNTALE 0.5.20 art direction

Generation method: built-in image_gen, one landscape plate per region. Reference: public/turntale-stage-map-0515.webp (style and world reference only).

## Shared production prompt

Use case: stylized-concept. Asset type: production landscape environment plate for TURNTALE fantasy tile game. Match the map's jewel-like indigo/teal/gold palette, chunky charming stone forms, vegetation, glowing lanterns and floating-island atmosphere, with a human eye-level viewpoint seated at a game table. Create one fully finished wide 16:9 high-resolution landscape painting, not a grid. Horizon about 40 percent down. Central lower 60 percent remains an unobstructed clearing for the independently rendered table and characters. All large props stay at the sides and in the distance. Hand-painted fantasy oil illustration, layered brush strokes, slightly impasto highlights on stone and foliage, controlled rich colours, detailed materials, soft lost-and-found edges and atmospheric perspective. Lighting from upper left. No photorealistic microdetail, glossy CGI, vector outlines or pixel art. No foreground characters, animals, tables, chairs or tiles. No text, labels, UI, border or watermark.

## Region-specific prompt additions and production paths

### Stage 1

Starlit gate. Weathered golden-grey stone archway and broken pillars framing a cloudy blue floating-island horizon. Warm amber hanging lanterns, ivy and square flagstones. Deep indigo night with little gold highlights.

Saved production asset: public/environments/stage-1-0520.webp

### Stage 2

Lantern encampment. Warm ochre canvas tents, coiled ropes, split firewood, pots and tiny amber lanterns to the sides. A soft warm fire glow from offscreen left. Pine trees with cool indigo floating-island sky behind. A welcoming tawny and forest-green campsite.

Saved production asset: public/environments/stage-2-0520.webp

### Stage 3

Mosswood clearing. Ancient knotted green tree roots, ferns and broad mossy stones, small luminous turquoise mushrooms to the sides. Golden-green foliage, cool blue mist between tree trunks; inviting enchanted forest on a floating island.

Saved production asset: public/environments/stage-3-0520.webp

### Stage 4

Waterfall terrace. Stepped mossy cliffs and two beautiful waterfalls dropping into turquoise clouds behind a broad damp slate clearing. Reeds, blue-green wet rocks and small golden lanterns at the two sides, a graceful rope bridge in the distance.

Saved production asset: public/environments/stage-4-0520.webp

### Stage 5

Cloudbridge rest stop. A broad stable timber platform between two floating islands, thick rope railings at the left and right perimeter, weathered wooden posts, coiled rope, a small travel pack at one edge. Amber lanterns, airy pale-blue clouds, indigo dusk. No foreground bridge planks crossing the center.

Saved production asset: public/environments/stage-5-0520.webp

### Stage 6

Guardian gallery. Ruined ancient hall open to the blue cloudy sky. Stout basalt columns and worn purple banners along the sides, bronze lamps and broken carved stone blocks. Indigo violet shadows with dignified muted golden light; ancient ceremonial sanctuary.

Saved production asset: public/environments/stage-6-0520.webp

### Stage 7

Moonlit elder tree. Vast silver-blue roots framing a small quiet clearing under a majestic old tree, softly glowing blue glass lanterns hanging among branches, moonflowers, pale moths and silver leaves at the sides, deep midnight teal and lunar blue with delicate ivory moonlight.

Saved production asset: public/environments/stage-7-0520.webp

### Stage 8

Starlight sanctuary. Open ivory and warm gold stone colonnade high above clouds. Fine gold astronomical rings and a small armillary instrument to one side, golden leaves, warm honey-coloured light in a calm deep sapphire night. A broad open ceremonial landing.

Saved production asset: public/environments/stage-8-0520.webp

### Stage 9

Ember altar. A dramatic obsidian terrace with jagged charcoal rock, small embers and low bronze braziers far to the left and right, black stone steps and very restrained red cracks at the perimeter, cold indigo sky beyond. Oxblood, smoky violet, charcoal and copper-orange light.

Saved production asset: public/environments/stage-9-0520.webp

### Stage 10

Crimson World Tree summit. The enormous twisted trunk of a sacred crimson-leaf tree frames the upper sides. Exposed ancient dark roots and golden sap lines, crimson leaves glowing softly, distant floating isles far below in deep sapphire clouds, dignified gold lanterns. Grand and ancient, warm crimson and gold against deep indigo night.

Saved production asset: public/environments/stage-10-0520.webp


## Integration

The original source images remain unchanged. The new plates are shared by entrance, scene collection, stage descriptions, stage-clear reveals and the live table backdrop. The stage camera changes angle and distance together; all three renderers sample the same motion. Painted backgrounds magnify at most 6 percent. Tile geometry and number placement live in lib/stage-tile-design.ts.

