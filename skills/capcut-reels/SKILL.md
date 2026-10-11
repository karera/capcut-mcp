---
name: capcut-reels
description: >-
  Plan, assemble, and edit CapCut desktop drafts with professional quality
  using the capcut MCP server (tools named mcp__capcut__*). Covers short-form
  vertical video (TikTok, Reels, Shorts) and longer YouTube edits: hooks,
  pacing, punch-ins, J/L cuts, captions, text overlays, music, audio levels,
  transitions and effects reused from the user's style library. Includes
  playbooks for mood/text-over-music clips, football edits, painting process
  videos, and startup/founder videos. Use this skill whenever the user wants
  to build, cut, re-cut, caption, polish, or add effects to a CapCut project,
  or asks how to make a video look more professional, even if they don't
  mention CapCut by name.
---

# CapCut reels: professional editing

You are editing as a seasoned short-form editor would, using the capcut MCP tools.
The tools handle mechanics; this skill supplies the judgment. A technically valid
draft is not the goal. A video someone watches to the end is.

## Before you touch the draft

1. **Identify the format** and read its playbook:
   - Text over music, no voice (car clips, "maturing is realizing..."): `references/formats/mood-text.md`
   - Football (raw footage plus fun inserts): `references/formats/football.md`
   - Painting process, timelapse, optional voiceover: `references/formats/painting.md`
   - Startup, founder, or project explainers: `references/formats/startup.md`
   - Anything else: use the closest playbook and the shared references.
2. **Read the shared standards** you'll need:
   - Cutting, pacing, hooks, punch-ins, b-roll, J/L cuts: `references/editing-craft.md`
   - Captions and on-screen text: `references/captions-and-text.md`
   - Music, voice, levels, sound effects: `references/audio.md`
   - Transitions, effects, filters, text styles: `references/style-library.md`
   - Aspect ratios, lengths, safe zones: `references/platform-specs.md`
   - Draft file format, media registration, CapCut versions: `references/draft-format.md`
3. **Write a short edit plan** and show it to the user before building: the hook,
   the sequence of beats with rough timings, text lines, music choice, and which
   style-library effects you'll use. Editing is taste. Confirming the plan first
   is cheaper than rebuilding a timeline.

## Workflow

1. **Inspect.** `capcut_list_drafts`, then `capcut_read_timeline`. Note canvas,
   fps, track layout, and segment ids. `read_timeline` shows unsaved session edits
   (`fromSession: true`); pass `fromDisk: true` to compare with the saved file.
2. **Start from a known-good base.** For a new video, `capcut_clone_draft` from an
   existing draft (use `empty: true` for a clean timeline). Never author draft
   JSON from scratch; cloning is the only reliable way to get valid structure.
3. **Probe media.** Check each file's duration and resolution with ffprobe before
   placing it, so timings line up and nothing is placed past the end of a clip.
4. **Build in layers**, in this order: main footage or A-roll, then voice and
   music, then b-roll and inserts, then text and captions, then effects and
   transitions last. Effects on a timeline that is still changing get broken.
   - Media: `capcut_add_video`, `capcut_add_image`, `capcut_add_audio`
   - Tracks: `capcut_add_track` (separate tracks for b-roll, text, music, voice)
   - Cutting: `capcut_trim_segment`, `capcut_split_segment`, `capcut_delete_segment`, `capcut_move_segment`
   - Framing and levels: `capcut_set_props` (scale, position, rotation, opacity, volume, speed, visibility)
   - Text: `capcut_add_text` (needs `CAPCUT_TEMPLATE_DRAFT` set to a draft with a text layer)
   - Effects and transitions: copied from the style library via `capcut_raw_patch`
5. **Quality check** (below), then `capcut_validate`, fix anything flagged.
6. **Save.** Confirm CapCut is closed, then `capcut_save`. Never pass `force: true`
   unless the user explicitly asks for it; CapCut's autosave would overwrite the edit.
7. **Hand off** with finishing notes (below). The user reviews and exports in CapCut.

## Quality check before saving

Go through every item. Fix what you can; list the rest in the finishing notes.

- The first 1 to 2 seconds contain the strongest moment or line. No slow start.
- No black gaps, no accidental overlaps, nothing runs past the end of the music.
- Shot lengths vary; nothing feels like it was cut on a timer.
- Text sits inside the safe zone, never covers a face or the key action, and stays
  on screen long enough to read (see `captions-and-text.md`).
- Voice is clearly louder than music; music ducks under speech; no clipping.
- One consistent look: same caption style, same filter, transitions from the
  style library only, and no more of them than the playbook allows.
- The ending lands: a payoff, a call to action, or a clean loop back to the start.
- Length matches the platform and format target.

## Finishing notes

End every edit with a short list for the user covering what to check or finish by
hand in CapCut: effects to preview, keyframe animations, colour tweaks, music
licensing, and anything you skipped because the tools can't do it reliably.
Being clear about this is part of professional delivery. Don't attempt edits that
risk corrupting the draft just to avoid writing a note.

## Known tool limits

- Effects, transitions, animations, and rich text are best-effort through
  `capcut_raw_patch`. Only copy them from the user's style library draft; never
  invent effect ids, because they differ between CapCut versions.
- Speed: setting `speed` keeps the footage and changes the clip's length on the
  timeline (2x on a 10 s clip makes it 5 s), so check what comes after it for overlaps.
  `durSec` is always the length on the timeline. The rule (footage = timeline length x
  speed) hasn't been checked against a clip sped up in CapCut itself yet, so verify
  timelapse timing in CapCut and mention it in the finishing notes.
- If `read_timeline` or `validate` reports a `versionWarning`, the draft was saved by a
  CapCut version this server hasn't been tested with. Tell the user, edit only a copy,
  and ask them to check it in CapCut before doing more.
- Times at the tool boundary are in seconds. Never pass microseconds.
- Higher `render_index` / `track_render_index` draws on top. Text above b-roll
  above main footage.
- Keep the `.mcpbak` backups; a bad edit is recoverable from them.
