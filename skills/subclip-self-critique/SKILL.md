---
name: subclip-self-critique
description: Score your own Subclip edit segment by segment before calling it done. Split the timeline, call review_segment for each range, look at the sheet and the numbers, score ten criteria from 1 to 10 with evidence, record the review, rebuild everything under 7, review again (three rounds at most), confirm full and fresh coverage, and tell the creator the scores and what is still weak. Use after every multi-step edit, before any report of completion and before any export.
---

# Subclip Self-Critique

An edit is not done until every segment has been looked at, scored and, where weak, rebuilt. The point is fewer fix-up rounds for the creator: find the problems they would find, first.

If `review_segment`, `record_segment_review` or `list_segment_reviews` is not available in this app version, do the same loop by hand: for each range call `get_timeline_contact_sheet`, `get_audio_timeline_sheet` and `analyze_timeline`, score with the rubric below, and write the scores per range into the director brief with `update_project_director_brief`.

## The loop

1. **Split.** `plan_timeline_segments` (auto mode splits at scene boundaries and speech pauses), or choose ranges of 8 to 20 s yourself that follow the story beats. If `plan_timeline_segments` is not available, use `analyze_timeline` `scenes` to pick the ranges. A video under 20 s is one segment plus a separate look at the first 3 s.
2. **Review.** For each segment call `review_segment` with `startTime`, `endTime` and a `label` ("hook", "demo 2"). It returns `sheet`, `audio`, `pacing`, `text`, `items`, `rubric`, `reviewId` and `revision`.
3. **Look.** Open the sheet image and read the tiles. Read every entry in `audio.issues`, `pacing.issues` and `text` findings. For a motion graphic or title in `items`, also call `get_item_contact_sheet` (if it is not available in this app version, `get_timeline_contact_sheet` with `times` inside the item). A review without looking is not a review.
4. **Score.** One score per criterion, 1 to 10, or `null` when it does not apply (no captions in the segment, no music). Write the evidence first, then the number.
5. **Record.** `record_segment_review` with the `reviewId`, your `agentLabel`, `scores`, `issues` (each with `time` or `itemId`, `problem`, `fix`), `verdict` and a one-sentence `summary`. It returns `overall`, `belowThreshold` and `nextAction`.
6. **Fix.** Every criterion in `belowThreshold` (under 7) gets fixed, using the skill that owns it: `subclip-pacing`, `subclip-sound-mix`, `subclip-taste`, `subclip-story-edit`, `subclip-motion-graphics`, `subclip-dynamic-captions`.
7. **Review again.** Call `review_segment` for that same range (the edit made the old review stale) and record a new review. At most three rounds per segment. After the third, stop, keep `verdict: "fix"`, and report what remains.
8. **Coverage.** `list_segment_reviews`: `coverage` must be 100, no review `stale`, `unreviewedRanges` empty. Edits to one segment can make its neighbours stale (a moved cut, a longer music bed): review those again.
9. **Whole film.** One last pass over the full timeline: `get_pacing_analysis` and `get_audio_analysis` without a range (older app: `analyze_timeline` and `get_audio_timeline_sheet`), for the arc, loudness consistency and the joins between segments.
10. **Report** (below). Only then export, and only if asked.

## Rubric

`review_segment` returns the live `rubric`; it wins over this table when they differ.

| Criterion | What a 9 looks like | Evidence to use |
|---|---|---|
| `hook` | first words and motion inside 1 s, the promise clear by 3 s (score only in the opening segment, else `null`) | `pacing.hook` |
| `story` | every shot has a job, the line of thought is easy to follow, nothing repeats | transcript, sheet order |
| `pacing` | shot lengths fit the content, cuts on beat or word, no dead air, variation | `pacing` numbers and issues |
| `audioMix` | voice clear everywhere, no masked speech, peaks safe, levels steady | `audio` speech gap, peaks, issues |
| `musicFit` | energy follows the script beats, lift on the reveal, clean start and end | `audio` music sections against the words |
| `soundEffects` | effects on the events that matter, on the frame, varied, never loud | `audio` sfx and cut sync |
| `motionGraphics` | each graphic serves a line, enters with it, leaves on time, one motion language | item sheets, `pacing.textItems` |
| `captions` | correct words, readable, good line breaks, clear of faces and UI | caption tiles, transcript |
| `visualQuality` | sharp, well framed, nothing clipped or empty, colour consistent | sheet tiles |
| `taste` | no AI tells, one type and colour system, plain copy | `text` findings, sheet |

Score meaning:

- 9 to 10: you would change nothing. A professional editor would ship it.
- 7 to 8: good. Small things you can name but that a viewer would not notice.
- 5 to 6: a viewer notices. Must be fixed.
- 3 to 4: clearly broken in places.
- 1 to 2: missing or wrong.

## Rules against grade inflation

- Evidence per score: a tile number, a time, or a measured value. No evidence, no score above 6.
- A 9 means there is nothing you would change. If you wrote an issue for that criterion, it is not a 9.
- An open `error` issue from the tools caps that criterion at 5. An open `warn` caps it at 7.
- Any `masked` speech caps `audioMix` at 5. Any `too-long` or `too-short` text item caps `motionGraphics` or `captions` at 6. Any lint finding left caps `taste` at 6.
- Do not score what you did not look at. Use `null` and say why.
- Score the segment as it is, not the effort spent or the plan for it.
- Do not raise a score on re-review unless the measured value or the tile changed.
- `verdict: "ship"` only when nothing is below threshold. Otherwise `"fix"`.
- All tens across a segment is a signal that you did not look. Check again.

## Worked examples

Bad review (inflated, no evidence):

```json
{
  "scores": {"hook": 9, "story": 9, "pacing": 9, "audioMix": 9, "musicFit": 9, "soundEffects": 9, "motionGraphics": 9, "captions": 9, "visualQuality": 9, "taste": 9},
  "issues": [],
  "verdict": "ship",
  "summary": "Great segment, dynamic pacing and polished audio."
}
```

Nothing is measured, nothing is pointed at, and effects are scored in a segment that has none.

Good review (same segment, honest):

```json
{
  "agentLabel": "editor-1",
  "scores": {"hook": 6, "story": 8, "pacing": 6, "audioMix": 5, "musicFit": 7, "soundEffects": null, "motionGraphics": 5, "captions": 8, "visualQuality": 8, "taste": 6},
  "issues": [
    {"time": 0, "problem": "first speech at 1.4 s, frame is still until 2.2 s", "fix": "trim 1.2 s from the head, add a punch-in at 0.8 s"},
    {"time": 6.1, "problem": "music 5 dB under the voice from 6.1 to 11.8 s, segment marked masked", "fix": "duck the music to 14 dB under for that range"},
    {"itemId": "title-2", "problem": "4 words on screen for 7.2 s, comfortable maximum 3.4 s", "fix": "end the title at 5.9 s"},
    {"itemId": "title-2", "problem": "em dash in the title text", "fix": "rewrite as two short lines"},
    {"time": 9.5, "problem": "three shots of 3.0 s in a row, cuts 180 ms after the beat", "fix": "move cuts to 9.32 and 12.31, shorten the middle shot"}
  ],
  "verdict": "fix",
  "summary": "Clear story and captions; slow first second, buried voice mid-segment and an overstaying title."
}
```

Each number has a reason, each issue has a place and a fix, and the missing effects lane is `null`, not a guess.

## Reporting to the creator

Say it plainly, lowest first:

- Overall score and the range of segment scores ("7.8 overall; segments from 6.9 to 8.6").
- The weakest segments from `lowestSegments`, each with the criterion and the reason.
- What you fixed after scoring, and what is still under 7 after three rounds and why (missing footage, a choice only they can make).
- What was not checked (taste of sound needs a listen).

Do not round up, and do not hide a weak segment in an average. Write the same summary into `write_session_summary` (`openIssues` for what remains).

## Checklist

- Every segment reviewed with `review_segment` at the current revision.
- Sheet opened and issues read for each.
- Scores carry evidence; `null` where not applicable.
- Everything under 7 fixed and reviewed again, three rounds at most.
- `list_segment_reviews`: coverage 100, nothing stale.
- Scores and remaining weaknesses told to the creator.
