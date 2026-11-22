---
name: subclip-image-generation
description: Generate persistent cloud images with Subclip AI from text and supported image references. Use for new images, backgrounds, plates, posters, or semantic image revisions that should appear in AI Generations.
---

# Subclip Image Generation

Subclip cloud image generation is optional and uses AI credits. First check the creator's own generators: when the Codex CLI or Grok CLI is signed in and working here, ask once (unless the creator already chose) whether to use it without Subclip credits, then bring the picture in with `import_external_media`. See [creator CLI generators](../subclip-ai-generation/references/creator-cli-generators.md). Use this skill when the creator chooses Subclip, when no CLI works, or when its models fit best.

Follow `$subclip-ai-generation` for quota, credits, async completion, history, and deletion.

Call `list_ai_models` with `kind: image`. Choose only a returned model and match its `acceptedInputs`, `maxAssets`, aspect ratios, and resolution policy. When the model accepts image references, pass them through `sourceAssets` with exact `sourceFileId` or `sourceItemId` values from `list_editor_assets` and role `reference`; do not hide references in `settings`. Use `generate_ai_media` with `kind: image` and `confirmed: true` once when the current request authorizes those exact settings. Preserve the returned operation ID; a revision is a new operation, not an overwrite.

When a completed image is used in the edit, import it as a normal MediaPanel image and verify its placement on the canvas. Do not claim its internal generated pixels are separate editable layers.

## Current model capabilities

Read [model selection and pricing](references/model-selection.md) when selecting a model, quoting credits, supplying references or comparing quality tiers. Live discovery overrides historical model lists.
