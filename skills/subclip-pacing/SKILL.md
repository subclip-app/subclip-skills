---
name: subclip-pacing
description: Fix timing and rhythm in a Subclip edit with measured numbers. Shot length by content type and platform, cutting on beats and downbeats or on the word and the action, how long text and graphics stay on screen, the first three seconds, dead air, variation, speed ramps, J and L cuts. Uses get_pacing_analysis and get_audio_analysis and maps every pacing issue code to an action. Use when an edit feels slow, rushed, off the beat or monotone, when text lingers or flashes by, and before delivery of any edit with music or on-screen text.
---

# Subclip Pacing

Pacing is measured, then fixed. Call `get_pacing_analysis` (whole timeline first, then only the range you changed) and, when there is music, `get_audio_analysis` with `include: ["music", "beats"]`. If `get_pacing_analysis` is not available in this app version, use `analyze_timeline` `scenes` for shot lengths and compute text times from item start and end; if `get_audio_analysis` is not available, take the tempo from the creator or the music prompt and check sync with `get_audio_timeline_sheet`.

## Shot length targets

A "shot" ends at any visual change: a cut, a punch-in, B-roll, a full-screen graphic. Compare `shotLength.median` and `cutsPerMinute` with the row that fits. A measured creator style in the workspace (`subclip-creator-style`) wins over this table.

| Content | Median shot | Cuts per minute | Notes |
|---|---|---|---|
| Talking head, long-form (16:9) | 4 to 10 s | 6 to 15 | a visual change at least every 12 s |
| Tutorial or screen recording | 6 to 20 s | 3 to 10 | a zoom or callout every 5 to 10 s; never cut mid-action |
| Product promo or launch | 1.5 to 4 s | 15 to 35 | hold the hero shot 3 to 5 s |
| Short-form vertical (Reels, Shorts, TikTok) | 1 to 3 s | 20 to 45 | something changes every 2 to 4 s |
| Montage cut to music | 1, 2 or 4 beats | follows bpm | long in calm sections, short in dense ones |
| Interview or documentary | 5 to 15 s | 4 to 12 | let answers breathe; cover cuts with B-roll |

No shot under 0.5 s unless it is a deliberate flash on a beat. A shot longer than twice the median needs a reason (a demo, a reveal, an emotional hold).

## Beat, word or action

Decide what each cut follows:

- **Music-led** (montage, promo, music edit with no speech driving): cut on the beat. Scene changes on `music.tracks[].downbeats`, inner cuts on `beats`.
- **Speech-led** (talking head, tutorial, interview): cut on the word. The cut sits in the pause between words (read `get_script` word times), never inside a word. Do not move a speech cut to reach a beat.
- **Action-led** (sport, product in motion, UI demo): cut on the action. Start the incoming clip a few frames before its peak so the peak lands on the beat or the word.

For music-led cuts, read `beatSync[]`:

- Target `cutsOnBeatPercent` of 80 or more for a montage, 60 or more for a promo with voice. No target for speech-led video.
- Fix each entry in `offBeatCuts`: move the cut to `nearestBeat` when `offsetMs` is under about 250; otherwise the cut belongs to a word or action and stays.
- Place the cut one or two frames before the beat, not after. Late cuts feel wrong sooner than early ones.
- `bpmConfidence` under 0.6 means the track has no reliable grid: cut on phrases and on `sections` energy changes instead, and say so.
- Use `music.tracks[].sections`: long shots in `low` energy, shorter in `high`, and put the reveal or title on the first downbeat of a `high` section.

Tools: `split_timeline_item`, `trim_media_item` (keeps the source extendable), `update_media_item` for start times. Snap to frames: time = frame divided by fps.

## Text and graphics on screen

Read `textItems[]`. Every item has `onScreenSeconds`, `minReadSeconds`, `maxComfortSeconds`, a `verdict` and a `suggestedEnd`.

- Fix every `too-long` and every `too-short`. Zero left is the target, not "most".
- `too-long`: set the end to `suggestedEnd` (`update_text_item`, `update_element`, `update_runtime_layer` or `update_html_motion_graphic`). For a motion graphic, shorten the hold, not the entrance, and keep the exit animation.
- `too-short`: extend to at least `minReadSeconds`, or cut words. Fewer words is usually the better fix.
- Rule of thumb when the tool is missing: minimum = 0.5 s plus 0.3 s per word, never under 1.2 s; comfortable maximum = about twice the minimum, 5 s for a lower third, 6 s for a title card. A label that outstays its line of speech is too long.
- Text enters with the word that names it (within 0.2 s) and leaves when the speaker moves on. Two text blocks should not enter in the same 0.3 s unless they are one design.
- `captions.wordsPerMinute` over 190 reads as rushed; under 110 with gaps reads as slow. `coveragePercent` under 95 on a captioned video means missing captions: check the transcript.

## The first three seconds

Read `hook`. Targets for short-form, with long-form in brackets:

- `firstSpeechAt` at or before 0.5 s (1.0 s). No silent lead-in.
- `firstMotionAt` or `firstCutAt` at or before 1.0 s (2.5 s). A still opening frame loses the viewer.
- `firstTextAt` at or before 1.5 s when the video uses on-screen text.
- The promise (what the viewer gets) is said or shown by 3 s.

Fix a `slow-hook`: trim the head so the first word starts the video, move the strongest line or result shot to the front, drop logo stings and greetings ("hey guys, welcome back"), add a punch-in or a cut inside the first two seconds, start the music at 0.

## Dead air

Read `deadAir[]` (and `propose_idle_cuts` or `propose_script_cleanup` for spoken video). Tighten pauses between sentences to about 0.15 s in short-form and 0.3 s in long-form. Keep a pause before a number, a reveal or a punchline, and inside a spoken list. A gap that must stay (a demo loading, a reaction) gets cover: B-roll, a zoom, a music lift or a sound.

## Variation

`monotone-pacing` means the shots are all the same length or the `energy` row never changes. Fix it with contrast, not speed:

- Alternate runs: three or four quick shots, then one hold.
- Match picture to sound: when `energy[].audio` is `high` and `visual` is `low` (or the reverse) for more than 8 s, change one of them.
- Shape the whole: quick open, steadier middle, a lift before the payoff, a short calm end. One peak, not five.
- Change the kind of visual change (cut, punch-in, B-roll, graphic), not only its frequency.

## Speed ramps

Use `trim_media_item` or `update_media_item` playback speed on a split piece. Speed up dead travel (typing, walking, loading) by 2x to 8x; slow down only footage shot at a high frame rate, or accept 0.5x as the floor. Ramp into a beat: the fast part ends on the downbeat and the normal-speed action starts there. Never change the speed of a clip whose own speech is audible.

## J and L cuts for speech

A hard cut on both picture and sound at the same frame feels abrupt between speakers or scenes.

- **J cut**: the next clip's audio starts 0.3 to 0.8 s before its picture. Use it to pull the viewer into the next scene.
- **L cut**: the outgoing audio continues 0.5 to 1.5 s under the next picture. Use it for reactions and B-roll over a finished thought.

Build them by placing the audio on its own item (`extract_timeline_audio` with `addToTimeline`, mute the video's own sound for that piece) and offsetting picture and sound. Check for doubled voice with `get_audio_analysis` (`include: ["speech", "overlap"]`).

## Issue code to action

| Code | Action |
|---|---|
| `text-too-long` | end at `suggestedEnd`; shorten the hold |
| `text-too-short` | extend to `minReadSeconds` or cut words |
| `graphic-overstays` | end the graphic when its line of speech ends; keep the exit |
| `cut-off-beat` | music-led: move to `nearestBeat`, one or two frames early; speech-led: leave it |
| `slow-hook` | trim the head, lead with the strongest line, add motion before 1 s |
| `dead-air` | tighten the pause, or cover it with B-roll, a zoom or sound |
| `monotone-pacing` | add contrast: runs and holds, a different kind of visual change |

Other codes: read the issue's `suggestion` and apply the nearest rule above.

## Checklist

- Median shot length and cuts per minute fit the content type or the creator's measured style.
- Every music-led cut on a beat or kept for a stated reason.
- No `too-long` or `too-short` text item left.
- Hook timings inside target.
- No unexplained dead air.
- `get_pacing_analysis` run again on the changed range and its `issues` read.

Beat grid method after the community skill cut-to-the-beat (written for Subclip; approach after librosa, ISC). Pause targets adapted from ai-video-editor-cooked by NextWork (MIT).
