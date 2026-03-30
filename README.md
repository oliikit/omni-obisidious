# Omni-Obsidious

TODO - need to specify the day for complete
TODO - TIME IS WRONG
TODO - ADD folders

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
npm run remake     # Delete and recreate today's note 
```

## Obsidian Setup

### Required Plugins

Install from Settings → Community plugins:
- **Templater** — Runs the task scripts
- **Buttons** — Enables buttons in daily notes

### Copy Files to Your Vault

Copy these folders to your Obsidian vault:

| Source | Destination | Purpose |
|--------|-------------|---------|
| `templater/` | Your templates folder | Button action templates |
| `.obsidian/snippets/` | `.obsidian/snippets/` | Custom button styles |

### Enable Button Styles (Required)

1. Go to **Settings → Appearance → CSS snippets**
2. Click the refresh icon to reload snippets
3. Toggle **ON** the `omni-obsidious-buttons` snippet

> Without this step, the buttons will not have their custom colors.

### Template Setup

1. Set Templater's template folder (Settings → Templater → Template folder location)
2. For each template, go to Settings → Hotkeys, search for "Templater: Insert [template name]" and click the + icon (this enables command palette access)

### Complete Tasks Setup

The "Complete Tasks" button requires a system command:

1. Go to Settings → Templater → User System Command Functions
2. Add new function with Name: `complete_tasks`
3. Set Command based on your Node setup:

   **nvm users:**
   ```
   source ~/.nvm/nvm.sh && cd ~/path/to/omni-obsidious && npm run complete
   ```
   
   **Homebrew users:**
   ```
   export PATH=/opt/homebrew/bin:$PATH && cd ~/path/to/omni-obsidious && npm run complete
   ```
   
   **Standard Node install:**
   ```
   export PATH=/usr/local/bin:$PATH && cd ~/path/to/omni-obsidious && npm run complete
   ```

4. Replace `~/path/to/omni-obsidious` with your actual path
5. Reload Obsidian

## Workflow

1. Run `npm start` to sync OmniFocus tasks to today's daily note
2. Check tasks you want to work on in the Tasks callout
3. Click "Add to Day Tasks" button to move them to your day plan
4. Work through your tasks, checking them off as you complete them
5. Click "Complete Tasks in OmniFocus" to sync completions back

## Recommended Plugins

- **Outliner**: Move list items with `Cmd+Shift+↑/↓`
# TODO - add to omnifocus section in obsidian
# TODO - better organization with team label and full project slug
