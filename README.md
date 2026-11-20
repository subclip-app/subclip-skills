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

The skills call tools that the Subclip app serves over its local MCP server. Open the app, go to
**Desktop settings > Connect AI client**, and add the server to your agent. The app must be running.

## Maintainers

`skills/` is generated from the app's `resources/agent-skills`. Do not edit it by hand.

```sh
npm run sync    # copy public skills, skipping the ones in dev-only.json
npm run check   # fails on a dev-only skill, a bad frontmatter or an empty folder
```

`npm publish` runs both first.
