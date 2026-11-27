---
name: subclip-sound-mix
description: Mix and sound-design a Subclip video by the numbers. Loudness targets in LUFS and dB, voice against music gap, ducking under speech and lifting in gaps, music whose energy and mood fit what is being said, sound effects placed on visual events from a cue sheet, silence as a tool, and a fix for every audio issue code from get_audio_analysis. Use after any audio change, when music buries the voice, when a video feels flat or silent, when effects are missing on cuts, and before delivery.
---

# Subclip Sound Mix

You cannot hear. `get_audio_analysis` gives the numbers a listener feels, and `get_audio_timeline_sheet` gives the picture. Measure, fix, measure again. If `get_audio_analysis` is not available in this app version, use the JSON summary and `warnings` of `get_audio_timeline_sheet` (loudness, peaks, voice against music, silences, `cutSync`).

Read `subclip-audio-editing` for the editing tools (`update_audio_item`: volume, fades, pan, trim) and `subclip-music-generation` to make music or effects.

## Targets

| What | Target |
|---|---|
| Whole mix, `mix.integratedLufs` | about -16 LUFS for spoken online video; -14 for music-led shorts |
| True peak, `mix.truePeakDb` | at or under -1 dBTP |
| Voice lane, `lanes.voice.integratedLufs` | -16 to -18 LUFS, steady across speakers (within 2 LU) |
| Music under speech, `speech.segments[].gapDb` | 12 to 18 dB under the voice (use `speech.targetGapDb` when given) |
| Music in gaps longer than 1.5 s | raise 4 to 8 dB, back down 0.3 s before the next word |
| Music alone (intro, outro, montage) | -16 to -18 LUFS |
| Whoosh, riser, transition effects | peaks 6 to 10 dB under the voice peak |
| UI clicks, typing, small foley | peaks 10 to 16 dB under the voice peak |
| Impact on a reveal | may reach the voice peak, never above -3 dB |
| `overlap.ranges[].headroomDb` | 1 dB or more everywhere |
| `mix.loudnessRangeLu` | 4 to 10 LU; more means the level jumps around |

Volume to dB: multiplying `volume` by 0.7 is about -3 dB, by 0.5 is -6 dB, by 0.35 is -9 dB, by 0.25 is -12 dB. To move a level by N dB, multiply the current volume by 10^(N/20).

## Never bury speech

1. Read `speech.segments[]`. Each has `start`, `end`, `speaker` (when known), `voiceLufs`, `musicLufs`, `gapDb` and `masked`.
2. Every segment with `masked: true` is a defect. Lower the music for that range until `gapDb` reaches the target. Do not raise the voice to win: that leads to clipping.
3. Check each speaker. A guest 4 LU quieter than the host needs their own items raised, not the whole mix.
4. Two voices at once (see `overlap.ranges[].layers`) is a defect unless it is a deliberate L or J cut: mute the duplicate (`set_all_video_audio`, `remove_timeline_audio`).

## Ducking

Music sits low while someone talks and comes up when they stop.

1. Take the speech ranges from `speech.segments[]` and merge any that are less than 1.5 s apart.
2. If `update_audio_item` or an audio keyframe tool in this app accepts volume keyframes, set them: low level from 0.2 s before speech starts to 0.3 s after it ends, with 0.3 to 0.5 s ramps.
3. Otherwise split the music item at those points (`split_timeline_item`) and set each piece's `volume`, with `fadeIn` and `fadeOut` of 0.2 to 0.4 s on the pieces that change level, so there is no step.
4. Do not pump: no duck for a gap under 1.5 s, and a lift of no more than 8 dB.
5. Re-run `get_audio_analysis` with `include: ["speech", "overlap", "issues"]` on the range. All `masked` must be false.

Music boundaries: fade in 0.3 to 1 s unless it starts on a downbeat at 0, fade out 1 to 3 s or end on a downbeat. `music-ends-abruptly` means a missing fade or a cut mid-phrase.

## Music that fits the words

The vibe has to match what is being said. Line the script up against `music.tracks[].sections`:

1. From `get_script`, mark the story beats: hook, explanation, problem, reveal, payoff, call to action.
2. From `sections`, read `energy` per range.
3. Compare. Explanation and detail want `low` or `mid`. A reveal, result or payoff wants a lift to `high`, landing on a downbeat. A serious or sad line under bright `high` energy is a mismatch, and so is a big reveal over a `low` section.
4. Fix: slide the music so a section change meets the reveal (trim the head of the track), swap the track, cut the music to its own sections (split on downbeats and reorder), or drop the music for a line that should land alone.
5. Tempo: 70 to 100 bpm for calm explanation, 100 to 125 for upbeat talk, 120 to 150 for promos and montage. A track faster than the speech feels nervous under a tutorial.
6. Vocals in music fight speech. Under dialogue use instrumental tracks.

Choosing or making it: `get_asset_options` or `search_public_audio` to pick, `generate_music` after a quote (name mood, tempo, instruments, length, "instrumental", and where the lift should come in seconds). Offer choices when the creator has not picked (`subclip-asset-options`).

## Sound effects on visual events

Effects make cuts and graphics feel real. Work from a cue sheet, not by ear.

1. List the events from the picture: `get_pacing_analysis` `scenes` (cuts) and `textItems` starts (text and graphic entrances; if it is not available in this app version, use `analyze_timeline` scenes and item start times), plus UI clicks, typing, transitions, reveals and the end card seen on the contact sheet.
2. Read `sfx.cutSync`: `percentWithSound` and `cutsWithoutSound[]`. Aim for 70 percent or more of the cuts that matter (scene changes, reveals, graphic entrances). Not every cut needs a sound, and speech-led jump cuts need none.
3. Write the cue sheet before placing anything:

| Time | Event | Sound | Length | Level |
|---|---|---|---|---|
| 0:03.2 | title enters | soft whoosh | 0.5 s | 8 dB under voice |
| 0:07.9 | button press | UI click | 0.08 s | 12 dB under voice |
| 0:14.0 | reveal | riser into impact | 2 s + 0.6 s | impact near voice peak |

4. Place so the loudest moment lands on the frame: a whoosh starts 0.2 to 0.6 s before the cut, a riser ends on the reveal frame, an impact starts about 0.2 s before its frame, a click lands on the press.
5. Source: `search_public_audio` (source `sfx`) then `import_public_asset_to_timeline`, or `generate_music` with `modelId: "elevenlabs-sound-effects"` after a quote.
6. Vary repeated sounds (different takes, small level changes). Never the same whoosh on every cut. Do not make an effect louder to make it better.
7. Check `sfx.items[]`: every cue exists at its `time` with a sane `peakDb`, and no two effects stack in `overlap.ranges`.

## Silence as a tool

Not every gap is a fault. Cut the music for one beat before a punchline or reveal, or drop to voice alone for a line that matters, then bring the music back on the downbeat. Keep such a gap under 1.5 s or cover it with room tone so it does not read as an error. A `long-silence` issue is a fault only when nothing was meant there.

## Issue code to action

| Code | Action |
|---|---|
| `music-masks-voice` | duck the music for that range to the target gap |
| `voice-too-quiet` | raise the voice items (or that speaker), then re-check peaks |
| `mix-too-loud` | scale music and effects down together; voice last |
| `clipping` | lower the loudest item in that range, not everything |
| `long-silence` | add a bed, room tone or effect, tighten the cut, or keep it on purpose |
| `no-music-under-section` | extend or add a bed, unless the section is meant to be dry |
| `sfx-missing-on-cut` | add a cue from the sheet for cuts that matter; skip plain jump cuts |
| `music-ends-abruptly` | fade out 1 to 3 s or end on a downbeat |

Other codes: read the issue's `suggestion`.

## Report

Tell the creator the numbers: mix loudness, true peak, voice to music gap during speech, who was hard to hear and where, how many cuts carry a sound. Say plainly that loudness and timing are measured and that taste (is this whoosh harsh, does this track feel right) needs their ears.

## Checklist

- Mix near -16 LUFS, true peak at or under -1 dBTP.
- No `masked` speech segment; every speaker at a similar level.
- Music lifts in gaps and returns before the next word.
- Music energy matches the script beats; lift on the reveal.
- Cue sheet written; effects land on their frames; no repeated whoosh.
- `get_audio_analysis` run again after the last audio change and its `issues` read.

Cue-sheet method, effect timing and "verify by looking at the sound" adapted from earshot by Leon Lin (MIT), https://github.com/Leonxlnx/earshot.
