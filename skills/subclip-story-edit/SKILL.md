---
name: subclip-story-edit
description: The main skill when the creator asks for a video or an edit and gives no creative direction. Build the story before cutting, for any format (raw footage, podcast, vlog, SaaS demo, explainer, motion graphics, film, song): understand what you have, theme, overall story, script and storyboard, hook, confirm with the creator or score versions yourself, then edit. One flow from start to end with a hook, an introduction, value in beats, an open curiosity loop at every transition and the biggest payoff or twist last. Also covers watching every clip, logging takes (last take wins, false starts out), the paper edit with timecodes, best takes, dead air and filler, B-roll only where it serves a line, and the handover to pacing, sound mix and self-critique.
---

# Subclip Story Edit

Most of an editor's time goes into watching footage, choosing the good parts and finding the order. Do that work on paper first. Cutting before there is a plan produces a tidy timeline with no story.

Tools for the cutting itself are in `subclip-rough-cut` (dead air, fillers), `subclip-timeline-story` (splits, order, lanes) and `subclip-text-captions` (script cuts).

## Story first (the main path when the creator gave no creative direction)

Use this whenever the creator hands over raw clips, a recording, a product, a song or a topic and says "edit this" or "make a video" without saying what the video should be. It applies to every format: talking head, podcast cut, vlog, SaaS demo, explainer, motion graphics, short film, music video, story. Long-form most of all. When the creator did give direction (a script, a storyboard, an order, a reference to follow), follow theirs and use this section only to check the flow.

**The principle.** A video is one story from the first second to the last, not a pile of good moments in a shuffled order. The viewer must always have a reason to watch the next part:

1. **Hook.** The opening answers "why watch this?" and promises something.
2. **Introduce** the character or the main thing (the person, the product, the problem, the song's idea), and what is at stake.
3. **Value, in beats.** One idea per beat, each building on the one before.
4. **Curiosity loops.** Before leaving a beat, open a question the next beat or a later one answers ("but that only works until you hit this wall"). At every moment before the end at least one loop is open. A payoff may land early, and when it does, open another loop in the same breath. A twist counts as a loop.
5. **Payoff at the end.** The biggest answer, result or twist lands last, and it pays off the hook's promise. Then the end screen or the one ask.

A known shorthand for talking videos is Ali Abdaal's HIVES: hook, intro, value, end screen (and a sales pitch or call to action where one fits). Treat it as a shape, not a template: do not force section names or lengths onto material that tells its story another way. What is not optional is the flow: start, development, end, each part caused by the one before, nothing mixed up.

**The steps, in order. Do not start cutting before step 6.**

1. **Understand what we have.** Sections 1 and 2 below: watch everything, read the words, log the takes. For non-footage work (motion graphics, demo, explainer) list the facts, features, assets and proof you actually have.
2. **Theme.** One sentence: what this video is about and who it is for. If you cannot write it, you are not ready.
3. **Overall story.** Three to six lines: where it starts, what changes, where it ends, what the viewer gets. Name the promise of the hook and the final payoff here.
4. **Script and storyboard**, in whichever order suits the material. Footage that already has words: storyboard first (which moments, in what order), then tighten the script by selection. Work you are writing from scratch: script first, then the storyboard. The storyboard is a table, one row per segment:

   | # | Segment | Starts with | Ends with | Pays off | Leaves open | Picture and sound |
   |---|---|---|---|---|---|---|
   | 1 | Hook | "Sites grow to millions of clicks without new links" | "but you will hit a wall" | nothing yet | how, and what wall? | speaker close, title hit |
   | 2 | Setup | the question | the surprising first answer | what the video is about | is it really true? | split shot, name tags |
   | 3 | Beat 1 | the example | the number | "is it true?" | then why does it stop? | cutaway to the chart |
   | ... | | | | | | |
   | n | Payoff | the recap question | the one thing to do | the hook's promise, every open loop | nothing | end card |

   Every row must have something in "Leaves open" except the last. A row with nothing in "Pays off" and nothing in "Leaves open" has no job: cut it or merge it.
5. **Decide the hook last**, once the story exists: the strongest line, result or image that makes the promise the ending keeps. Write two or three candidates.
6. **Confirm, or choose yourself.**
   - Show the creator the theme, the overall story and the storyboard, short enough to read in a minute. When there is more than one good story, show two or three versions with your recommendation first, and let them pick or change segments.
   - If the creator says "you decide", or cannot be asked: score each version from 1 to 10 on hook strength, clarity of the through-line, open loops at every transition, size of the final payoff, and whether the material you have can actually show it. State the scores, take the best, and go.
   - Save the chosen theme, story and storyboard in the director brief (`update_project_director_brief`). Later steps and other agents work from it.
7. **Edit to the storyboard.** Sections 3 to 5 below, then the other editing skills: `subclip-pacing`, `subclip-sound-mix`, captions, graphics, `subclip-taste`.
8. **Critique against the storyboard**, not only against the rubric (`subclip-self-critique`, "Story cards").

## 1. Watch everything

1. `list_editor_assets`, then `get_media_context` for the whole project with `includeContactSheet: true`. For files without context: `list_media_without_context`, `generate_media_context`, then look at the sheets and `describe_media`.
2. Get the words for every clip with speech. A video fetched from a link (YouTube and similar) usually comes with a transcript: use the `transcript` file from `fetch_linked_media` and do not transcribe it. Otherwise transcribe by the policy in `subclip-transcription` (`transcribe_project`); do not turn on speaker detection without asking. Read it with `get_script`: words, times, pauses.
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
