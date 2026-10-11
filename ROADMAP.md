# Roadmap

Goal: record one raw take on Windows, and get back an editable CapCut project with
tight cuts, word-synced captions, and clean motion graphics. Every piece stays its
own clip or real text element, so small fixes take seconds in CapCut instead of
re-prompting Claude.

Platform: Windows, CapCut desktop. Check the CapCut version before each phase; the
draft format changes between versions.

## Reference projects (read for ideas, don't install)

Kept outside this repo in `E:\reference\` (only `capcut-edit` is cloned so far):

- `capcut-edit` (dominicapaci), at `E:\reference\capcut-edit`: a complete Mac-only editing workflow built as a skill.
  Best source of ideas: word-based cutting, captions, cards, looks, zooms, sound,
  safe zones, learning style from examples, and its lessons file.
- HyperFrames (heygen-com): renders graphics written as HTML into video. Windows
  support is unconfirmed; test before relying on it.
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
- [ ] Fix the speed bug: trim and split must account for clip speed.
- [ ] `read_timeline` should be able to show unsaved session edits.
- [ ] `validate` should also check that audio files exist.
- [ ] Warn when the CapCut version differs from the tested one.
- [ ] Test end to end on a copy of a real project.

## Phase 2: smart cutting and captions

- [ ] Transcription with word-level timestamps (faster-whisper works on Windows).
- [ ] Cut on words: remove pauses, filler words, and retakes, keeping natural
      breaths. Show the cut list for approval before applying it.
- [ ] Captions as real CapCut text elements: 1 to 4 words, one keyword highlighted,
      placed inside the platform safe zones.
- [ ] Big word pops on key lines.

## Phase 3: graphics

- [ ] Test first: can CapCut on Windows show a see-through (transparent) overlay
      clip? Find which video format works. Fallback: chroma key or full-frame scenes.
- [ ] Choose the graphics tool: HyperFrames if it works on Windows, otherwise
      Remotion or Python-drawn graphics.
- [ ] Graphics as separate clips on tracks above the footage: cards, step labels,
      prompt boxes, floating screenshots, kinetic text.
- [ ] Planning sheet: a contact sheet of the planned graphics with the platform's
      no-go zones drawn in, approved before anything is rendered.
- [ ] Locked design system: fonts, colours, card style, label style, saved in the
      skill so every video in a series matches.

## Phase 4: polish

- [ ] Breathing zooms and punch-ins as eased keyframes.
- [ ] Look changes on trigger words (for example warmer on "aesthetic").
- [ ] Sounds from the user's own CapCut library, plus a sound audition clip.
- [ ] Learn style from 5 to 10 example videos, asking questions instead of guessing.
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
