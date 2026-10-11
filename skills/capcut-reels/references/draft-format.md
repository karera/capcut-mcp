# CapCut draft format: what matters when editing

Facts checked on this machine (CapCut 9.5.0, Windows, draft format 187.0.0) or taken
from capcut-cli's format docs (`E:\reference\capcut-cli\docs\draft-schema\`, MIT,
audited read-only 2026-10-11). Read this before any edit that goes beyond the tools'
defaults, and before trusting a draft from a different CapCut version.

## Files in a draft folder
- `draft_content.json`: the timeline. `template-2.tmp` in the same folder is a mirror of it.
- `Timelines/<content.id>/draft_content.json` (+ its own `template-2.tmp`): a second
  mirror CapCut 9.x keeps. On 9.5 it was byte-identical to the root file. On a clone
  without `Timelines/`, CapCut rebuilt it from the root file on first open. Some builds
  (9.2.8 Mac) read only the nested copy, so a save must update every mirror.
- `draft_meta_info.json`: the draft's identity (`draft_name`, `draft_id`,
  `draft_fold_path`) and `draft_materials`, the list of imported media.
- `crypto_key_store.dat`: present on drafts made from CapCut templates. Their
  `draft_content.json` is encrypted and can't be read or edited. Don't try to decrypt.

## Timing
- Microseconds everywhere. `target_timerange` is the timeline; `source_timerange` is
  the footage used.
- `source_timerange.duration = target_timerange.duration x speed`.
- Text segments have `source_timerange: null` once CapCut has saved them.

## Imported media must be registered
- Every local video, photo or audio material carries `local_material_id`, the `id` of
  its entry in `draft_meta_info.json` -> `draft_materials` (group `type: 0`).
- Entry shape: `file_Path`, `metetype` (`video` / `photo` / `music`), `duration`,
  `width`, `height` (0 for music), `extra_info` (file name), `type: 0`, `item_source: 1`.
- A blank or wrong `local_material_id` shows the clip as unresolvable / "file
  inaccessible" on CapCut 9.1+ (capcut-cli cites JmsLdrn/capcut-mcp#1).
- Library music keeps its `music_id` and an empty `local_material_id`. A user's own
  audio file is `type: "extract_music"`, `music_id: ""`, `category_name: "local"`.

## Versions
- CapCut 10.x is reported to reject tool-written drafts as corrupted. Treat any draft
  saved by 10.x as read-only until it's been tested on a copy.
- CapCut updates itself. Before the first launch after an update, back up the whole
  `%LOCALAPPDATA%\CapCut\User Data\Projects\com.lveditor.draft` folder with CapCut
  closed, and keep the installer of the version that works.
- Top-level `version` is `360000` on every known 8.x/9.x draft; a larger value is a
  format nothing here has evidence for.

## For later phases (read the capcut-cli docs before building these)
- Zooms and pans: `segment.common_keyframes` on `uniform_scale`, `position_x`,
  `position_y`, with easing (`03-keyframes-and-animations.md`).
- Fades: use the animation system (intro/outro slots), not alpha keyframes, which
  don't render.
- Word-level caption highlight: multiple style ranges inside the text material's
  `content`, not keyframes (`02-materials.md`). Ranges count UTF-16 code units.
