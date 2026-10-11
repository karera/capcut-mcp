# Roadmap

Goal: record one raw take on Windows, and get back an editable CapCut project with
tight cuts, word-synced captions, and clean motion graphics. Every piece stays its
own clip or real text element, so small fixes take seconds in CapCut instead of
re-prompting Claude.

Platform: Windows, CapCut desktop. Check the CapCut version before each phase; the
draft format changes between versions.

Target experience: the "Use" section of capcut-edit's README, on Windows. Drop a raw
take (or say which CapCut project you already cut) in a folder, describe the edit,
answer a few intake questions, approve the cut list and the graphics sheet, then
reopen CapCut and the project is in the list.

## Decisions

- Our MCP server writes the CapCut project (clone from templates, tested against this
  machine's CapCut). capcut-cli is a reference only: audit it and borrow its format
  knowledge (keyframes, alpha clips, text styling); don't depend on it.
- Rendering (graphics, looks, previews, check sheets) is Python with pillow, numpy and
  ffmpeg. Writing CapCut drafts stays in Node.
- Graphics behind the head stay in "Later" for now, even though the target prompt
  ("my best four videos orbiting my head") needs them.
- Style from another creator: local video files only, no downloading from links
  (platform terms usually forbid it).

## Reference projects (read for ideas, don't install)

Kept outside this repo in `E:\reference\` (only `capcut-edit` is cloned so far):

- `capcut-edit` (dominicapaci), at `E:\reference\capcut-edit`: a complete Mac-only editing workflow built as a skill.
  Best source of ideas: word-based cutting, captions, cards, looks, zooms, sound,
  safe zones, learning style from examples, and its lessons file.
- HyperFrames (heygen-com): renders graphics written as HTML into video. Windows
  support is unconfirmed; test before relying on it.
- capcut-cli (renezander030), at `E:\reference\capcut-cli`: the most complete public
  notes on the draft format (`docs/draft-schema/`, `docs/version-support.md`).
- burnshall-ui/capcut-mcp (Elixir): safety ideas such as schema-version warnings
  and path checks.

Never copy their code blindly. Read it, understand it, and rebuild what fits.
Run a security audit before running anything from them.

## Phase 1: solid basics

- [x] Finish and merge the `security-hardening` branch (draft-name path check,
      ffprobe without a shell, raw_patch key guard, remove author defaults, tests).
- [ ] Merge the `audio-template-fix` branch (CapCut library music works as the audio
      template; cloned drafts get their own name, id and folder). Waiting on a check
      in CapCut that the `0924 mcp-test` copy opens and plays.
- [x] Fix the speed bug: trim and split must account for clip speed. (Also fixed:
      setting speed now resizes the clip on the timeline; add_video takes speed into
      account; text segments, which CapCut saves without a source range, no longer
      crash trim/split.) Still to confirm against a clip sped up in CapCut itself.
- [x] `read_timeline` should be able to show unsaved session edits. (`fromSession`
      flag in the result; `fromDisk: true` for the saved file. `test/server.test.js`
      now drives the real server over MCP, ready for future tool tests.)
- [x] `validate` should also check that audio files exist.
- [x] Warn when the CapCut version differs from the tested one. (Tested: CapCut 9.5.0,
      draft format 187.0.0, in `TESTED` in `src/core.js`; bump it after re-testing.)
- [ ] Test end to end on a copy of a real project. (Done on disk: CapCut opened and
      re-saved `0924 mcp-test` with every edit intact. Waiting on the user's playback check.)
- [x] Audit capcut-cli (read only): what it knows about the draft format that we
      don't (keyframes, alpha clips, text styling). Write the findings into the skill.
      (`skills/capcut-reels/references/draft-format.md`. Safe to read: MIT, no runtime
      dependencies, commands run without a shell. It confirmed the speed rule and
      found the two gaps below.)
- [ ] Register added media in `draft_meta_info.json` (`draft_materials` +
      `local_material_id`); without it CapCut 9.1+ shows new clips as inaccessible.
      Local audio: `extract_music`, no library `music_id`.
- [ ] Save every timeline mirror (`template-2.tmp`, `Timelines/<id>/...`), so
      in-place edits aren't ignored by builds that read the nested copy.
- [ ] Re-test in CapCut after both: add a new local video and edit a draft in place
      (on a copy).

## Phase 2: smart cutting and captions

- [ ] Intake questions in the skill: raw or pre-cut, what it should feel like (ideally
      a video link or file), 4K export available, which CapCut sounds they use,
      graphics behind or in front.
- [ ] Pre-cut path: rebuild from the cut points of a project the user cut in CapCut,
      optionally matched to a 4K export of the same cut.

- [ ] Transcription with word-level timestamps (faster-whisper works on Windows).
- [ ] Cut on words: remove pauses, filler words, and retakes, keeping natural
      breaths. Show the cut list for approval before applying it.
- [ ] Captions as real CapCut text elements: 1 to 4 words, one keyword highlighted,
      placed inside the platform safe zones.
- [ ] Big word pops on key lines.

## Phase 3: graphics

- [ ] Test first: can CapCut on Windows show a see-through (transparent) overlay
      clip? Find which video format works; try ProRes 4444 with alpha first (it works
      in capcut-edit on Mac). Fallback: chroma key or full-frame scenes.
- [ ] Choose the graphics tool: HyperFrames if it works on Windows, otherwise
      Remotion or Python-drawn graphics.
- [ ] Graphics as separate clips on tracks above the footage: cards, step labels,
      prompt boxes, floating screenshots, kinetic text.
- [ ] Planning sheet: a contact sheet of the planned graphics with the platform's
      no-go zones drawn in, approved before anything is rendered.
- [ ] Locked design system: fonts, colours, card style, label style, saved in the
      skill so every video in a series matches.
- [ ] Render every layer as its own file from one layer plan (name, word, in, out,
      layer, sound), so a sound swap or a new opening re-renders only that piece.
- [ ] A `FINAL.mp4` preview alongside the CapCut project.

## Phase 4: polish

- [ ] Breathing zooms and punch-ins as eased keyframes.
- [ ] Look changes on trigger words (for example warmer on "aesthetic").
- [ ] Sounds from the user's own CapCut library, plus a sound audition clip.
- [ ] Learn style from 5 to 10 example videos (the user's own or another creator's,
      as local files), asking questions instead of guessing.
- [ ] Frame check before handover: screenshot frames, fix text over faces,
      safe-zone problems, and timing.
- [ ] A README per edit: what happens on which word, what's editable.

## Later, optional

- [ ] Graphics behind the speaker's head (needs person cut-out; on Windows try
      rembg or Robust Video Matting).
- [ ] Flicker opening.

## Skill (skills/capcut-reels)

- [x] Format playbooks: mood text, football, painting, startup.
- [ ] Add a "tutorial" playbook: steps, labels, prompt boxes, result reveals.
- [ ] Add the frame-check step to the quality checklist.
- [ ] Add a design-system reference.
- [ ] Add `references/lessons.md`: every mistake that happened once, so it
      doesn't happen again.

## Working rules

- One feature per branch. Review diffs before merging.
- Tests for every new tool.
- Never edit a draft while CapCut has it open.
- Always work on copies of real projects while testing.
- Update this file when a task is done or plans change.
