---
name: subclip-agent-orchestration
description: Split a big video job across parallel sub-agents that Subclip runs on this computer (Codex, Claude, Cursor or Grok CLI sessions), each on its own task or sub-project, then merge the results into one timeline. Use when the creator asks to go faster, to work in parallel or with several agents, or when a job has independent parts (narration, images, clips, music, motion graphics) that would take long one after another. Always check memory first.
---

# Subclip agent orchestration

You can act as the orchestrator. Subclip runs other agents installed on this computer as sub-agents: `codex`, `claude`, `cursor`, `grok` (never Subclip's own chat assistant). Each sub-agent works with the same Subclip tools, its chat is saved in its project (the creator can open it in the editor and follow up), and its generations call Subclip's cloud workflows in parallel.

Only orchestrate when the job really has independent parts. A short edit is faster done yourself.

## 1. Check the machine (every time)

1. `get_system_resources`. Start no more sessions than `canStartAgents`. Each CLI session needs about 0.8 GB; 2 GB stays reserved for the editor and renders.
2. Call it again before each further `start_agent_session`, and whenever a session finishes, before starting the next.
3. If `canStartAgents` is 0: wait for running sessions, or do the part yourself. Never force more.
4. `list_agent_providers`: use only installed providers. Ask the creator which ones to use if they named some (for example "use Codex and Grok"); otherwise use what is installed.

## 2. Plan the split

Write the plan before starting anything: parts, owner, inputs, outputs. Good splits:

| Sub-agent | Task | Output |
|---|---|---|
| Narration | script beats, voice (local TTS in tests), place on timeline | beat start and end times |
| Images | keyframes from the style anchor | item ids per beat |
| Video | animate the approved frames | clip operation ids |
| Music | one bed (Lyria first, MiniMax if Lyria misses) | audio item id |
| Motion graphics | titles, lower thirds, charts | item ids |

Shared decisions (style, palette, voice, durations, aspect ratio) are made by you first and written into every task. Sub-agents do not see your conversation.

## 3. Where they work

- Parts that touch the same timeline at the same moment must not run in parallel on one project. Give each such part its own sub-project: `create_project` (same canvas), name it "<film> - <part>", put it in the same workspace.
- Parts that only generate (images, clips, music) can work on the main project, because generation does not edit the timeline until import; tell them to import only into their own time ranges, or to return operation ids and let you import.

## 4. Start, follow, fix

- `start_agent_session` with `projectId`, `provider`, a short `title` (shows as the chat name) and a self-contained `prompt`: goal, exact inputs (ids, paths, times, style seed, colours), what to return, and "do not start other agents".
- Follow with `get_agent_session` about every 30 seconds, not faster. `list_agent_sessions` shows all of them.
- Wrong result: `send_agent_message` with the fix (same chat). Stuck for minutes with no new tool calls: `stop_agent_session` and redo that part.
- Sub-agents cannot start more agents.

## 5. Merge and finish

1. `merge_project_timeline` each sub-project into the main project at the right `startTime` (it keeps relative timing; captions are not copied).
2. Review the whole film with `get_timeline_contact_sheet`, fix overlaps, then caption it (one `transcribe_project` per narration item).
3. Tell the creator which sessions ran, where their chats are, what each made, and the credits spent (`get_ai_credit_status`).
