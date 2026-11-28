---
name: subclip-transcription
description: Transcribe project speech for understanding, editing, or dubbing without automatically creating visible captions. Use for transcript-only, speech analysis, translation preparation, and dialogue references.
---

# Project transcription

## Transcription policy (the one every Subclip skill follows)

Other skills point here. If another skill or a tool description seems to say something different, this section wins.

Work down the list and stop at the first line that applies.

| # | If | Then |
| --- | --- | --- |
| 1 | The video came from a link (YouTube and similar) and `fetch_linked_media` returned `transcript`, or the creator's file has captions beside it (`.srt`, `.vtt`, `.json3`) | Use those words. Read the file to understand, summarise or pick segments; for on-screen captions pass the cues to `import_caption_cues_for_media_item` on each trimmed item. Do not transcribe. |
| 2 | The project already has captions or a saved reference transcript for the exact source and trim (`list_reference_transcripts`, `get_reference_transcript`) | Use it. Do not transcribe again. |
| 3 | The creator named a mode ("local", "offline", "on this computer", "no cloud", or "cloud") | Use that mode. Do not switch without asking. |
| 4 | What has to be transcribed is up to about 10 minutes of audio | `mode: "local"`. It is free, needs no sign-in and no confirmation. |
| 5 | It is longer than about 10 minutes | First make it shorter if you can (see "Transcribe the smallest thing"). If it is still long, ask once: local is free but slow on long audio (it can take as long as the recording, or longer on a busy computer); cloud is faster and spends credits. Use what they choose. If you cannot ask (unattended run), use local. |

**Transcribe the smallest thing.** The exact item or the finished cut, never a whole long source "to be safe". To cut a long recording down, choose segments from an existing transcript (line 1 or 2) when there is one, build the cut, then transcribe only the cut if captions need it. Use `allTimelineClips: true` only when the whole audible edit is the intended source.

**When something fails, fall back in this order.**

| If | Then |
| --- | --- |
| Local shows `progressState: "stalled"`, or no progress for 3 minutes on a short item | `stop_transcription`, then retry once with a smaller model (`model: "tiny"` or `"base"`). If that also stalls, ask the creator whether to use cloud. |
| Local model download fails (offline, disk) | Tell the creator what failed. Offer cloud, or retry when back online. |
| Cloud is refused (signed out, no credits, plan) | Say so in one line with the reason from the tool, then use local. `get_ai_credit_status` shows the balance; `open_upgrade_page` if they want more. |
| Cloud fails or times out | Retry once on a shorter range. If it fails again, use local. |
| Cloud says the range is too long for speaker detection | Split into runs of about 12 minutes or less (see Speakers). |
| A transcription is already running | Do not start a second one. `get_transcription_status` first; `stop_transcription` and wait for its success before replacing it. |
| Every route failed | Stop. Report each attempt and its error. Do not edit by guessing words. |

Always: one transcription at a time, store the returned `jobId`, pass `language` as a base ISO code, and say in your report which route you used and why.

## Speakers: always ask, never assume

Speaker detection is off unless the creator says yes. It is cloud-only, spends credits, and works on about 12 minutes of audio per run.

- Never pass `detectSpeakers: true` on your own, including on a first transcription of a podcast or interview.
- When the recording has more than one voice and labels would change the result (speaker-coloured captions, per-speaker cuts or layouts, dubbing with separate voices), ask once before transcribing: "This has more than one speaker. Do you want speaker detection? It needs Subclip Cloud, uses credits, and runs on up to about 12 minutes at a time." Then follow the answer.
- Yes: `mode: "cloud"`, `detectSpeakers: true`, on the finished cut or the exact items, in runs of about 12 minutes or less. Pass `expectedSpeakerCount` only when the creator gives a number.
- No, or no answer in an unattended run: transcribe without speakers by the policy above. If you need to know who is talking for an edit decision, work it out from the content and the picture and say that it is your reading.
- A request that already says "detect speakers", "label speakers" or "who is speaking" is the yes; do not ask again.

Host automatic captions (line 1) have good word times but no speaker labels and weaker punctuation and names. If the creator needs broadcast-accurate captions, transcribe the finished cut and say why.

## Choose the purpose

Choose the transcript's purpose before starting:

- For understanding, summaries, rough cuts, translation, or dubbing preparation, call `transcribe_project` with `purpose: "reference"` and an exact `audioItemId` or `mediaItemId`. Use `allTimelineClips: true` only when the whole audible edit is the intended source. This saves timed words and available speaker IDs under `.agent/transcripts/<transcriptId>.json` plus a readable `.md` file. It does not change the timeline, caption panel, or DynamicCaptionsInlineEditor.
- For visible subtitles or Dynamic Captions, call `transcribe_project` with `purpose: "captions"` and follow subclip-text-captions or subclip-dynamic-captions. A bare request to transcribe is reference work unless the creator asks to show words in the video.

Use existing project captions or a saved reference transcript when the exact source and current trim still match. Call `list_reference_transcripts` to find saved transcripts and `get_reference_transcript` with its ID to read timed words in pages. Do not repeat recognition just to recover context. Use `get_transcription_status` for external MCP polling; the in-app agent should keep the returned job ID and wait for its completion callback.

Local mode runs on-device Whisper (free). Cloud mode spends credits. Which one to use, what to do when it fails and when speaker detection is allowed are decided by the policy above.

For dubbing without source captions, pass the saved exact-item `referenceTranscriptId` to `create_dubbing_workspace`. The workspace uses its timed words and speakers directly. Generate visible target-language captions after the dub only when the creator asked for them or visible source captions are being replaced.
