# OpenClaw Plugin Naming Rules

When building an OpenClaw plugin, three identifiers must be consistent:

## The Three Names

1. **`openclaw.plugin.json` → `id`** — The plugin's canonical identifier
2. **`package.json` → `name`** — The npm package name
3. **Directory name** — The folder name under `~/.openclaw/extensions/`

**All three MUST match exactly.**

## Why This Matters

OpenClaw v2026.2.17+ performs strict validation:

- If `package.json` name differs from `openclaw.plugin.json` id → **warning** (config warns on every operation)
- If directory name differs from `openclaw.plugin.json` id → **fatal crash-loop** (container won't start)
- If `openclaw.plugin.json` is missing entirely → **fatal crash-loop**

## Example

For a plugin with id `wip`:

```
extensions/wip/                    # directory name = "wip"
├── openclaw.plugin.json           # "id": "wip"
├── package.json                   # "name": "wip"
├── index.ts
└── ...
```

## Common Mistake

Using a prefixed name like `openclaw-wip` in `package.json` while the manifest id is `wip`. GitHub repo names often use the `openclaw-` prefix for discoverability, but the package name and directory must match the manifest id exactly.

## Config Entry

The `plugins.entries` key in `openclaw.json` must also match the id:

```json
{
  "plugins": {
    "entries": {
      "wip": {           // <-- must match openclaw.plugin.json id
        "enabled": true,
        "config": {
          "apiKey": "${WIP_API_KEY}"
        }
      }
    }
  }
}
```

## Checklist Before Publishing

- [ ] `openclaw.plugin.json` exists and has an `id` field
- [ ] `package.json` `name` matches the `id`
- [ ] When installed, directory name matches the `id`
- [ ] Config entries in `openclaw.json` use the same `id` as key
- [ ] Plugin config uses `${ENV_VAR}` syntax for secrets (not hardcoded values)
