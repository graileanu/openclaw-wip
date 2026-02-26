import { Type } from "@sinclair/typebox";

type WipConfig = {
  apiKey?: string;
};

const BASE_URL = "https://api.wip.co/v1";

export default function register(api: { pluginConfig: unknown; registerTool: (...args: any[]) => void }) {
  const cfg = api.pluginConfig as WipConfig;

  if (!cfg.apiKey) {
    console.warn("[wip] Plugin not configured: missing apiKey");
    return;
  }

  const apiKey = cfg.apiKey;

  async function wipRequest(method: string, path: string, opts?: {
    body?: Record<string, unknown>;
    query?: Record<string, string | number | undefined>;
  }) {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set("api_key", apiKey);
    if (opts?.query) {
      for (const [k, v] of Object.entries(opts.query)) {
        if (v !== undefined && v !== "") {
          url.searchParams.set(k, String(v));
        }
      }
    }

    const init: RequestInit = { method, headers: {} };
    if (opts?.body !== undefined) {
      (init.headers as Record<string, string>)["Content-Type"] = "application/json";
      init.body = JSON.stringify(opts.body);
    }

    const res = await fetch(url.toString(), init);

    if (res.status === 204) {
      return { ok: true };
    }

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!res.ok) {
      const msg =
        typeof data === "object" && data !== null && "error" in data
          ? String((data as { error: unknown }).error)
          : typeof data === "string"
            ? data
            : `HTTP ${res.status}`;
      throw new Error(`WIP API error (${res.status}): ${msg}`);
    }

    return data;
  }

  function json(data: unknown) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  // ============ VIEWER (authenticated user) ============

  api.registerTool({
    name: "wip_get_me",
    description: "Get the authenticated WIP user's profile (streak, projects count, avatar, etc.)",
    parameters: Type.Object({}),
    async execute() {
      return json(await wipRequest("GET", "/users/me"));
    },
  });

  api.registerTool({
    name: "wip_get_my_todos",
    description: "List the authenticated user's completed todos with optional date filters and pagination",
    parameters: Type.Object({
      limit: Type.Optional(Type.Number({ description: "Number of items to return (default 25)" })),
      starting_after: Type.Optional(Type.String({ description: "Cursor: fetch items after this todo ID" })),
      since: Type.Optional(Type.String({ description: "Filter todos since date (YYYY-MM-DD, YYYY-MM, YYYY, or Unix timestamp)" })),
      until: Type.Optional(Type.String({ description: "Filter todos until date (YYYY-MM-DD, YYYY-MM, YYYY, or Unix timestamp)" })),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { limit, starting_after, since, until } = params as {
        limit?: number; starting_after?: string; since?: string; until?: string;
      };
      return json(await wipRequest("GET", "/users/me/todos", {
        query: { limit, starting_after, since, until },
      }));
    },
  });

  api.registerTool({
    name: "wip_get_my_projects",
    description: "List the authenticated user's projects with pagination",
    parameters: Type.Object({
      limit: Type.Optional(Type.Number({ description: "Number of items to return (default 25)" })),
      starting_after: Type.Optional(Type.String({ description: "Cursor: fetch items after this project ID" })),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { limit, starting_after } = params as { limit?: number; starting_after?: string };
      return json(await wipRequest("GET", "/users/me/projects", {
        query: { limit, starting_after },
      }));
    },
  });

  // ============ TODOS ============

  api.registerTool({
    name: "wip_create_todo",
    description: "Create a completed todo on WIP. This logs a 'done' item visible on your profile and feed.",
    parameters: Type.Object({
      body: Type.String({ description: "The content of the todo (what you accomplished)" }),
      attachments: Type.Optional(Type.Array(Type.String(), { description: "List of attachment signed IDs (from wip_create_upload)" })),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { body, attachments } = params as { body: string; attachments?: string[] };
      return json(await wipRequest("POST", "/todos", {
        body: { body, ...(attachments?.length ? { attachments } : {}) },
      }));
    },
  });

  api.registerTool({
    name: "wip_get_todo",
    description: "Get a single completed todo by ID, including its projects, reactions count, and comments count",
    parameters: Type.Object({
      todo_id: Type.String({ description: "Todo ID" }),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { todo_id } = params as { todo_id: string };
      return json(await wipRequest("GET", `/todos/${encodeURIComponent(todo_id)}`));
    },
  });

  api.registerTool({
    name: "wip_get_todo_comments",
    description: "Get all comments on a todo with pagination",
    parameters: Type.Object({
      todo_id: Type.String({ description: "Todo ID" }),
      limit: Type.Optional(Type.Number({ description: "Number of items to return (default 25)" })),
      starting_after: Type.Optional(Type.String({ description: "Cursor: fetch items after this comment ID" })),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { todo_id, limit, starting_after } = params as {
        todo_id: string; limit?: number; starting_after?: string;
      };
      return json(await wipRequest("GET", `/todos/${encodeURIComponent(todo_id)}/comments`, {
        query: { limit, starting_after },
      }));
    },
  });

  // ============ USERS ============

  api.registerTool({
    name: "wip_get_user",
    description: "Get a WIP user's profile by username (streak, best streak, todos count, etc.)",
    parameters: Type.Object({
      username: Type.String({ description: "WIP username" }),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { username } = params as { username: string };
      return json(await wipRequest("GET", `/users/${encodeURIComponent(username)}`));
    },
  });

  api.registerTool({
    name: "wip_get_user_todos",
    description: "List a user's completed todos with optional date filters and pagination",
    parameters: Type.Object({
      username: Type.String({ description: "WIP username" }),
      limit: Type.Optional(Type.Number({ description: "Number of items to return (default 25)" })),
      starting_after: Type.Optional(Type.String({ description: "Cursor: fetch items after this todo ID" })),
      since: Type.Optional(Type.String({ description: "Filter todos since date (YYYY-MM-DD, YYYY-MM, YYYY, or Unix timestamp)" })),
      until: Type.Optional(Type.String({ description: "Filter todos until date (YYYY-MM-DD, YYYY-MM, YYYY, or Unix timestamp)" })),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { username, limit, starting_after, since, until } = params as {
        username: string; limit?: number; starting_after?: string; since?: string; until?: string;
      };
      return json(await wipRequest("GET", `/users/${encodeURIComponent(username)}/todos`, {
        query: { limit, starting_after, since, until },
      }));
    },
  });

  api.registerTool({
    name: "wip_get_user_projects",
    description: "List a user's projects with pagination",
    parameters: Type.Object({
      username: Type.String({ description: "WIP username" }),
      limit: Type.Optional(Type.Number({ description: "Number of items to return (default 25)" })),
      starting_after: Type.Optional(Type.String({ description: "Cursor: fetch items after this project ID" })),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { username, limit, starting_after } = params as {
        username: string; limit?: number; starting_after?: string;
      };
      return json(await wipRequest("GET", `/users/${encodeURIComponent(username)}/projects`, {
        query: { limit, starting_after },
      }));
    },
  });

  // ============ PROJECTS ============

  api.registerTool({
    name: "wip_get_project",
    description: "Get a single project by ID (name, pitch, description, owner, makers, logo, etc.)",
    parameters: Type.Object({
      project_id: Type.String({ description: "Project ID" }),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { project_id } = params as { project_id: string };
      return json(await wipRequest("GET", `/projects/${encodeURIComponent(project_id)}`));
    },
  });

  api.registerTool({
    name: "wip_get_project_todos",
    description: "List all completed todos for a project with optional date filters and pagination",
    parameters: Type.Object({
      project_id: Type.String({ description: "Project ID" }),
      limit: Type.Optional(Type.Number({ description: "Number of items to return (default 25)" })),
      starting_after: Type.Optional(Type.String({ description: "Cursor: fetch items after this todo ID" })),
      since: Type.Optional(Type.String({ description: "Filter todos since date (YYYY-MM-DD, YYYY-MM, YYYY, or Unix timestamp)" })),
      until: Type.Optional(Type.String({ description: "Filter todos until date (YYYY-MM-DD, YYYY-MM, YYYY, or Unix timestamp)" })),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { project_id, limit, starting_after, since, until } = params as {
        project_id: string; limit?: number; starting_after?: string; since?: string; until?: string;
      };
      return json(await wipRequest("GET", `/projects/${encodeURIComponent(project_id)}/todos`, {
        query: { limit, starting_after, since, until },
      }));
    },
  });

  // ============ REACTIONS ============

  api.registerTool({
    name: "wip_create_reaction",
    description: "React (like) a todo or comment. If already reacted, returns the existing reaction.",
    parameters: Type.Object({
      reactable_type: Type.String({ description: "Resource type: Todo or Comment" }),
      reactable_id: Type.String({ description: "ID of the todo or comment to react to" }),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { reactable_type, reactable_id } = params as { reactable_type: string; reactable_id: string };
      return json(await wipRequest("POST", "/reactions", {
        body: { reactable_type, reactable_id },
      }));
    },
  });

  api.registerTool({
    name: "wip_delete_reaction",
    description: "Remove your reaction from a todo or comment. You can only delete your own reactions.",
    parameters: Type.Object({
      reaction_id: Type.String({ description: "Reaction ID to delete" }),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { reaction_id } = params as { reaction_id: string };
      return json(await wipRequest("DELETE", `/reactions/${encodeURIComponent(reaction_id)}`));
    },
  });

  // ============ COMMENTS ============

  api.registerTool({
    name: "wip_create_comment",
    description: "Add a comment to a todo",
    parameters: Type.Object({
      todo_id: Type.String({ description: "ID of the todo to comment on" }),
      body: Type.String({ description: "Comment text" }),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { todo_id, body } = params as { todo_id: string; body: string };
      return json(await wipRequest("POST", "/comments", {
        body: { commentable_type: "Todo", commentable_id: todo_id, body },
      }));
    },
  });

  api.registerTool({
    name: "wip_update_comment",
    description: "Update your own comment. You can only update comments you created.",
    parameters: Type.Object({
      comment_id: Type.String({ description: "Comment ID to update" }),
      body: Type.String({ description: "New comment text" }),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { comment_id, body } = params as { comment_id: string; body: string };
      return json(await wipRequest("PATCH", `/comments/${encodeURIComponent(comment_id)}`, {
        body: { body },
      }));
    },
  });

  api.registerTool({
    name: "wip_delete_comment",
    description: "Delete your own comment. You can only delete comments you created.",
    parameters: Type.Object({
      comment_id: Type.String({ description: "Comment ID to delete" }),
    }),
    async execute(_id: string, params: Record<string, unknown>) {
      const { comment_id } = params as { comment_id: string };
      return json(await wipRequest("DELETE", `/comments/${encodeURIComponent(comment_id)}`));
    },
  });

  console.log(`[wip] Registered 16 tools for wip.co`);
}
