# Omni-Obsidious

Sync OmniFocus tasks to Obsidian daily notes.

## Setup

```bash
npm install
cp example_config.js config.js
# Edit config.js with your vault path and perspective
```

## Usage

```bash
npm start          # Sync tasks to today's daily note
npm run complete   # Mark checked tasks complete in OmniFocus
```

## Templater Setup

Copy `templates/Add to Day Tasks.md` to your Obsidian templates folder, then:

1. Install **Templater** plugin (Settings → Community plugins → Browse)
2. Configure template folder (Settings → Templater → Template folder location)
3. Assign a hotkey (Settings → Hotkeys → search "Templater: Insert Add to Day Tasks")

**Workflow:** Check tasks in the Tasks callout → Run hotkey → Tasks move to Day's Tasks

## Recommended Obsidian Plugins

- **Templater** — Required for the "Add to Day Tasks" command
- **Outliner** — Move list items with `Cmd+Shift+↑/↓`
