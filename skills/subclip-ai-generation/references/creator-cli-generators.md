# The creator's own generators: Codex CLI and Grok CLI

Some creators have the Codex CLI or the Grok CLI signed in on this computer. Images (and Grok video) made there use the creator's own plan, not Subclip credits. Codex image generation comes with a ChatGPT plan and is close to unlimited for most creators, so it is worth offering first.

This applies whoever is driving Subclip (Claude, Codex, Grok, another agent), as long as you can run shell commands. External MCP clients that cannot run commands skip this file.

## Check what is available (once per session)

| CLI | It works when | Images | Video |
|---|---|---|---|
| Codex | `codex login status` says logged in, and `codex features list` shows `image_generation` ... `true` | yes (new and from reference images) | no |
| Grok | `grok` is on PATH and a one-image test succeeds | `image_gen` (new), `image_edit` (from references) | `reference_to_video` (from images, pinned frames, preset voices) |

Being installed is not enough. The first real generation is the test: if it fails (not signed in, HTTP 403 "out of credits or needs a subscription", tool missing, moderation block), tell the creator in one line, stop using that CLI for the session and fall back to Subclip generation. Do not retry a failed CLI in a loop.

If you are Codex yourself, use your own image tool directly instead of starting another Codex.

## Order

1. The creator named the generator for this request (Subclip, Codex or Grok): use it.
2. A CLI works and the creator has not chosen: ask once, briefly. For example: "Codex is signed in here and can make these images on your ChatGPT plan, without Subclip credits. Use Codex, or Subclip's models?" Use the answer for the rest of the session. If they say "always", note it in the director brief (or the workspace brief) so later sessions know.
3. Otherwise use Subclip generation (`generate_ai_media`).

Subclip stays the choice for anything the CLIs cannot do: avatars, lip-sync, music, speech, background removal, and video when Grok is not working.

## Run them

Write outputs to a fresh folder (for example a temporary folder), then bring each file in with `import_external_media` (absolute path). Use one CLI call per image so failures stay small; run several in parallel when they are independent.

Codex image (about 40 seconds each):

```bash
codex exec --skip-git-repo-check --sandbox workspace-write -C "<out dir>" \
  -i "<reference image, optional>" \
  "Use your image generation tool to create one 16:9 image: <prompt>. Save the final image file as <out dir>/<name>.png. Reply with the saved path only." < /dev/null
```

Grok image or video (allow only the tool you need; never use `--always-approve` or `bypassPermissions`):

```bash
grok -p "Use image_gen to create one 16:9 image: <prompt>. Save the image file as <out dir>/<name>.png. Reply with the saved path only." \
  --cwd "<out dir>" --allow image_gen --permission-mode acceptEdits --no-subagents --disable-web-search < /dev/null
```

For edits allow `image_edit`; for video allow `reference_to_video` and name the start image path in the prompt. Check that the file exists before importing.

## Rules that still apply

- Send only the prompt and the reference images the creator agreed to use. Never send private project files, recordings or personal data the creator did not pick.
- Same quality bar as Subclip generation: look at every result, regenerate what is wrong. Image models garble text and numbers; put exact titles in as native text layers instead.
- These files are not in Subclip's AI Generations history. Mention in the session summary which images came from Codex or Grok.
