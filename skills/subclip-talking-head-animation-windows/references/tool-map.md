# Tool map

Every step uses Subclip MCP tools only. Pass `projectId` on every call and send mutations one at a time.

## 1. Find the camera source

| Need | Tool | Notes |
|---|---|---|
| Subclip recordings | `list_recordings` | The camera file is `<Projects folder>/<recordingId>.subclip/webcam.mp4`; the voice is `microphone.m4a` beside it (the webcam file usually has no audio). Both start at the same time. |
| A clip already in an edit | `get_project_outline`, then `read_project_section` (`lane: "media"`) | Take the talking-head item, its source path and its `startTime`. Times on the timeline are what the windows use. |

Do not use `get_recording_contact_sheet`, `get_frames` or `capture_recording_frame` for this skill from an outside agent: they need the Recorder assistant (an external MCP client gets "Open the Recorder assistant to edit a recording"), and they cannot crop to the face.

## 2. Locate the face

`extract_video_frames` with `source` (the camera file), `timesSeconds` (4 to 8 spread over the clip; at most 8 per call), `maxDimension: 480`. Read the face centre `fx, fy` (fractions of width and height) and the face height `hf` (hairline to chin, fraction of the frame height).

## 3. Face-crop scratch project

| Step | Tool and parameters |
|---|---|
| Create | `create_project` with `canvasPreset: "square"`, `projectName: "<project> face sheets"`, `durationSeconds` = clip length |
| Add the camera clip | `import_external_media` with `path` = camera file, `startTime` = the clip's timeline start in the edit (so sheet times equal edit times). Several clips: import each at its own start. |
| Crop to the face | `update_media_item` with `fitMode: "cover"`, `sourceZoom: Z`, `focusX: fx`, `focusY: fy`, `muted: true`, on every camera item |
| Check | `get_timeline_contact_sheet` with 4 to 6 `times`, `tileWidth: 256`, `detail: "balanced"` |

Start with `Z = 1 / (1.25 * hf)` for a landscape source, then adjust by eye: the tile should run from just above the hair to just below the chin, with both eyes large. The formula tends to come out too tight: in the demo (a face cam scaled to 1280x720, `hf` about 0.52) `Z = 1.3` cut the chin and hair when she moved, and `Z = 1.1` with `focusX: 0.58`, `focusY: 0.5` was right. The crop is fixed, so pick `fx, fy` as the median face position and leave room for head movement.

If the camera is only a small picture-in-picture inside a screen recording (a stream layout), first crop and scale that face cam region so the eyes are readable at 720p, then run the skill on it.

## 4. Sheets

`get_timeline_contact_sheet` on the scratch project:

```json
{"projectId": "<scratch>", "from": 0, "to": 23.5, "every": 0.5, "count": 48,
 "tileWidth": 256, "columns": 6, "maxTilesPerSheet": 24, "detail": "balanced", "waitSeconds": 110}
```

- One call returns up to 48 tiles: two 6x4 sheets, 12 s each. The next call starts at `from: 24`.
- Each tile is labelled `#index m:ss.s fFRAME`. Sheets are saved in the app cache (`outputDirectory` in the result); pass `saveToProject: true` to keep them in the scratch project.
- A 24 s block rendered in 15 to 40 s in testing (`renderSeconds` in the result).
- Zoom sheet: `times` with the doubtful tiles and the quarter steps around them, `tileWidth: 400`, `columns: 4`, `maxTilesPerSheet: 16`, `detail: "full"`.

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

Gotcha seen in the demo: small static elements with no CSS `animation` (a corner tag, a label pill) did not show in rendered frames. Give every visible element an entrance animation (`animation: up .4s ease-out both`) and check one frame per card before export.

Optional, and useful when showing the method: a small corner tag on each card ("covered: looking at the screen") and a small "camera look" pill (`width: 22`, `height: 9`, `x: 85`, `y: 9.5`) on every stretch of face time between windows.

## 7. Verify and export

- `get_timeline_contact_sheet` on the edit with, for every window, `start + 0.1`, the midpoint and `end - 0.1`, plus every camera tile time. One call, `detail: "balanced"`.
- `export_video` only when the user asked; check `list_render_queue` first; poll `get_export_status`.
- `extract_video_frames` on the exported MP4 at the same times for the final proof.

## Tool gaps (Nov 2026)

- `extract_video_frames` returns full frames only (at most 8 per call, no crop, no tiling). A `crop` (`{x, y, width, height}` in source pixels or fractions) and a `contactSheet` option (`everySeconds`, `columns`, `tileSize`, time stamps) would make this skill one call per 24 s with no scratch project.
- `get_recording_contact_sheet` tiles webcam frames every 0.5 s, but only inside the Recorder assistant and without a crop. Allowing it for external MCP clients with a `projectId`, plus a `crop` parameter, would also work.
- There is no face box finder. The skill reads the face position by eye from a few frames; a `detect_faces` tool returning boxes per time would let the crop follow a moving speaker.
