---
name: subclip-multi-agent-timeline
description: Let several agents edit one Subclip timeline at the same time without collisions. A coordinator plans segments, places the global layers, and each agent claims its own time range and lane block, edits only there, scores its segment and releases the claim; the coordinator watches claims and scores, rebuilds weak segments and does the final whole-timeline pass. Covers refused edits, ripple rules and when not to work in parallel. Use when the creator asks for several agents on one video, or a long timeline has independent sections to polish in parallel.
---

# Several Agents, One Timeline

Sub-projects merged at the end (`subclip-agent-orchestration`) are the safe default for building separate parts. Claims are for the other case: one existing timeline whose sections each need work (graphics, B-roll, effects, caption styling, fixes) and can be done side by side.

If `plan_timeline_segments`, `claim_timeline_segment`, `release_timeline_segment` and `list_timeline_claims` are not available in this app version, do not let two agents edit the same project: give each part its own sub-project and merge with `merge_project_timeline` as in `subclip-agent-orchestration`. Where this skill names `get_audio_analysis`, `get_pacing_analysis`, `lint_text_style` or the segment review tools and the app does not have them, use the fallbacks in `subclip-perception` and `subclip-self-critique`.

## When not to parallelise

- The timeline is under about 60 s, or the job is a handful of edits. One agent is faster.
- The cut is not locked. Story, order and length changes ripple through everything: finish `subclip-story-edit` first, alone.
- The work is one global thing (a music bed, captions for the whole video, a colour pass).
- Sections depend on each other (a running gag, a counter that continues, one continuous screen recording).
- `get_system_resources` reports `canStartAgents` of 0 or 1.

## Roles

- **Coordinator** (you, when you start the others): plans, owns everything global, watches, rebuilds, does the final pass. Only the coordinator ripples.
- **Segment agents**: one claim each, edit inside it, score it, release it.

## Coordinator: before anyone starts

1. Lock the cut and the duration. Read the timeline (`analyze_timeline`, `get_pacing_analysis`, `get_audio_analysis`) and note the shared decisions: fonts, colours, caption style, motion language, music, loudness targets (`subclip-taste`, `subclip-sound-mix`, the workspace style).
2. `plan_timeline_segments` with `count`, `maxSeconds` or your own `segments`. Auto mode splits at scene boundaries, speech pauses and music sections, never mid-word. Each segment has a `segmentId`, `start`, `end`, `label` and `suggestedLaneOffset`. The first planning call on a project also returns `coordinatorId`: keep it, it is shown once and is what makes you the coordinator (later callers only see `coordinatorHeldBy`).
3. Place the global layers first, before any claim exists: the music bed, the captions, brand elements (logo, intro, end card), the base grade. Segment agents build around them and do not touch them.
4. Check the machine and providers (`get_system_resources`, `list_agent_providers`), then start one agent per segment with `start_agent_session`. Each prompt is self-contained:
   - the `projectId`, its `segmentId` with start and end, and its `agentLabel` (unique, for example "seg-2-graphics");
   - the task for that segment and the shared decisions, written out in full;
   - "read `subclip-multi-agent-timeline`, claim your segment before any edit, pass `claimId` on every edit, stay inside your range and lanes, do not ripple or change duration, do not touch the music bed, captions or brand items, score your segment with `subclip-self-critique`, release the claim, do not start other agents".

## Segment agent: the protocol

1. **Claim.** `claim_timeline_segment` with `projectId`, `segmentId` (or `start` and `end`), your own `agentLabel`, and `ttlSeconds` if the work needs more than the default 1800. Keep the returned `claimId`, `start`, `end`, `laneRange` and `expiresAt`.
2. **Refused claim.** Another agent holds an overlapping range; the message names the holder, its range and expiry. Do not edit. Report back to the coordinator, or take a different free segment if your task allows.
3. **Edit inside the claim.** Pass `claimId` on every mutating call. Every item you create, move or trim starts and ends inside your `start` to `end`. Lanes 0 to 9 are shared and fine to use, because lane order is also what paints in front and ranges do not overlap in time. Lanes 10 and above are reserved in blocks: use only your own `laneRange` there.
4. **Do not** delete or change items that lie wholly in another range, move items across your boundary, change the project duration or canvas, ripple delete, or touch the global layers.
5. **Need something outside your range** (a transition across the boundary, a longer music fade, a caption fix next door): do not do it. Write it in your report for the coordinator.
6. **Stay alive.** A claim expires at `expiresAt`. If you are still working, every edit you make with your `claimId` renews it. To renew without editing, call `claim_timeline_segment` again with your `claimId`. Your `claimId` is the only thing that identifies you: the same label without it is refused as `range-taken`. Work after expiry is refused or unprotected.
7. **Score.** Run `subclip-self-critique` on your own range: `review_segment`, look, `record_segment_review` with your `agentLabel`, fix what is under 7, at most three rounds.
8. **Release.** `release_timeline_segment` with the `claimId` as soon as you are done or stuck. Never leave a claim to expire on its own.
9. **Report** to the coordinator: what you added (item ids), your scores, what is still weak, what you need done outside your range.

## When an edit is refused

A refusal is the system working. Read the message; it names the owner and the range.

| Message says | Meaning | Do |
|---|---|---|
| `other-agents-range`, `outside-claim` | you reached outside your claim | re-read your `start` and `end`; redo the edit inside them, or pass the request to the coordinator |
| `boundary-spanning` | the item crosses a segment boundary (a music bed, a caption track) | leave it; global layers belong to the coordinator |
| `claim-required` | the range is claimed and you sent no `claimId` | claim first, then repeat the call with `claimId` |
| `lane-outside-block` | you used a reserved lane (10 or above) that is not yours | use lanes 0 to 9 or your own `laneRange` |
| `claim-expired` | `ttlSeconds` ran out, or the id is unknown | claim again, check what changed in the range, continue |
| `coordinator-required` | a ripple or project-wide change while more than one claim is live | stop; only the coordinator does that (below) |
| `range-taken`, `lanes-taken` (when claiming) | another agent holds it | do not edit; report to the coordinator or take a free segment |
| `busy` | another agent's edit on this project took too long | wait a little, then retry once |

Every refusal has `code`, `owner`, `violations` and `rolledBack`. When `rolledBack` is true the whole call was undone and the timeline is as it was.

Never work around a refusal: no editing through `update_editor_state`, no waiting for the other claim to expire and then taking its range, no second label. Do not retry the same call unchanged.

## Ripple rules

Anything that shifts time for everyone belongs to the coordinator: project duration, ripple delete, `cut_script_words`, idle and script cleanup, canvas or aspect ratio changes, reordering sections.

1. Prefer to do it before claims exist or after all are released.
2. If it must happen mid-run: tell the agents to finish and release, check `list_timeline_claims` shows no live claims, make the change, run `plan_timeline_segments` again (times have moved), and let the agents claim the new ranges.
3. Passing your `coordinatorId` on a ripple call overrides the refusal while claims are live. A bare `coordinator: true` does nothing. Use it only as the coordinator, and only when the change cannot shift other agents' work (for example trimming a blank tail after the last segment).

## Coordinator: watch and rebuild

1. Follow sessions with `get_agent_session` about every 30 seconds. `list_timeline_claims` shows each holder, range, lanes, expiry, last activity and the latest review score for that range.
2. A claim with no activity for several minutes: message that agent (`send_agent_message`); if it stays silent, `stop_agent_session`, wait for the claim to be released or to expire, and reassign the segment.
3. `list_segment_reviews`: read `lowestSegments`, `stale` and `unreviewedRanges`. A segment still under 7 after its agent's three rounds is rebuilt: give it to a different agent with the review's `issues` as the brief, or do it yourself.
4. Handle the cross-boundary requests the agents reported.

## Coordinator: whole-timeline pass

When every claim is released:

1. Joins: look at each boundary (`get_timeline_contact_sheet` with `times` 0.5 s either side). Add or fix transitions across boundaries; remove doubled ones.
2. Audio continuity: `get_audio_analysis` over the whole timeline. Levels steady from segment to segment, no effect stacked at a boundary, music uncut.
3. Pacing arc: `get_pacing_analysis` over the whole timeline. Segments built apart often share one tempo: restore contrast and the lift before the payoff.
4. Consistency: `lint_text_style` and a sheet at `at: "layer-starts"`. One type, colour and motion system across all agents' work (`subclip-taste`).
5. Lanes: tidy the lane blocks if the creator will edit by hand afterwards, keeping the stacking order.
6. Final critique: `subclip-self-critique` over every segment at the final revision, coverage 100, nothing stale.
7. Tell the creator which agents ran, what each built, the scores per segment, what was rebuilt and what is still weak.

## Checklist

- Cut locked and global layers placed before the first claim.
- Each agent has its own label, one claim, and passes `claimId` on every edit.
- No edit outside a claim's range or lanes; refusals respected.
- Ripples only by the coordinator with no other live claims.
- Every claim released; every segment scored.
- Boundaries, audio continuity and pacing arc checked on the whole timeline.
