# Tabletop clarity · 0.5.24

Generated with the built-in image_gen tool in edit mode. Original palette and material identity are retained. Source outputs are 1254 × 1254 pixels; no upscaling is used. Production WebP encoding uses quality 94.

Production assets:

- `/workspace/sites/turntale/public/materials/walnut-0524.webp`
- `/workspace/sites/turntale/public/materials/sandstone-0524.webp`

The earlier stage-one atlas cell had about 397 × 397 pixels. Its replacement has about ten times the source pixel area. Both corrected materials use a 640 CSS-pixel mirrored tile pitch, instead of stretching one cell across a table several thousand pixels wide. At overhead, `TableSurfaceViewport` draws only the visible rectangle outside the 3D camera raster. The moving and final tables share texture origin and pitch. A 500 ms fade blends in the native surface; the painted glaze is removed at overhead.

The prior extra card-face overlay was removed: this request refers to the tabletop surface.

## Prompts

### wood0524

Reference/edit target: `/workspace/sites/turntale/public/turntale-wood-0513.webp`

Use case: precise-object-edit. Asset type: high-resolution square seamless tabletop material for the existing TURNTALE game. Edit target: the supplied walnut wood texture. Preserve its warm medium-dark walnut-brown palette, flowing horizontal wood grain, quiet natural knots, top-down flat composition and restrained painterly realism. Re-create the material at 2048 x 2048 with substantially more crisp fine grain, narrow pores, small individual fibers, and subtle worn-polish micro-scratches. Details must stay sharp when seen at native pixel size. Balanced rich dark grain contrast; remove the whitish dusty veil and soft low-frequency haze. Flat even diffuse light, no specular glare, no baked vignette, no furniture edge, no objects, no letters, no interface, no watermark. Fill the entire square edge-to-edge with wood. Maintain calm readability for game tiles placed above it.

### stone0524

Reference/edit target: `/workspace/sites/turntale/public/stage-table-materials-0518.webp`

Use case: precise-object-edit. Asset type: one standalone high-resolution square stone tabletop material for stage 1 of the existing TURNTALE game. Edit target/reference: ONLY the upper-left tan sandstone square in the supplied 5-column by 2-row atlas; do not recreate the atlas or any other region. Produce a single 2048 x 2048 close-up flat top-down material, edge-to-edge, matching that upper-left cell's warm aged ochre-beige carved sandstone, weathered irregular stone plates and very faint ancient curving engravings near far corners. Resolve crisp narrow recessed cracks, defined small stone grains and mineral flecks, tiny chips and worn tooling marks. Strong natural material separation without bright white haze or chalky flatness. Moderate ochre midtones with darker warm fissures, restrained painterly realism matching existing assets, diffuse even illumination, no blur, no dramatic lighting, no rim, no raised objects, no playing tiles, no text, no symbols resembling writing, no watermark. Keep center relatively calm for game UI. One texture only, no collage.

## Validation

Symmetric classic speech anchors, stage speech compatibility, viewport-origin/pitch rendering, material readiness, all-region framing, and TypeScript checks passed. Native material SVGs were rendered at 2× screen resolution and inspected for crisp grain and stone crevices. Browser animation replay remains unverified because managed preview was unavailable in this session.

