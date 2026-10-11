# Audio

Viewers forgive average video but not bad audio.

## Levels
- Voice is the priority: clear and clearly louder than everything else.
- Music under speech sits well below the voice; bring it up in gaps and at the end.
  As a starting point, music volume around 15 to 25% under voice, and full level
  in music-only sections. Adjust by ear.
- Avoid clipping. A common loudness target for social platforms is about -14 LUFS
  integrated. Check with ffmpeg's loudnorm analysis on an export if needed.

## Ducking
Lower music where speech starts, restore it after. Do this by splitting the music
segment at speech boundaries and setting volume per segment with `capcut_set_props`,
or note it for the user to keyframe in CapCut.

## Music choice and timing
- Match energy to the format. Start the video on an interesting part of the song,
  not a slow intro.
- End the edit on a musical ending or phrase end, never a hard mid-note cutoff.
- Copyright: use music from the platform's or CapCut's licensed library, or music
  the user has rights to. Flag uncertain tracks in the finishing notes.

## Voiceover recorded separately
Place it on its own audio track. Mute or lower the camera audio unless natural
sound helps. Cut picture to the voiceover, not the other way around.

## Sound effects
Keep a strict budget. A few well-placed effects (a click, a pop on text, one
impact on the biggest moment) add polish; one on every cut makes it look amateur.
No whoosh on every transition.
