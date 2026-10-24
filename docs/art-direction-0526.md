# Heirloom classic table · 0.5.26

The standard mode now uses a deep walnut tabletop, a thick rounded bullnose, a carved under-rim apron, fine boxwood-style stringing, four broad turned legs and a central baluster connected by splayed cross braces. Antique-brass accents are limited to a narrow rim band and small brace end caps. The camera, tabletop origin and character seat height remain consistent with the existing scene.

## Material

Production asset: `/workspace/sites/turntale/public/materials/heirloom-walnut-0526.webp`

The built-in image_gen tool was used in edit mode with `/workspace/sites/turntale/public/materials/walnut-0524.webp` as the reference. Output: 1254 × 1254 pixels, encoded as WebP at quality 94 without upscaling.

Final prompt:

Use case: precise-object-edit. Asset type: premium antique walnut tabletop material for the existing TURNTALE game. Edit target: the supplied warm walnut grain. Transform the wood into an expensive heirloom solid-walnut library gaming table, aged for a century and carefully maintained. Deep dark chocolate and chestnut heartwood, restrained warm amber figuring, tight curly and feathered grain, natural small burls, subtle rubbed shellac patina with fine handling marks. Rich dimensional pores and delicate grain at native pixel size, dense hardwood rather than cheap pale furniture boards. Quiet, sophisticated and warm; low-gloss hand-rubbed finish without white haze, plastic sheen or bright orange stripes. Flat top-down edge-to-edge square material with even diffuse lighting, no perspective, no objects, no table rim, no letters, no engraved emblem, no watermark. The whole field should be usable as a seamless mirrored repeat beneath readable game tiles. Preserve a calm material texture, with no focal illustration or collage.

## Geometry and rendering

`lib/classic-table.ts` defines the standard table's moulded rim, apron, baluster, turned legs, cross braces and muted brass accents. Curved surfaces use profile normals for directional shading. Their hidden back faces are culled. Walnut grain follows the vertical axis on legs and the baluster. `lib/furniture-renderer.ts` is shared by the live entrance and static visual checks. The existing challenge structures retain their own geometry.

## Fixed floor sizing

The floor/trick dimensions depend on viewport, floor grid and fixed initial rack allocation. Hand count and current hand width affect only hand tile size. Portrait track heights stay anchored to the floor dimensions; the landscape board allocation uses the initial rack column count. Flight source sizes no longer overwrite the board tile size. Hand-gap transitions are capped to keep hand size monotonic.

## Validation

All counts from 0 through 54 were checked across portrait/landscape and 2/3/4-player layouts. Floor/trick sizes remained constant while the hand fitted its region. Existing layout and stage-framing checks passed. The production furniture painter was rendered in two camera poses to inspect leg mass, edge depth, inlay and grain. TypeScript and build checks are included before publication.

Browser playback remains unverified because the managed preview exits on the existing PID 14 `/site` dev-server lock.

