# openclaw-wip

[WIP](https://wip.co) integration plugin for [OpenClaw](https://openclaw.dev).

Log completed todos, browse maker profiles & projects, react, and comment — all through natural language.

## Features

- **Todos**: Create completed todos, view todo details and comments
- **Users**: Look up maker profiles, view their todos and projects
- **Projects**: Browse project details and activity
- **Reactions**: Like/unlike todos and comments
- **Comments**: Add, edit, and delete comments on todos
- **Viewer**: Quick access to your own profile, todos, and projects

## Installation

```bash
openclaw plugins install openclaw-wip
```

Or install from source:

```bash
openclaw plugins install https://github.com/graileanu/openclaw-wip
```

## Configuration

Add to your `~/.openclaw/config.json`:

```json
{
  "plugins": {
    "entries": {
      "wip": {
        "enabled": true,
        "config": {
          "apiKey": "your-wip-api-key"
        }
      }
    }
  }
}
```

### Getting your API Key

1. Log in to [wip.co](https://wip.co)
2. Go to [API page](https://wip.co/api)
3. Click **Manage API Keys**
4. Create and copy your API key

## Available Tools (16)

### Viewer (Authenticated User)
| Tool | Description |
|------|-------------|
| `wip_get_me` | Get your profile (streak, todos count, etc.) |
| `wip_get_my_todos` | List your completed todos |
| `wip_get_my_projects` | List your projects |

### Todos
| Tool | Description |
|------|-------------|
| `wip_create_todo` | Log a completed todo |
| `wip_get_todo` | Get todo details by ID |
| `wip_get_todo_comments` | List comments on a todo |

### Users
| Tool | Description |
|------|-------------|
| `wip_get_user` | Get a user's profile by username |
| `wip_get_user_todos` | List a user's completed todos |
| `wip_get_user_projects` | List a user's projects |

### Projects
| Tool | Description |
|------|-------------|
| `wip_get_project` | Get project details by ID |
| `wip_get_project_todos` | List a project's completed todos |

### Reactions
| Tool | Description |
|------|-------------|
| `wip_create_reaction` | Like a todo or comment |
| `wip_delete_reaction` | Remove your reaction |

### Comments
| Tool | Description |
|------|-------------|
| `wip_create_comment` | Comment on a todo |
| `wip_update_comment` | Edit your comment |
| `wip_delete_comment` | Delete your comment |

## Pagination

List endpoints support cursor-based pagination:

- `limit` — Number of items per page (default 25)
- `starting_after` — Pass the last item's ID to fetch the next page

Todo list endpoints also support date filtering:

- `since` — Filter from date (YYYY-MM-DD, YYYY-MM, YYYY, or Unix timestamp)
- `until` — Filter until date (same formats)

## License

MIT
