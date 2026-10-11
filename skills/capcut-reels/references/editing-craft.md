# Editing craft

These are the habits that separate a professional edit from an assembled one.
Each lists the tools that achieve it.

## The hook
Viewers decide in the first 1 to 2 seconds. Open on the most interesting frame,
the strongest line, or the payoff itself, then show how you got there. Cut any
intro, logo, "hey guys", or setup shot that delays the point. If the best moment
is in the middle of the footage, move a short piece of it to the start as a
teaser (`capcut_split_segment`, `capcut_move_segment`).

## Pacing
- Cut on meaning, not on a clock: at the end of a phrase, on a breath, on an
  action completing, or on a music beat.
- Vary shot length. A run of identical lengths feels robotic. Mix quick cuts
  with a moment that is allowed to breathe.
- Remove dead air and false starts, but keep natural breaths so speech doesn't
  sound machine-gunned.
- Enter a shot late and leave early: start after the setup, end before the wind-down.
- When in doubt, shorter. Most first cuts are too long.

## Punch-ins to hide jump cuts
When you cut out a pause in a single talking shot, the jump is jarring. Alternate
the framing across cuts: for example 100% on one segment, then about 110 to 115%
on the next, centred on the face, then back. Use `capcut_set_props` scale (and
position to keep the face centred). Use bigger punch-ins (about 125 to 130%) only
for emphasis on a key line, sparingly.

## B-roll and inserts
Cover cuts and illustrate what's being said. Change the visual roughly every
few seconds in fast formats. Put b-roll on its own track above the main footage
so the main audio continues underneath. B-roll should match what is said at
that moment, not just fill space.

## J-cuts and L-cuts
- J-cut: the next shot's audio starts slightly before its picture (a few hundred
  milliseconds is typical). Pulls the viewer into the next scene.
- L-cut: the current audio continues after the picture changes. Lets a line land
  over the next image.
Keep audio on separate tracks so you can offset it with `capcut_move_segment`
and `capcut_trim_segment`.

## Transitions
Default to hard cuts. A transition should mean something: a change of place,
time, or topic. Use only transitions from the style library, keep them short,
and use the same one or two throughout a video.

## Music-driven cutting
In music-led formats, cut on beats and save the biggest visual change for the
drop or the biggest musical moment. Ask the user for beat timings if needed, or
place cuts by ear and flag them in the finishing notes for a check.

## Endings
End on a payoff, a clear call to action, or a loop where the last frame flows
back into the first. Never let a video trail off.
