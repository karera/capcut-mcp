# Style library

CapCut effects, transitions, filters, and text animations are stored in the draft
JSON with ids that vary between CapCut versions. Guessing them breaks drafts.
Instead, the user keeps a reference draft with the looks they like already
applied, and you copy from it.

## The library draft
The user creates a draft named `_style-library` (or tells you its name) containing
short placeholder clips with:
- Their preferred transitions applied between clips
- Text layers in their caption style, statement style, and title style, with animations
- The filter or adjustment they use for their look
- Any effects they like (zoom, shake, glow, etc.)
- Optionally, separate looks per format (mood, football, painting, startup)

Ask the user to label clips or text layers clearly (for example a text layer that
reads "CAPTION STYLE") so you can find each item.

## Applying a style
1. `capcut_read_timeline` on the style library and locate the item.
2. Use `capcut_raw_patch` to copy the relevant material and segment settings into
   the target draft, assigning new ids and the target timing. Copy only what the
   item needs; don't overwrite unrelated parts of the draft.
3. `capcut_validate` after each style application, so a bad patch is caught early.
4. Note every applied effect in the finishing notes so the user previews it.

If the library doesn't contain what the edit needs, don't invent it. Suggest the
user adds it to the library in CapCut, and note where it should go.

## Consistency
Use the same caption style, filter, and one or two transitions across a whole
video, and ideally across a series. A recognisable look is part of what makes a
channel feel professional.
