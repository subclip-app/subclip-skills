---
name: subclip-talking-head-animation-windows
description: Find where a talking-head or webcam video needs a full-screen animation because the speaker is not looking at the camera (reading a script off a screen, turned away, face covered), and cover exactly those stretches with 2 to 5 s motion overlays or B-roll while the voice keeps playing. Uses face-cropped contact sheets made with Subclip's own tools every 0.5 s, labelled by eye, then fixed window rules. Works offline on macOS, Windows and Linux. Use for screen-reading takes, webcam recordings, live-stream face cams (reading chat), talking-head edits and "cover the parts where I read my script". Not for multi-person footage.
---

# Talking-head animation windows

A speaker who reads a script off a screen looks away from the lens for long stretches. This skill finds those stretches and turns them into full-screen animation windows `[{start, end, reason}]`, so the edit shows a motion graphic or B-roll while the speaker reads and shows the face whenever the speaker looks at the lens. The voice keeps playing under every window.

You do not need frame-exact gaze tracking. Each window lasts 2 to 5 s, so a decision every 0.5 s is enough. You look at face-cropped contact sheets and label each tile; fixed rules turn the labels into windows.

Method origin: proSamik/Subclip issue #298 (Nov 2026). Automatic gaze tracking (MediaPipe) scored 2/10 on a take where the speaker faced the screen most of the time, because its auto calibration learned the screen pose as "camera". Face contact sheets labelled by an agent scored 10/10 and 8/10 on blind checks. This skill is the same method built only from Subclip MCP tools, with no Python and no extra models.

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
- The face-crop sheets are made in a separate scratch project, so the real edit is never zoomed by mistake.
- Spend no AI credits: frames, sheets and local Whisper transcription are free and offline.

## Workflow

1. **Find the camera source.** For a Subclip recording, `list_recordings` gives the id; the camera file is `<Projects folder>/<recordingId>.subclip/webcam.mp4` and the voice is `microphone.m4a` next to it (the webcam file usually has no audio). In an editor project, read the media lane (`read_project_section` with `lane: "media"`) and take the talking-head item's source path. Use the camera track, never `screen.mp4`.
2. **Locate the face.** `extract_video_frames` on that file at 4 to 8 times spread over the clip, `maxDimension: 480`. Estimate the face centre `(fx, fy)` as fractions of the frame width and height, and the face height `hf` (hairline to chin) as a fraction of the frame height. Use the median over the frames.
3. **Build the face-crop scratch project.** `create_project` (`canvasPreset: "square"`, name `<project> face sheets`), `import_external_media` with the camera file, then `update_media_item` with `fitMode: "cover"`, `sourceZoom: Z`, `focusX: fx`, `focusY: fy`, `muted: true`, where `Z = 1 / (1.25 * hf)` for a landscape source (clamp 1 to 4). Check with a 4-tile `get_timeline_contact_sheet`: the face should fill most of the tile with both eyes large and in the upper half. Adjust `focusY` or `Z` and check again.
4. **Make the sheets.** `get_timeline_contact_sheet` on the scratch project: `from`, `to`, `every: 0.5`, `columns: 6`, `maxTilesPerSheet: 24`, `tileWidth: 256`, `detail: "balanced"`, `count: 48`. One call covers 24 s (two sheets of 6x4 tiles, 12 s each). Repeat for each 24 s block. Each tile shows `#index m:ss.s fFRAME`.
5. **Calibrate, then label.** Skim all sheets first. Find the lens look and the screen direction, write both down, then label every tile (see labelling.md). For unclear tiles, render a zoom sheet: `times` with the tile and the quarter steps around it, `tileWidth: 480`, `detail: "full"`.
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
- **Small faces and low light.** A loose crop (1.6x the face) made the eyes too small to judge and failed the test (6/10). Keep the crop at about 1.25x the face. If the speaker sits far back, raise `Z`.
- **Fast tiles are soft.** `detail: "fast"` renders at tile size and blurs the irises. Use `"balanced"` for the sheets and `"full"` for zoom checks.
- **Head moves out of the fixed crop.** The scratch crop does not follow the face. If the speaker leans far, the face leaves the tile: label those tiles from a full frame (`extract_video_frames`), usually `away`.
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
