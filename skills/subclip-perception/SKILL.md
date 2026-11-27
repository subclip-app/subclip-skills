---
name: subclip-perception
description: See, hear and read a Subclip video the way a human editor does before judging or changing it. Maps each question (what does it look like over time, what does one layer look like, how loud is the voice against the music, where are the beats, how fast are the cuts, who says what) to the one tool that answers it, gives the order to perceive in before and after an edit, and keeps token cost low. Use at the start of any edit, before any critique, and whenever the creator says the edit feels off.
---

# Subclip Perception

You cannot watch or listen. You can measure and look at pictures of the result. An edit judged from the project outline alone is a guess: text and captions tell you what is said, not how it feels. Perceive first, then decide.

## Question to tool

| Question | Tool | What to read |
|---|---|---|
| What is in the raw files? | `get_media_context` (`includeContactSheet: true`) | description, 3x3 sheet, transcript summary |
| How is the timeline built? | `analyze_timeline` | `issues`, `scenes`, lanes, audio roles, `recommendedContactSheetTimes` |
| What does it look like over time? | `get_timeline_contact_sheet` | labelled tiles of the composed frame |
| What does this one layer look like? | `get_item_contact_sheet` (`itemId`, `count`) | that item alone on a checkerboard, across its own duration |
| What does it sound like, in numbers? | `get_audio_analysis` | `mix`, `lanes`, `speech.segments`, `music.tracks`, `sfx`, `overlap`, `issues` |
| What does the mix look like? | `get_audio_timeline_sheet` | waveforms per lane, spectrogram, loudness curve |
| Is the rhythm right? | `get_pacing_analysis` | `cutsPerMinute`, `shotLength`, `beatSync`, `textItems`, `hook`, `deadAir`, `energy` |
| What is said, when, by whom? | `get_script`, `get_transcription_status`, `read_project_section` for captions | words with times, pauses, speakers |
| Does the text look AI-made? | `lint_text_style` | `findings` per item, `summary` by rule |
| Everything about one range at once? | `review_segment` (`startTime`, `endTime`) | sheet, audio, pacing, text findings, rubric |
| What is on this exact frame? | `view_frame` | one full-size frame |

One tool per question. Do not answer a sound question from a frame, or a timing question from the transcript.

## What each new tool tells you

- `get_item_contact_sheet`: the whole-timeline sheet shows the composition; this shows one item. Use it for a motion graphic's entrance, hold and exit (`count: 9` across its duration), for a media clip's trimmed range, and to check a caption or text style without the background. `isolate: false` gives the composed frame at the same times. `times` picks exact moments, for example the first 0.5 s of an entrance.
- `get_audio_analysis`: the numbers a listener would feel. `mix.integratedLufs` and `mix.truePeakDb` are overall loudness and peak. `speech.segments[]` gives, for each stretch of speech, `voiceLufs`, `musicLufs`, `gapDb` (voice minus music) and `masked` (the music is burying the voice). `music.tracks[]` gives `bpm`, `bpmConfidence`, `beats`, `downbeats` and `sections` with `energy`. `sfx.cutSync` says which cuts have a sound and which do not. `overlap.ranges[]` shows where voice, music and effects stack and how much `headroomDb` is left.
- `get_pacing_analysis`: the numbers a viewer would feel. `scenes` and `shotLength` for cut rhythm, `beatSync[].offBeatCuts` for cuts that miss the music, `textItems[]` with `onScreenSeconds` against `minReadSeconds` and `maxComfortSeconds` and a `verdict`, `hook` timings for the first seconds, `deadAir`, and `energy` (visual against audio).

Read `issues[]` first in both analyses. Each issue has a `code`, a time range and a `suggestion`; `subclip-pacing` and `subclip-sound-mix` say how to fix each code.

## Order of perception

Before editing:

1. `get_media_context` for every source file you will use. Never cut footage you have not looked at.
2. `analyze_timeline` when the timeline already has content.
3. `get_script` when there is speech. The words decide the story.
4. `get_audio_analysis` and `get_pacing_analysis` over the whole timeline, once. Note the baseline: cuts per minute, voice LUFS, voice to music gap, bpm.
5. One `get_timeline_contact_sheet` with `at: "auto"`.
6. Write down what you perceived in three or four lines before planning.

After editing:

1. `review_segment` for each range you changed (see `subclip-self-critique`). It bundles the sheet, audio, pacing and text findings.
2. `get_item_contact_sheet` for every motion graphic, title or generated clip you added or changed.
3. `get_audio_analysis` for the changed window after any audio change.
4. `view_frame` only for the single frames a sheet left in doubt.

## Token thrift

- Ask for a range, not the whole film, after the first pass: `startTime` and `endTime` on `get_audio_analysis`, `get_pacing_analysis`, `lint_text_style` and `review_segment`.
- `get_audio_analysis` with `include: ["speech", "issues"]` when you only need the voice to music gap; `include: ["beats"]` or `["music"]` when you only need the grid. Raise `windowSeconds` to 2 for a long timeline.
- Sheets: 9 to 12 tiles is a review. Raise the count only for a timing question in a short window.
- Reuse what you measured. The numbers do not change until the project revision changes.
- One analysis per coherent batch of edits, not one per mutation.

## Telling the creator what you perceived

Say what a person would notice, with the number behind it, and say what you did not check.

- Good: "The music is 5 dB under your voice from 0:12 to 0:31, so words are hard to follow there. I lowered it to 14 dB under."
- Good: "Cuts land every 2.1 s on average and 9 of 12 fall on a beat. The title at 0:04 stays 7.2 s for four words; I shortened it to 2.5 s."
- Bad: "The pacing is dynamic and the audio is balanced."

Measurements are not hearing. Loudness, sync and timing are measured; whether a sound is pleasant or a joke lands is not. Say so and ask for a listen when taste matters.

## Older app versions

If a tool is missing from `mcp_editor__list_tools`, fall back and say the check was weaker:

- `get_audio_analysis` missing: use the JSON summary of `get_audio_timeline_sheet` (loudness, peaks, voice against music, silences, `cutSync`). No beats or sections: take tempo from the creator or the generation prompt.
- `get_pacing_analysis` missing: use `analyze_timeline` `scenes` for shot lengths and compute text on-screen time from item start and end in `read_project_section`.
- `get_item_contact_sheet` missing: use `get_timeline_contact_sheet` with `times` inside the item's range, or `view_frame`.
- `lint_text_style` missing: read every text, caption and layer string yourself against the rules in `subclip-taste`.
- `review_segment` missing: call the sheet, audio and pacing tools for the range yourself.

## Checklist

- Every source file looked at, every spoken word read.
- Baseline numbers noted before the first edit.
- Each changed range measured again after the edit.
- Each added graphic seen on its own sheet.
- Report states numbers, and what was not checked.
