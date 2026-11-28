---
name: subclip-creator-style
description: Learn a creator's own editing style and script voice from their channel and keep it in a Subclip workspace. Confirm the content is theirs, run learn_creator_style on their channel or profile links, read the measured stats, opening sheets and transcripts, write STYLE.md, SCRIPT_VOICE.md and Dos and Don'ts into the workspace, then edit every new project to those measured numbers and update the profile when the creator corrects you. Use when the creator says "edit like my other videos", "learn my style", "match my channel", gives their channel link, or works in a workspace that already has a style profile.
---

# Subclip Creator Style

A creator's channel already shows how they cut, caption, mix and write. Measure it once, store it in a workspace, and every later edit starts in their style and not in a generic one.

This is for the creator's own content. To study someone else's reference for patterns only, use `subclip-style-sampling` and its limits.

## 1. Confirm it is theirs

Ask once, plainly: "Is this your own channel, or content you have the rights to study?" Only continue on a yes. `learn_creator_style` requires `confirmOwnContent: true` and you set it only after the creator said so in this conversation. A named channel that is not theirs: decline the channel study and offer `subclip-style-sampling` on a reference they supply.

Never copy another creator's identity: face, voice, catchphrases, series names.

## 2. Learn

1. Choose the workspace: an existing one for this brand or channel (`list_workspaces`), or a new name. Ask if it is not obvious.
2. Call `learn_creator_style` with `urls` (channel, profile, playlist or single videos on YouTube, Instagram, TikTok, X or Twitch), `confirmOwnContent: true`, `workspaceId` or `workspaceName`, and `maxVideos` (default 6, up to 20). Pick recent videos of the format the creator wants more of. Mixing shorts and long-form in one profile blurs the numbers: run each format on its own, or note both.
3. It returns a `jobId`. Poll `get_creator_style_status` about every 30 seconds, not faster. It downloads low-resolution copies, gets each transcript, and measures each video. For YouTube it takes the video's own captions (uploaded first, automatic otherwise) with the download, so no transcription runs and no credits are spent; only a video with no captions is transcribed, with the offline model when one is installed. Each video's result says where its transcript came from (`transcript.source`); if it says `unavailable`, read the reason and do not start a cloud transcription of whole channel videos without asking. Nothing is added to any project timeline.
4. When done you get `videos[]` (title, url, duration, `stats`, `transcriptPath`, `sheets`, `openingSheet`), `profile` (aggregates), `assets` (avatar, banner, thumbnails) and `workspace` (`id`, `filesWritten`). The tool has already written the measured facts into the workspace (`STYLE_STATS.md`, a stats file and the assets).

If `learn_creator_style` is not available in this app version: ask the creator for 3 to 6 of their own video files or links, bring each in with `fetch_linked_media` or as an attachment, read `get_media_context` sheets and the transcript (for a YouTube link, the `transcript` SRT that `fetch_linked_media` returns; transcribe only when there is none), measure by hand (shot lengths from the sheets, `get_audio_timeline_sheet` for levels), and write the same files. Say the profile is an estimate.

## 3. Look and read

The numbers say how fast and how loud. Only looking says what it looks like, and only reading says how they talk.

1. Open every `openingSheet` (the first 5 seconds, dense). Note for each video how it opens: first words, first frame, text on screen, time of the first cut, whether music is already playing.
2. Open the overview `sheets`. Note caption look and position, graphics, framing, colour, recurring layouts, how the video ends.
3. Read every transcript at `transcriptPath`, at least the first 30 seconds and the last 20 of each, and one in full.
4. Read `STYLE_STATS.md` and `profile`. Keep the measured values exactly; do not round them into adjectives.

## 4. Write the profile into the workspace

Write three things with `update_workspace` (`docs` for the files; read with `get_workspace` first and pass `ifRevision`). Layouts are in [references/profile-templates.md](references/profile-templates.md).

- **`STYLE.md`**: pacing (cuts per minute, median and range of shot length), hook patterns with timestamps and the video they came from, captions (present or not, position, size, words per page, colours, emphasis), graphics (kinds, how often, how long on screen), colour (palette hex values from `profile`), framing, music use (how much of the video has music, typical bpm, level under the voice in dB), sound effects, how videos end.
- **`SCRIPT_VOICE.md`**: how they open (quote real first lines), sentence length, vocabulary and words they repeat, person and tense, humour, how they move between points, call to action wording (quoted), structure of a typical video, what they never say.
- **Dos and Don'ts** in `WORKSPACE.md` (`dos`, `donts` on `update_workspace`; these are full lists, so keep the creator's existing entries and add). Short, checkable rules: "Do: first word inside 0.4 s", "Do: music 15 dB under the voice", "Don't: captions over the lower third", "Don't: logo intro".

Rules for writing it:

- Every claim cites a number or a timestamp. "Fast paced" is not a style; "22 cuts per minute, median shot 2.4 s" is.
- Separate what is consistent (in most videos) from what happened once.
- Do not edit `STYLE_STATS.md`; it is the tool's measured record.
- Show the creator a short summary (ten lines) and ask what is wrong or missing before you rely on it. Their correction outranks the measurement: they may want to change a habit, not repeat it.

## 5. Apply it

For every new project of this creator:

1. Put it in that workspace (`create_project` with `workspaceId`, or `move_projects_to_workspace` if they ask).
2. Read the workspace first: `get_project_director_brief` returns the workspace files. Read `STYLE.md`, `SCRIPT_VOICE.md`, the Dos and Don'ts and `STYLE_STATS.md` before planning.
3. Match the measured numbers, and check them with the tools:
   - cuts per minute and shot length: `get_pacing_analysis` within about 15 percent of the profile;
   - hook: first speech, first cut and first text at the profile's timings;
   - music gap: `get_audio_analysis` `speech.segments[].gapDb` within 2 dB of the profile, never masking the voice;
   - captions: same position, size, words per page and emphasis (`subclip-dynamic-captions`);
   - text and scripts you write: in the voice of `SCRIPT_VOICE.md`.
   If those tools are not available in this app version, compare with `analyze_timeline` and `get_audio_timeline_sheet`.
4. Use the workspace assets (logo, avatar) and templates (`@handles`) where the profile says the creator uses them.
5. Where the profile and `subclip-pacing`, `subclip-sound-mix` or `subclip-taste` differ, the profile wins on style, and the safety floors still hold: speech is never masked, true peak stays at or under -1 dBTP, text stays readable.
6. In `subclip-self-critique`, judge `taste`, `pacing` and `captions` against the profile, not against generic targets.

## 6. Keep it current

- When the creator corrects you ("captions are too big", "I never open with a question"), fix the edit and write the rule into the workspace in the same session: Dos or Don'ts for a rule, `STYLE.md` or `SCRIPT_VOICE.md` for a detail. Add a dated line under Notes saying what changed.
- When their style has moved on (new format, new look), run `learn_creator_style` again on recent videos and update the files; keep the creator's manual corrections.
- Workspace history keeps every version (`list_workspace_history`).

## Checklist

- Creator confirmed the content is theirs.
- Job finished; stats, opening sheets and transcripts all read.
- `STYLE.md`, `SCRIPT_VOICE.md` and Dos and Don'ts written with numbers and timestamps.
- Creator saw the summary and corrected it.
- New project lives in the workspace and was measured against the profile.
- Corrections written back.

Style-as-numbers approach adapted from the style brief stage of ai-video-editor-cooked by NextWork (MIT), https://github.com/nextwork-projects/ai-video-editor-cooked.
