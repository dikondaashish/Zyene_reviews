# Zyene Reviews mascot — character source v1

## Source of truth

The user selected the orange five-lobed character as the platform mascot.
Preserve its identity in future assets.

- Approved master image: [transparent PNG](../../public/brand/mascot/zyene-mascot-master-v1.png).
- Character sheet: [transparent PNG](../../public/brand/mascot/zyene-mascot-character-sheet-v1.png).
- Sheet generation prompt: [exact prompt](./zyene-mascot-character-sheet-v1.prompt.txt).

Use the master as the primary identity reference and the sheet for pose and
expression direction. If details differ, the master wins. The ribbon, comet,
and mechanical oracle concepts from earlier exploration are not this mascot.
The new side and back views are visual interpretations; this sheet is a raster
reference, not a rigged model, orthographic blueprint, or 3D source file.

## Identity that must remain consistent

- Soft orange body with five rounded lobes: curled top, two broad side lobes,
  and two large oval lower lobes folded forward.
- The thick top curls toward viewer-right in the approved front-facing image.
  Rotate this feature with the body; do not mirror it independently.
- Two detached orange droplets of unequal size float above the top lobe.
- One recessed warm-charcoal oval face panel on the front only.
- Two small ivory dot eyes and an ivory curved mouth. Eye arcs are allowed
  for happiness and rest.
- Tactile satin silicone appearance, fine microtexture, soft broad highlights.
- Broad compact proportions, gently asymmetrical pose, calm and friendly manner.
- Side lobes bend as whole shapes. Do not add fingers, elbows or mechanical joints.
- Back remains orange; no face, logo, seams or extra appendages.

## Palette and rendering

| Element | Target art direction |
| --- | --- |
| Body | Zyene orange `#FF4F00` |
| Face | Warm charcoal, approximately `#211B18` |
| Facial marks | Warm ivory, approximately `#FFF2D6` |

These are material direction colors, not exact sampled pixel values.
Rendered colors vary with lighting. Keep orange dominant and avoid gold,
chrome, neon glow, glass helmets, costumes, props and decorative clutter.

Use a consistent soft studio key light from the upper left, broad fill,
subtle contact shading within the body, and clean transparent edges.
No painted backdrop, floor shadow or baked-in checkerboard.

## Character sheet index

Read left to right, top to bottom. All nine cells show the full body.

| Cell | View or state | Suggested use |
| --- | --- | --- |
| 1 | Front | Neutral identity reference |
| 2 | Side | Depth and volume reference |
| 3 | Back | Rear silhouette reference |
| 4 | Welcome | Onboarding and first visit |
| 5 | Listening | Support and feedback collection |
| 6 | Thinking | AI response drafting or processing |
| 7 | Success | Completed connection, saved action, milestone |
| 8 | Needs help | Recoverable issue with a clear next step |
| 9 | Resting | Quiet idle state or no pending activity |

Use success for completed actions, not only positive customer ratings.
Keep feedback collection equally welcoming for every rating.
The mascot should support a message, not replace status text or instructions.

## Future asset workflow

1. Attach the approved master image to every image-generation request.
2. Attach this sheet as a secondary reference when a matching pose is useful.
3. Specify only the requested pose or expression change and repeat the identity locks.
4. Generate each production pose separately as a full-resolution transparent PNG.
   The sheet is a reference board, not a production sprite atlas.
5. Verify facial features, five-lobed anatomy, two droplets, proportions,
   face placement and transparency against the master.
6. Save new files with descriptive names and a version suffix. Preserve the master.

Reusable prompt starter:

> Use the attached Zyene Reviews approved mascot as the exact identity reference.
> Preserve the orange five-lobed anatomy, thick curled top, two floating droplets,
> charcoal oval face panel, ivory facial marks, proportions and satin silicone
> texture. Change only the pose and expression to [desired state]. Full-body 3D
> render, consistent soft studio lighting, transparent alpha background,
> generous padding, no text, floor, shadow beneath the body or additional props.

## Platform implementation notes

- Master public URL: `/brand/mascot/zyene-mascot-master-v1.png`.
- Sheet public URL: `/brand/mascot/zyene-mascot-character-sheet-v1.png`.
- Both files are 1254 × 1254 PNGs with verified transparency.
- For later UI integration, use the existing Next.js image conventions.
  Give decorative uses empty alt text; describe meaningful uses briefly.
- Keep UI state understandable without the artwork.
- If animated later, use gentle movement and respect reduced-motion preferences.

Created with the built-in image-generation tool. Only source assets and this
guide were added; the platform UI has not been changed.

