---
name: subclip-story-edit
description: Turn raw footage into a story in Subclip. Watch every clip first, log the takes (last take wins, false starts out), write a paper edit with timecodes (hook, setup, beats, payoff, call to action) before cutting, pick the best takes, cut dead air and filler, order for story and not for shooting order, add B-roll and graphics only where they serve a line, then hand over to pacing, sound mix and self-critique. Use when the creator hands over raw clips, a long recording or a messy timeline and wants a finished video, or asks to find the story, pick the good parts or fix the structure.
---

# Subclip Story Edit

Most of an editor's time goes into watching footage, choosing the good parts and finding the order. Do that work on paper first. Cutting before there is a plan produces a tidy timeline with no story.

Tools for the cutting itself are in `subclip-rough-cut` (dead air, fillers), `subclip-timeline-story` (splits, order, lanes) and `subclip-text-captions` (script cuts).

## 1. Watch everything

1. `list_editor_assets`, then `get_media_context` for the whole project with `includeContactSheet: true`. For files without context: `list_media_without_context`, `generate_media_context`, then look at the sheets and `describe_media`.
2. Transcribe every clip with speech (`transcribe_project`, see `subclip-transcription`). Read it with `get_script`: words, times, pauses.
3. For a clip that matters, look closer: `get_item_contact_sheet` once it is on the timeline (if it is not available in this app version, use `get_media_context` with `inspectAtSeconds` or `extract_video_frames`).
4. Do not skip a clip because of its file name. The best moment is often in the take the creator forgot.

## 2. Log the takes

Write a log, one row per usable piece, in the director brief (`update_project_director_brief`):

| File | In to out | What is said or shown | Take | Quality | Use |
|---|---|---|---|---|---|
| A001 | 0:12 to 0:31 | "Most people set this up wrong" | 3 of 3 | clean, good energy | hook |
| A001 | 0:02 to 0:10 | same line, stumbles | 1 of 3 | false start | drop |
| B004 | 1:05 to 1:22 | hands on the device, close-up | single | sharp | B-roll for step 2 |

Rules for takes:

- **Last take wins.** When a line is said several times, the final complete take is usually the one the speaker was happy with. Exceptions: the last take is cut off, has a noise or a look off camera, or an earlier take has clearly better energy. Note the exception.
- **False starts go.** A sentence that restarts ("So the first, so the first thing") keeps only the complete version.
- **Talk to self goes.** "Let me do that again", "is this recording", directions to someone off camera.
- **Fillers** (um, uh) go when standalone; keep one that is part of the speaker's rhythm.
- **Alternate hooks** recorded after the body are candidates for the opening. Log them as hooks.
- When unsure, keep it and flag it. A kept line costs a trim; a lost good take may never be noticed.

## 3. Write the paper edit

Before any cut, write the plan with source timecodes:

| Part | Job | Target length | Source | Line or shot |
|---|---|---|---|---|
| Hook | the promise or the surprising result | 2 to 5 s short-form, 5 to 15 s long-form | A001 0:12 to 0:17 | "Most people set this up wrong" |
| Setup | who this is for, what is at stake | brief | A001 0:40 to 0:52 | ... |
| Beat 1..n | one idea each, each ends moving the story on | varies | ... | ... |
| Payoff | the result, the answer, the reveal | give it room | A003 2:10 to 2:31 | ... |
| Call to action | one ask | 3 to 8 s | A003 3:02 to 3:08 | ... |

Decisions the plan must show:

- **Order for story, not for the shoot.** The strongest line or the result often opens the video even if it was said last. Then go back and earn it.
- **Every beat has a job.** If you cannot name the job of a section in four words, cut it.
- **One idea per beat**, and no idea twice. Pick the clearer telling.
- **Remove what needs earlier context** ("as I said before") once the order changes.
- **Length.** Add the targets up against the platform: 20 to 60 s for short-form, whatever the content earns for long-form. If it runs over, drop a whole beat. Do not shave every beat thin.
- **Check the read.** Read the planned lines top to bottom as the viewer will hear them. It must make sense with no footage at all.

Show the paper edit to the creator when it reorders or removes more than a little of what they said. In Plan mode, the paper edit is the deliverable.

## 4. When the story is unclear, ask one sharp question

Do not guess the point of the video. Ask once, with the options you found, before cutting:

- Good: "I found two possible stories. A: how you fixed the battery problem (strong ending at 4:10). B: the full build log in order. A is 45 s, B is about 3 min. Which one?"
- Good: "The video has three results. Which one should open it: the speed test, the price or the before and after?"
- Bad: "What would you like me to do with this footage?"

One question, two or three concrete options, your recommendation first. If the creator already said the goal, audience and platform, do not ask at all. Save the answer in the director brief.

## 5. Cut

1. Build the order in one compact lane (`place_editor_asset`, `trim_media_item` for in and out, `split_timeline_item`, `delete_timeline_item`). Work from the paper edit, top to bottom.
2. Spoken video: cut by words with `cut_script_words`, and `propose_script_cleanup` then `apply_script_cleanup` for fillers and long pauses. Every cut quotes the transcript: no quote, no cut.
3. Tighten pauses to the targets in `subclip-pacing`. Keep the pause before a number, a reveal or a punchline.
4. Read the cut transcript start to end again (`get_script`). Look at both sides of each join (`get_timeline_contact_sheet` with `times` either side).
5. `set_project_duration` to the end of the content. No blank tail.

## 6. B-roll and graphics serve a line

Add a visual only where it does one of these jobs: shows the thing being named, covers a jump cut, proves a claim (the real screen, the real result), or gives the eye a change after a long hold.

- Place it on the word that names it (word times from `get_script`), and take it off when the speaker moves on.
- Prefer the creator's own footage and real captures to stock, and stock to generated images.
- One graphic at a time, never over the speaker's face.
- No visual for its own sake. A beat that works on the speaker alone stays on the speaker.

## 7. Hand over

The story edit ends with a locked cut. Then, in this order:

1. `subclip-pacing`: `get_pacing_analysis`, shot lengths, hook timings, text times (if the tool is not available in this app version, use `analyze_timeline`).
2. `subclip-sound-mix`: music that fits the beats of the paper edit, levels, effects.
3. `subclip-taste` for any text or graphics.
4. `subclip-self-critique`: score every segment, fix what is under 7.

Tell the creator: the story you chose in one sentence, what you removed (seconds and the list of dropped lines), which takes you chose where there was a choice, and anything you kept but doubt.

## Checklist

- Every clip looked at and every spoken word read before the first cut.
- Take log written; retakes and false starts resolved.
- Paper edit written with timecodes and a job for every part.
- One sharp question asked only if the story was unclear.
- Cut matches the paper edit; transcript reads cleanly end to end.
- Every B-roll and graphic tied to a line.
- Handed to pacing, sound mix, taste and self-critique.

Retake rules (last take wins, false starts, "every cut quotes the transcript", "when unsure, keep it") adapted from ai-video-editor-cooked by NextWork (MIT), https://github.com/nextwork-projects/ai-video-editor-cooked.
