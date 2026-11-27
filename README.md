# Subclip agent skills

Skills that teach AI agents (Claude Code, Codex, Cursor and others) how to drive the
[Subclip AI Video Editor](https://subclip.app/desktop/ai-video-editor): editing, the recorder, captions,
generation, export and publishing.

## Install

```sh
npx @subclip/skills install
```

or with the open skills installer:

```sh
npx skills add subclip-app/subclip-skills
```

Options: `--target claude|codex|agents|all` (default `claude`), `--only name,name`, `--dry-run`.
Other commands: `update`, `uninstall`, `list`.

Skills are installed for your user only (`~/.claude/skills`, `~/.codex/skills`, `~/.agents/skills`).
A folder with the same name that this tool did not install is left alone, and `uninstall` removes only
what this tool installed.

## Connect the app

The skills call tools that the Subclip app serves over its local MCP server, so the app must be running.
Install it from https://www.subclip.app/download.

- **With a screen:** open the app, go to **Desktop settings > Connect AI client**, and add the server to your agent.
- **Headless (servers, no screen, agent-managed):** start the app with `--headless` (app 1.0.52 or later), then run
  it again with `--print-mcp-config` to get the server URL and token for your agent. `--status`, `--stop` and
  `--restart` control the running copy.

Then have the agent call the `sign_in` tool: with a screen it opens the browser, headless it returns a link and code
for you to approve at subclip.app/device. The `subclip-video-editor` skill's `references/headless.md` lists what
differs between the two modes.

## What the skills cover

Besides editing, captions, recording, generation, export and publishing, the skills teach an agent to check its own
work the way a viewer would: `subclip-perception` (see, hear and read the video), `subclip-pacing` (rhythm, cuts on
the beat, how long text stays on screen), `subclip-sound-mix` (voice against music in dB, sound effects on events),
`subclip-taste` (no AI-made look), `subclip-story-edit` (footage in, story out), `subclip-self-critique` (score every
segment and fix what is weak), `subclip-creator-style` (learn your own channel's style into a workspace) and
`subclip-multi-agent-timeline` (several agents on one timeline). Some of these call tools that need a recent version
of the app; each skill names the older tool to fall back on.

## Maintainers

`skills/` is generated from the app's `resources/agent-skills`. Do not edit it by hand.

```sh
npm run sync    # copy public skills, skipping the ones in dev-only.json
npm run check   # fails on a dev-only skill, a bad frontmatter or an empty folder
```

`npm publish` runs both first.
