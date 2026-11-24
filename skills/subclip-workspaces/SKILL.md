---
name: subclip-workspaces
description: Organize projects into workspaces and use a workspace's Markdown context (WORKSPACE.md brief, Dos and Don'ts, brand, extra files), assets and reusable templates (logo animations, CTAs, lower thirds referenced as @handle). Use when the creator mentions a workspace, brand kit, client, channel or series, names a template like @cta, asks to move, group, clone, merge or delete workspaces, or when you edit a project that belongs to a workspace.
---

# Subclip Workspaces

A workspace groups projects and carries their shared context. Projects without a workspace are "Others". New creators never need workspaces; they appear only when someone creates one.

## Reading context

- The workspace context lives in Markdown files. `files[]` holds `WORKSPACE.md` (sections: Brief, Audience and voice, Dos, Don'ts, Brand, Defaults, Favourites, Notes) and any extra files the creator added, such as `style-guide.md`. Read all of them.
- `get_project_director_brief` returns `workspace` when the project belongs to one: its files, favourites (`favoriteSkills` are installed skills to prefer, read them with `read_subclip_skill`), assets and templates. Follow it. The project's own brief wins where the two differ.
- `get_workspace` returns the same context for any workspace; `list_workspaces` lists them; `list_projects` accepts `workspaceId` (`"none"` for Others) and shows each project's workspace.

## When to create one

Create a workspace when the creator asks, or suggest one when they clearly work on a recurring brand, client, channel or series, and create it only after they agree. Fill it from what they told you: `create_workspace` with a name and `docs: {"WORKSPACE.md": "..."}` written in the section layout above (or brief, dos, donts, brand, defaults, which fill those sections), plus favourites. New projects you create or clone inside a workspace project stay in that workspace by default (`create_project` / `clone_project` take `workspaceId`; `null` for none).

Never move, merge, archive or delete older projects or workspaces unless the creator asked.

## Editing

- `update_workspace` with `docs` writes whole files: read the file with `get_workspace`, change only what the creator asked, keep every other section and their wording, write the full content back (pass `ifRevision`). Add a new file with a new name (`{"style-guide.md": "..."}`); `null` deletes an extra file, never `WORKSPACE.md`.
- The older `brief`, `dos`, `donts`, `brand`, `defaults` parameters still work and replace only their section of `WORKSPACE.md`. Dos and Don'ts are full lists.
- Every change is kept: `list_workspace_history`, `restore_workspace_history`.
- `move_projects_to_workspace` moves projects (`workspaceId: null` = Others). Moving changes no project content.
- `clone_workspace`: `mode` `context` (brief, brand, assets, templates, no projects), `all-projects` or `selected-projects` (projects are cloned; originals stay). Pass `name` and `patch` to edit the copy at once.
- `merge_workspaces`: projects move to the target, assets are copied once, templates are copied (clashing handles get a suffix). `briefStrategy`: `keep-target`, `keep-source`, `combine` (append each source's WORKSPACE.md, join Dos and Don'ts) or `replace` with `patch.brief`. Sources go to the trash or are archived. Tell the creator what was merged.
- `archive_workspace`, `delete_workspace` (to trash for 30 days, projects become Others, nothing is deleted), `restore_workspace`.

## Assets

`add_workspace_asset` from a project media item (`projectId` + `itemId`) or an absolute `filePath` when you have file access; tag logos as kind `logo`. `insert_workspace_asset` places one on a project timeline (the project gets its own copy). `update_workspace_asset`, `delete_workspace_assets` (projects keep their copies).

## Templates (@handles)

- Save: `save_workspace_template` with the item ids (from `list_editor_assets`) of text, elements, HTML/HyperFrames/Remotion motion graphics or media. Give a clear name and handle (`cta-end`, `logo-intro`). Text items become slots.
- Use: when the creator writes `@cta-end` or "add our CTA", resolve it with `list_workspace_templates`, then `insert_workspace_template` with `anchor` (`start`, `end`, `playhead`) or `startTime`, and `slotValues` for the text. Check the result with `view_current_frame`.
- After a session where the creator liked a reusable element, offer to save it as a template, and offer to record new preferences in WORKSPACE.md (Dos, Don'ts, Notes).
- `update_workspace_template`, `delete_workspace_templates`, `copy_workspace_template` (to another workspace).

## Gallery templates and favourites

These are the Motion Graphics gallery (catalog) templates, not the snapshot templates above.

- The creator stars gallery templates; `list_favorite_templates` returns them (catalogId, name, kind, category, aspectRatio, width, height, duration, importTool). Prefer them when a motion graphic is needed. `set_favorite_template` stars or unstars one.
- A workspace can hold saved gallery templates: `list_workspace_gallery_templates` (one workspace or all), `save_gallery_template_to_workspace`, `remove_gallery_template_from_workspace`. `get_workspace` and `get_project_director_brief` list them as `galleryTemplates` and `favouriteTemplates`.
- To start from one, `create_project_from_template` makes a project at the template's own canvas (9:16 for vertical social templates) with it placed and named after it. To add one to an existing project, use its `importTool` (`add_runtime_layer` or `add_html_motion_graphic`) with `importArguments`.

## Skills per workspace

Installed skills can be limited to workspaces with `set_skill_enabled` (`workspaceIds`); only do this when the creator asks. A workspace's `favoriteSkills` (favourites category `skills`) are the installed skills the creator prefers there: use them first when they fit the task. Follow `subclip-skill-gateway` for any installed skill.
