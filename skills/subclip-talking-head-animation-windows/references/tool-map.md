# Tool map

Every step uses Subclip MCP tools only. Pass `projectId` on every call and send mutations one at a time.

## 1. Find the camera source

| Need | Tool | Target for the sheet tools |
|---|---|---|
| Subclip recordings | `list_recordings` | `recordingId` + `track: "webcam"`. Times are recording seconds (the track offset is applied). The voice is `microphone.m4a` beside the webcam file (which usually has no audio); both start together. |
| A clip already in an edit | `get_project_outline`, then `read_project_section` (`lane: "media"`) | `itemId` of the talking-head item (with `projectId`). Times are timeline seconds, mapped through the item's trim and speed, so sheet times are the times the windows use. |
| Any other local video | | `source` with the file path. Times are file seconds. |

`get_recording_contact_sheet`, `get_frames` and `capture_recording_frame` now accept a `recordingId` from an external agent even when `projectId` is an editor project, but they show the raw track uncropped. Use `get_media_contact_sheet` for face sheets.

## 2. Check the face

`detect_faces` with the target from section 1 (default: 8 samples spread over the clip; or `everySeconds`, `times`). It runs Subclip's bundled offline face detector and returns, per time, the speaker's face box (`primary`, as 0 to 1 fractions and in pixels), the `medianFace`, a `suggestedCrop` and `suggestedFocus`. It finds faces only; it does not judge gaze.

If `framesWithFace` is low, the face is too small or too dark for the detector: pass a manual `crop` (section 3) around the face instead of `faceCrop`. If the camera is only a small picture-in-picture inside a screen recording (a stream layout), crop that region (`crop`, in source pixels or 0 to 1 fractions) and raise `tileSize` so the eyes are readable.

## 3. Face sheets

`get_media_contact_sheet`:

```json
{"projectId": "<edit>", "itemId": "<camera item>", "from": 0, "everySeconds": 0.5,
 "faceCrop": {}, "columns": 6, "rows": 4, "tileSize": 256}
```

- One call returns up to 48 tiles as two 6x4 sheets (12 s each), plus a JSON index `{sheets: [{start, end, tiles: [{t, row, col, face}]}]}`. When the clip is longer, the result has `next`: call again with that `from`.
- `faceCrop` crops a square of `scale` (default 1.25) times the median face size, centred on the face in each frame, so the crop follows a moving speaker. `follow: false` keeps one fixed crop on the median face. Tiles where no face was found use the median position and carry a `NO FACE` badge (`face: false` in the index): usually `away`.
- `crop: {x, y, width, height}` (source pixels, or all four as 0 to 1 fractions) gives a fixed crop instead. Use one or the other.
- Each tile is labelled `#index m:ss.s fFRAME` (frame at the source frame rate). Sheets and `index.json` are saved beside the project (`.agent-generated/media-sheets`), the recording (`.agent/media-sheets`) or the app cache; the paths are in the result.
- Frames come straight from the file with the bundled FFmpeg, so it is free, offline and needs no scratch project. 48 face-cropped tiles took about 25 s in testing (`renderSeconds`), most of it face detection.
- Zoom sheet: `times` with the doubtful tiles and the quarter steps around them, `faceCrop: {scale: 1.1}`, `tileSize: 480`, `columns: 3`.

## 4. Without a face crop

To see the whole frame (a hand over the face, the speaker leaving the frame), call `get_media_contact_sheet` without `crop` or `faceCrop`, or `extract_video_frames` for a few full-size frames.

## 5. Word timings

| Step | Tool |
|---|---|
| Transcribe if there are no captions | `transcribe_project` with `mode: "local"`, `language`, `highlight: "none"` (and `audioItemId` or `allTimelineClips: true`). Poll `get_transcription_status` with the `jobId`. Free and offline. |
| Read words | `get_script` with `pauseSeconds: 0.2`: every word has `start` and `end`, and gaps of 0.2 s or more are listed as pauses. |
| Hide captions if not wanted | `set_caption_segment_visibility` with `startMs: 0`, `endMs` = duration, `visible: false` |

`get_script` words carry no punctuation, so the phrase boundaries come from the pauses only (window-rules.md step 6).

## 6. Overlays

| Kind | Tool |
|---|---|
| Custom card | `add_html_motion_graphic` with `html`, `css`, `startTime`, `duration`, `width: 100`, `height: 100`, `x: 50`, `y: 50`. Script-free HTML and CSS; CSS keyframes run in frame time. Give the root an opaque background so the face never shows through. Revise with `update_html_motion_graphic` (same `itemId`), never by adding a second layer. |
| Template | `list_motion_graphics_templates`, then import with `templateId` and customise. |
| HyperFrames or Remotion scene | the `subclip-hyperframes-layer` or `subclip-remotion-layer` skills, timed to the window. |
| B-roll | `search_public_media` or `import_external_media`, then `update_media_item` to place it above the camera for exactly the window. |

The canvas of a landscape project renders at 1920x1080, so CSS pixel sizes map 1:1. Headlines of 110 to 150 px read well at full screen; 60 px body text.

Give every text element an explicit `color`. Before the fix of Nov 2026, text with no colour took the app theme's colour, so in dark mode it rendered light grey (nearly invisible on a white card) in previews and sheets; it now defaults to black. Check one frame per card before export.

Optional, and useful when showing the method: a small corner tag on each card ("covered: looking at the screen") and a small "camera look" pill (`width: 22`, `height: 9`, `x: 85`, `y: 9.5`) on every stretch of face time between windows.

## 7. Verify and export

- `get_timeline_contact_sheet` on the edit with, for every window, `start + 0.1`, the midpoint and `end - 0.1`, plus every camera tile time. One call, `detail: "balanced"`.
- `export_video` only when the user asked; check `list_render_queue` first; poll `get_export_status`.
- `extract_video_frames` on the exported MP4 at the same times for the final proof.

## 8. Comparison video (optional)

A vertical 1080x1920 project that shows the original and the edit in sync, so a reviewer sees what each card hides.

| Part | How |
|---|---|
| Project | `create_project` with `canvasPreset: "vertical"`; `set_canvas_properties` with `backgroundColor: "#ffffff"` |
| Two copies of the clip | `import_external_media` twice (same file, same trim), then `update_media_item` with `fitMode: "cover"`, `width: 1`, `height: 0.5625` and `positionX: 0`. Use `positionY: 0.153` for the top and `0.912` for the bottom. Media positions are top-left in canvas-width units (1 = 1080 px; the canvas is 1 x 1.778). Mute the top copy so the audio plays once. |
| Edit cards on the bottom half | `read_layer_source` on each card of the edit, then `add_html_motion_graphic` with the same CSS and HTML wrapped in `<div class="wrap">` (`.wrap{position:absolute;left:0;top:0;width:1920px;height:1080px;transform:scale(.5625);transform-origin:0 0}`), at `width: 100`, `height: 31.667`, `x: 50`, `y: 67.14` (canvas percent, centre) |
| Tags on the top half | one layer per window with a cyan frame and "will be covered: <reason>"; one per face-time gap with a blue frame and "camera look, kept"; `width: 100`, `height: 31.667`, `x: 50`, `y: 24.43` |
| Labels | "Original" above the top half (`y: 5.5`), "Edited with Subclip" above the bottom half (`y: 48.7`); use `white-space: nowrap` |
| Timeline bar | one layer for the whole duration between the halves (`y: 43.4`): a track with one block per window at `left = start / duration`, plus a playhead with `animation: mv <duration>s linear both` from `left: 0%` to `left: 100%` |
| Credit | the source credit line in the footer for the last few seconds |

Verify with one `get_timeline_contact_sheet` at the same times as step 7: top shows the look-away and its tag, bottom shows the card; at lens looks both halves show the face.

## Tool notes (Nov 2026)

- `get_media_contact_sheet`, `detect_faces` and the external-agent access to the recording frame tools were added for this skill (issue #298), replacing the earlier square scratch project plus `get_timeline_contact_sheet` workaround.
- Face detection finds faces only. Gaze is still judged by eye on the sheets (labelling.md).
