# Captions and on-screen text

## Placement
- Keep text inside the platform safe zone (see `platform-specs.md`). On vertical
  video, the bottom area and right edge are covered by captions, buttons, and
  the username, and the very top by the app's header.
- Never place text over a face, the ball, the brush, or whatever the viewer is
  meant to watch. Move it, don't shrink it.
- Keep one consistent position per video for spoken captions. Titles and
  statements can sit higher, around the upper third or centre.

## Spoken captions
- 1 to 4 words per line, timed tightly to the speech.
- Highlight one key word per line in an accent colour (from the style library).
- Remove filler words from captions even if they stay in the audio.
- Don't run spoken captions over title cards or other text.

## Statement text (no voice)
- Short lines. Break long sentences into two or three beats that appear one at a time.
- Reading time: allow roughly a second plus a fraction of a second per word, so a
  six-word line needs about two and a half to three seconds. Err longer; a
  viewer who can't finish the line scrolls away.
- Lowercase or sentence case often feels more personal than title case for mood content.

## Style
- One font family, one caption style, one accent colour per video. Take these from
  the style library so they stay consistent across videos.
- Make text readable on any background: an outline, shadow, or subtle backing box.
- Animations: one entrance style, used consistently. Avoid stacking animations.

## Tooling
`capcut_add_text` adds text with size, colour, and position, cloned from the
template draft. For styled captions with animations, copy the text segment from
the style library (see `style-library.md`). For caption timing from speech, use a
transcript with timestamps (CapCut's auto-captions or Whisper), converted to
seconds.
