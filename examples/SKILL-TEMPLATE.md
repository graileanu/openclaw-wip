# WIP Daily Workflow

> Copy this file to `~/.openclaw/skills/wip/SKILL.md` and customize.

## Logging Todos

When I finish a task, log it on WIP using `wip_create_todo`. Keep the text concise and action-oriented:

- Good: "Added dark mode toggle to settings page"
- Good: "Fixed auth redirect bug on mobile Safari"
- Bad: "Worked on stuff"
- Bad: "Did some coding"

Use hashtags to tag projects: "Shipped v2.0 #myproject"

## Daily Check-in

At the start of the day, check my streak and recent activity:
1. `wip_get_me` — see current streak
2. `wip_get_my_todos` with `since` set to today — see what I've logged today

## Browsing the Community

To check on other makers:
1. `wip_get_user` — look up their profile and streak
2. `wip_get_user_todos` — see what they've been shipping

## Engaging

- Like a todo: `wip_create_reaction` with `reactable_type: "Todo"`
- Comment on a todo: `wip_create_comment`
- Like a comment: `wip_create_reaction` with `reactable_type: "Comment"`

## Tips

- Log todos as you complete them to maintain your streak
- Keep todo text under ~280 chars for best readability in the feed
- Use `since`/`until` filters to review activity for specific time periods
