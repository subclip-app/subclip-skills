---
name: subclip-talking-head-animation-windows
description: Find where a talking-head or webcam video needs a full-screen animation because the speaker is not looking at the camera (reading a script off a screen, turned away, face covered), and cover exactly those stretches with 2 to 5 s motion overlays or B-roll while the voice keeps playing. Uses face-cropped contact sheets made with Subclip's own tools every 0.5 s, labelled by eye, then fixed window rules. Works offline on macOS, Windows and Linux. Use for screen-reading takes, webcam recordings, live-stream face cams (reading chat), talking-head edits and "cover the parts where I read my script". Not for multi-person footage.
---

# Talking-head animation windows

A speaker who reads a script off a screen looks away from the lens for long stretches. This skill finds those stretches and turns them into full-screen animation windows `[{start, end, reason}]`, so the edit shows a motion graphic or B-roll while the speaker reads and shows the face whenever the speaker looks at the lens. The voice keeps playing under every window.

You do not need frame-exact gaze tracking. Each window lasts 2 to 5 s, so a decision every 0.5 s is enough. You look at face-cropped contact sheets and label each tile; fixed rules turn the labels into windows.

Method origin: proSamik/Subclip issue #298 (Nov 2026). Automatic gaze tracking (MediaPipe) scored 2/10 on a take where the speaker faced the screen most of the time, because its auto calibration learned the screen pose as "camera". Face contact sheets labelled by an agent scored 10/10 and 8/10 on blind checks. This skill is the same method built only from Subclip MCP tools, with no Python: `get_media_contact_sheet` makes the face sheets in one call per 24 s, with Subclip's bundled offline face detector.

Read these before you start:
- [references/labelling.md](references/labelling.md): how to label tiles (camera, screen, away, unclear), with examples.
- [references/window-rules.md](references/window-rules.md): the exact window maths, step by step, with a worked example. Apply it by hand; no script is needed.
- [references/tool-map.md](references/tool-map.md): every tool call with the parameters that matter, the face-crop settings, and the tool limits.

## Invariants

- Never cover a lens look of 1 s or longer (two or more camera tiles in a row). A single camera tile between two look-aways is merged over on purpose (rule 3); say so in your notes.
- Judge the eyes, not the head. A frontal head with the eyes on the screen is `screen`. A slightly turned head with the irises on the lens is `camera`.
- When unsure, the face stays visible. `unclear` tiles count as camera unless both neighbours are look-aways.
- Never mute, cut or move the voice. Overlays sit above the camera; the audio item is not touched.
- Every call passes `projectId`. Send mutations one at a time, never in parallel.
- The face sheets come from the source file (`get_media_contact_sheet`), never from the edit, so the real edit is never zoomed or changed.
- Spend no AI credits: frames, sheets and local Whisper transcription are free and offline.

## Workflow

1. **Find the camera source.** The sheet tools take one of three targets. A Subclip recording: `recordingId` from `list_recordings` plus `track: "webcam"` (times are recording seconds; the voice is `microphone.m4a` beside the webcam file, which usually has no audio). A clip already in an edit: `itemId` of the talking-head item from `read_project_section` (`lane: "media"`); times are then timeline seconds, so sheet times equal edit times. Any other file: `source` with its path. Use the camera track, never the screen track.
2. **Check the face.** `detect_faces` on the same target (default 8 samples). `framesWithFace` should be close to `framesSampled`; `medianFace` is where the speaker sits. If no face is found (very small face, dark room, a stream layout with a tiny face cam), use a manual `crop` in step 3 instead of `faceCrop`.
3. **Make the face sheets.** `get_media_contact_sheet` with the camera target, `everySeconds: 0.5`, `faceCrop: {}` (square crop of 1.25x the face, centred on the face in every frame), `columns: 6`, `rows: 4`, `tileSize: 256`. One call returns 48 tiles (two sheets of 6x4, 12 s each) plus an index of every tile's time, row and column; call again with `from` set to the returned `next` time for the next 24 s. Each tile shows `#index m:ss.s fFRAME`; a `NO FACE` badge means that tile used the median face position.
4. **Calibrate.** Skim all sheets first. Find the lens look and the screen direction and write both down (labelling.md, section 1).
5. **Label.** Label every tile (labelling.md). For unclear tiles, make a zoom sheet: `get_media_contact_sheet` with `times` set to the tile and the quarter steps around it, `faceCrop: {scale: 1.1}`, `tileSize: 480`, `columns: 3`.
6. **Get word timings.** In the edit project, `transcribe_project` (`mode: "local"`, on the voice item, `highlight: "none"`) if it has no captions, then `get_script` with `pauseSeconds: 0.2`. Hide the captions afterwards if the edit should not show them.
7. **Compute the windows** with window-rules.md. Write `windows.json` (plain list, seconds, two decimals) and a table of start, end, length and reason, plus the total covered.
8. **Place the overlays** in the edit project, one call at a time: for each window `add_html_motion_graphic` with `startTime: start`, `duration: end - start`, `width: 100`, `height: 100`, `x: 50`, `y: 50`, an opaque background and its own content. Or use a template (`list_motion_graphics_templates`), a HyperFrames layer, or B-roll (`import_external_media`, `search_public_media`) trimmed to the window. In a chain of windows, give each window new content (a new card, number or screenshot) so the screen never sits still.
9. **Verify.** One `get_timeline_contact_sheet` on the edit project with, for every window, `start + 0.1`, the midpoint and `end - 0.1` (all must show the overlay), and every camera tile time from your labels (all must show the face). Fix any edge that covers a lens look before export.
10. **Export** only when asked (`export_video`), then pull a few frames from the MP4 with `extract_video_frames` inside and outside the windows as the final proof.
11. **Optional: comparison video.** When the user wants to see what was covered (a review, a demo, a before and after), build a separate vertical project: the original on top with a tag per window ("will be covered: reading chat") and "camera look, kept" on face time, the edit below with the same cards, a thin timeline bar with the windows and a moving playhead between them, the audio once. Recipe in tool-map.md, section 8.
12. Record the work: `update_project_director_brief` and `write_session_summary` with the windows and the verification result.

## Output

`windows.json`, in seconds:

```json
[{"start": 58.75, "end": 62.25, "reason": "looking at screen (tiles 59-62s)"},
 {"start": 63.75, "end": 68.15, "reason": "looking at screen (tiles 64-68s), part 1/5 of a chain"}]
```

Everything outside the windows is face time: put the on-camera beats (hook, punchline, call to action) there.

## Known failure cases

- **Slightly raised irises versus a lens look.** When the screen sits just above the lens, reading and a lens look differ only by a thin line of white below the iris. This caused every miss in testing. Zoom whenever a frontal face is involved.
- **Small faces and low light.** A loose crop (1.6x the face) made the eyes too small to judge and failed the test (6/10). Keep `faceCrop` at its default 1.25x, or lower `scale` to 1.1 when the eyes are still small. Raise `tileSize` for zoom checks.
- **No face found.** Tiles with a `NO FACE` badge (hand over the face, profile turn, out of frame) are cropped at the median face position; they are usually `away`. If most tiles have the badge, the detector cannot see this face: use a manual `crop` around the face cam and label from that.
- **Clip ends.** A look-away under 1 s at the very start or end is dropped as a blip. Trim it in the edit instead.
- **Takes with almost no lens looks** become one long chain. That is correct; the edit then needs a lot of animation, or a re-record.
- **Several faces.** The crop follows one face only. Do not use this skill on interviews or panels.

## Test results

Original method (issue #298, Python sheets, Nov 27 2026). After labelling, 10 random timestamps per clip (inside and outside windows) were judged blind at full resolution by a separate agent:

| Clip | Length | Score | Windows | Notes |
|---|---|---|---|---|
| 463db663 (turned to a screen on his left) | 88.6 s | 10/10 | 18 windows, 81.2 s covered | lens looks at about 57, 62.5 and 86.3 s left uncovered |
| 70f4c649 (screen above right of the lens) | 63.1 s | 8/10 | 13 windows, one chain, 62.8 s covered | both misses are slightly raised irises |

A first try with a 1 s step and a 1.6x crop scored 6/10 on 70f4c649. The 0.5 s step and the 1.25x crop fixed it and are the defaults. Labelling took 4 to 6 sheet views per clip plus one zoom sheet.

This skill (Subclip tools only, Nov 27 2026): a 45 s live-stream face cam (Inde Navarrette, CC BY, https://www.youtube.com/watch?v=voQeFH0DXYk; she talks to camera, reads chat below and to the side, and looks back). The reference demo is the vertical comparison from step 11: the original on top, the edit below. 90 face tiles in four sheets plus one zoom sheet; 6 windows, 20.1 of 45 s covered, every lens look of 1 s or more left uncovered. Verified on 34 timeline frames (18 inside windows, 16 lens looks) and 16 frames of the exported MP4: all correct. The windows matched `make_windows.py` to the hundredth of a second. This check is self-verified, not a blind check.
