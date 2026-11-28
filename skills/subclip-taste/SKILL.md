---
name: subclip-taste
description: Art direction that keeps a Subclip video from looking AI-made. Rules for on-screen text (no long dashes, no dot or bullet separators between words, no ellipsis glyph, no sparkle emoji, sentence case, short plain copy, no stock AI phrases), typography, colour, motion, layout and consistency across the video, plus a ban list of generic looks. Uses lint_text_style and requires every finding fixed. Use whenever you write on-screen text, captions, titles or motion graphics, and when the creator says something looks generic, templated or like AI.
---

# Subclip Taste

Viewers spot machine-made work in a second: a long dash in a title, dots between words, a sparkle emoji, a purple gradient, everything fading in. These rules remove those tells. They apply to text overlays, captions, element text and every string inside Remotion, HyperFrames and HTML layers.

A measured creator style or a workspace brand (`subclip-creator-style`, `subclip-workspaces`) decides fonts, colours and voice. These rules still apply on top.

## Lint first, lint last

1. After writing or changing any on-screen text, call `lint_text_style` (whole project, or `startTime` and `endTime` for the range you touched). If `lint_text_style` is not available in this app version, read every text item, caption page and layer string yourself against the table below.
2. Fix every finding. Each has `itemId`, `rule`, `excerpt` and a `suggestion`. Fix text items with `update_text_item`, captions with `update_caption_words`, layer strings with `edit_layer_source` or `update_runtime_layer`.
3. Call it again. The target is zero findings, not fewer.
4. A finding may stay only when the creator's own wording needs it (a brand name, a quoted post, their approved script). Say which and why.

## Text rules

| Rule | Do not | Do |
|---|---|---|
| `em-dash` | a long dash joining two thoughts | two short sentences, or a comma |
| `en-dash-as-pause` | a short dash with spaces as a pause | a comma or a full stop; keep the dash only in number ranges |
| `middle-dot-separator` | dots or bullets between words ("Fast, dot, Simple, dot, Free") | separate lines, a comma list, or one idea per card |
| `ellipsis-char` | the single ellipsis glyph, or trailing dots for drama | finish the sentence |
| `arrow-glyphs` | arrow characters in copy | words ("then", "to"), or a drawn arrow element |
| `sparkle-emoji`, `emoji-heavy` | sparkles, rockets, more than one emoji per card | none by default; one only if the creator uses them |
| `all-title-case-sentence` | Every Word Capitalised In A Sentence | sentence case; capitals for names only |
| `trailing-period-in-title` | a full stop at the end of a title | no end mark on titles and labels |
| `double-space`, `straight-vs-curly-quote-mix` | sloppy spacing, mixed quote styles | one space, one quote style |
| `placeholder-text` | lorem ipsum, "Your text here" | real copy or remove the item |
| `ai-phrases` | "elevate", "unlock", "seamless", "game-changer", "dive into", "in today's fast-paced world", "revolutionise", "effortless", "supercharge" | the plain fact a person would say |

Copy:

- Short. A title is 2 to 6 words. A label is about 4. One line is read in about two seconds.
- Plain. Say what it is and who it is for. One hard fact beats three adjectives. A noun in every heading.
- Use the speaker's own words for text that echoes speech. Do not paraphrase them into marketing language.
- Nothing invented: no made-up numbers, reviews, quotes or customers.
- Buttons and calls to action are a verb and an object ("Start a free trial", "Watch part two").
- Read it aloud. If a person would not say it, rewrite it.

## Typography

- One or two families for the whole video. One for headings, one for body or captions at most.
- A fixed scale, reused: for example on 1920 x 1080, title 84 px, scene heading 60 px, body 28 px. On 1080 x 1920, title 96 px, captions 56 to 72 px. Do not invent a new size per card.
- Two weights are enough. No faux bold, no stretched text, no outline plus shadow plus glow together.
- Safe margins: at least 5 percent of the width on each side for 16:9. On vertical video keep text out of the top 10 percent and the bottom 20 percent, where platform buttons sit.
- Line length: 20 to 32 characters a line for captions on vertical, up to 42 on wide. Break lines at phrases, not mid-phrase.
- Confirm the font actually loads in the layer runtime before designing with it. A silent fallback font is a tell.

## Colour

- One system, taken from the workspace brand or the creator's footage: a background, an ink, one accent. Write the hex values once and reuse them in every layer.
- The accent is for one thing per frame.
- No default violet or lavender gradients, no neon on black unless it is the brand, no rainbow text.
- Text contrast against its background of 4.5 to 1 or better. Over busy footage use a solid or blurred plate, not a heavier glow.
- Match graphics to the footage grade. Bright flat cards over moody footage look pasted on.

## Motion

- One hero move per video (two in a long one). Everything else is quiet.
- One easing language: ease out (expo or quart) for entrances, a plain ease in for exits, one overshoot on one hero moment at most.
- Entrances 0.25 to 0.5 s, exits 0.15 to 0.3 s. Then hold still. Text does not wobble, drift or breathe while being read.
- Do not stack effects: not scale plus rotate plus blur plus glow on the same element.
- Nothing lingers. A graphic leaves when its line is over (`subclip-pacing`, text on-screen time).
- Plain cuts between shots unless a transition is the moment. Not a different transition on every cut.
- Motion has a reason: a cursor presses a button, a number counts to a real figure, a line draws to what it points at.

## Layout

- One idea per scene. If two things compete, make two scenes.
- Equal left and right edges across the whole video. Align to the same grid in every scene.
- Never cover a face, the focus element or the captions with text, a card or a graphic: see "Faces and the focus element stay clear" below for the placement order and checks.
- One graphic at a time unless they are one design.
- Leave empty space. A frame filled edge to edge reads as a template.

## Faces and the focus element stay clear

This is a hard rule for everything you put on screen, whatever made it: native text layers, captions, elements, HTML/CSS motion graphics, Remotion layers, HyperFrames layers, stickers, logos, callout plates and cards that do not fill the frame.

**When the face part applies.** Only when people or characters are on screen: talking heads, interviews, podcasts, vlogs, acted scenes, animated or illustrated characters, mascots, avatars. A faceless video (screen recording, slides, product shots, maps, pure motion graphics, stock scenery without people) has no face to protect: skip the face check there and apply only the focus-element part. No special tool is needed for this: the contact sheet you already look at shows whether anyone is on screen and where.

**Never place text or a graphic on a face.** That means the whole head (forehead to chin, ear to ear) plus a small margin, for every person in the shot, in every frame the item is visible, including after a punch-in zoom or a cut to another angle while the item is still up.

**Never place text or a graphic on the focus element.** The focus element is whatever the viewer is meant to look at in that moment: the product, the hand doing the action, the UI control being clicked, the chart or number being discussed, the object the narration names.

Where to put it instead, in this order:

1. **Empty space in the frame**: wall, sky, desk, the side the speaker is not on. For a centred talking head that is usually the left or right third or the lower band under the chin line; on a split shot, the gutter or the lower band.
2. **Another moment**: move the item to a beat where the frame has room, or to the cut before or after.
3. **Smaller or shorter**: shrink it, break it into two lines, or shorten the words until it fits the free area.
4. **Change the frame**: reframe or scale the clip to open space (speaker to one side, text on the other), or put the item on its own card or split layout.
5. **Last option, text between the subject and the background**: remove the background of a duplicate of the clip and put the text between the two (`subclip-text-behind-subject`). The subject then covers the text, never the reverse. Use it only when 1 to 4 do not work or the creator asks for that look, because it costs processing time and can fail on hair and fast motion.

Never solve it by lowering the item's opacity over the face, and never by a backing plate that itself covers the face.

**Inside a motion graphic the same rule applies to its own contents.** A graphic has one key element per scene (the product shot, the chart line, the big number, the logo, the screenshot region being discussed). Labels, titles, captions and decorations go beside it, in the reserved margin, or on a callout line pointing at it. They do not sit on top of it. If a label has to touch it, use a leader line and put the label outside.

How to check, every time:

1. Before placing: look at the frames across the item's whole time range (`get_timeline_contact_sheet` with `times`, or `view_frame`), not one frame. People move and shots change.
2. Decide the free area first, then give the item that area (position and size), then write its content.
3. After placing: render the same times again and look at the first, middle and last frame of the item, plus any frame right after a cut or zoom inside its range.
4. If any frame shows text or a graphic on a face or on the focus element, it is not done. Move it and look again.

## Consistency

Check across the video, not per card: `get_timeline_contact_sheet` with `at: "layer-starts"`, and `get_item_contact_sheet` for each graphic (if it is not available in this app version, use `get_timeline_contact_sheet` with `times` inside the item). Same fonts, sizes, colours, corner radius, margins, entrance direction and caption style from the first frame to the last. A lower third at 0:10 and one at 2:40 must be the same design.

## Ban list

- Generated images or clips standing in for the real product, person or place when real footage or a capture exists.
- Stock footage passed off as the creator's own product or team.
- A fake dashboard or invented UI where the real product should be shown.
- A redrawn look-alike of a real logo. Use the real file.
- A card that fades in on every scene; motion on everything; parallax on text.
- A whoosh on every cut (`subclip-sound-mix`).
- Glassmorphism panels, floating 3D blobs and gradient orbs as decoration.
- Captions under every image explaining what it shows.
- Emoji as icons. Use a real icon set or the product's own icons.
- Word-by-word captions with a new colour on every word.
- Three exclamation marks, all caps for whole sentences, hashtags on screen.
- A final card that lists five calls to action. One.

## Checklist

- `lint_text_style` returns zero findings, or each remaining one is the creator's own wording.
- One or two font families, one size scale, one colour system.
- One hero move; consistent easing; nothing stacked; nothing lingers.
- Text inside safe margins and clear of faces and UI.
- No text or graphic on a face or on the focus element in any frame of its range, checked on first, middle and last frame; inside motion graphics, labels sit beside the key element, not on it.
- First and last graphic match.
- Nothing from the ban list on screen.

Adapted for video from taste-skill by Leon Lin (MIT), https://github.com/Leonxlnx/taste-skill, and from the ban list and real-visuals rule of ai-video-editor-cooked by NextWork (MIT), https://github.com/nextwork-projects/ai-video-editor-cooked.
