# Creator profile templates

Fill these from `get_creator_style_status` (`profile`, `videos[].stats`), the sheets and the transcripts. Keep measured values exact. Cite the video and timestamp for every pattern. Delete a line that does not apply; do not guess.

## STYLE.md

```markdown
# Editing style: <channel name>

Measured from <n> videos (<format: long-form 16:9 | short-form 9:16>) on <date>. Numbers are in STYLE_STATS.md.

## Pacing
- Cuts per minute: <median> (range <min> to <max>)
- Shot length: median <s>, most between <s> and <s>
- Longest holds: <where and why, e.g. demos, up to 14 s>
- Shape of a video: <e.g. fast first 20 s, steadier middle, quick end>

## Hook (first 5 seconds)
- First speech at <s>, first cut at <s>, first on-screen text at <s>
- Pattern A (<n> of <n> videos): <e.g. result shot + one-line claim>. Example: "<title>" 0:00 to 0:04
- Pattern B: <...>
- Never: <e.g. logo intro, greeting>

## Captions
- Used: <always | shorts only | never>
- Position: <e.g. centre, 62 percent down>; size: <relative to frame height>
- Words per page: <n>; case: <sentence | upper>; font feel: <bold sans>
- Colours: text <hex>, emphasis <hex>, plate <none | hex>
- Emphasis: <e.g. one keyword per page in accent colour>

## Graphics and text
- Kinds: <lower thirds, step numbers, arrows, screenshots>
- Frequency: about <n> per minute; on screen <s> to <s>
- Motion: <e.g. quick slide up, no bounce>
- Recurring positions: <from profile>

## Colour and framing
- Palette: <hex list with roles>
- Grade: <e.g. warm, soft contrast>
- Framing: <e.g. chest-up, subject left third; punch-ins to 115 percent>

## Music and sound
- Music under <percent> of the video; typical <bpm> bpm; mood <...>
- Level: <n> dB under the voice while speaking; <lifts in gaps | constant>
- Sound effects: <kinds, how often>; cuts with a sound: <percent>
- Mix loudness: <LUFS>

## Endings
- <e.g. one spoken ask, end card 3 s, no outro music>
```

## SCRIPT_VOICE.md

```markdown
# Script voice: <channel name>

Read from <n> transcripts on <date>.

## Openings
- Real first lines: "<...>", "<...>", "<...>"
- Pattern: <e.g. states the result, then "here is how">

## Sentences and words
- Length: mostly <n> to <n> words; <short fragments for emphasis | long explanations>
- Person and tense: <"you", present>
- Speech pace: <words per minute>
- Words and phrases they repeat: <...>
- Words they avoid: <...>
- Jargon level: <plain | assumes X>

## Humour and tone
- <e.g. dry asides, self-deprecating, none in tutorials>

## Structure
- Typical order: <hook, why it matters, 3 steps, result, ask>
- Transitions they use: "<...>", "<...>"

## Call to action
- Real wording: "<...>"
- Where: <end only | mid-roll at about 60 percent>

## Never
- <e.g. no "welcome back", no "smash that like button">
```

## Dos and Don'ts (WORKSPACE.md)

Short rules a later agent can check with a tool. Keep the creator's existing entries.

```markdown
Dos
- First word inside <s> s; first cut by <s> s
- <n> cuts per minute, plus or minus 15 percent
- Music <n> dB under the voice
- Captions <position>, <n> words per page
- End with one ask: "<wording>"

Don'ts
- No logo intro
- No captions over <area>
- No <effect or phrase the creator rejected>
```
