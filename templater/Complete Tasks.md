<%*
/*
 * Complete Tasks in OmniFocus
 * 
 * SETUP:
 * 1. Open Obsidian Settings → Templater
 * 2. Scroll to "User System Command Functions"
 * 3. Click "Add New User Function"
 * 4. Set Name: complete_tasks
 * 5. Set Command (pick one based on your setup):
 *
 *    For nvm users:
 *    source ~/.nvm/nvm.sh && cd ~/path/to/omni-obsidious && npm run complete
 *
 *    For Homebrew users:
 *    export PATH=/opt/homebrew/bin:$PATH && cd ~/path/to/omni-obsidious && npm run complete
 *
 *    For standard Node install:
 *    export PATH=/usr/local/bin:$PATH && cd ~/path/to/omni-obsidious && npm run complete
 *
 * 6. Replace ~/path/to/omni-obsidious with your actual path
 * 7. Save and reload Obsidian
 * 8. Go to Settings → Hotkeys, search for "Templater: Insert Complete Tasks"
 *    and click the + icon (no need to assign a key, this enables the command palette)
 */

const result = await tp.user.complete_tasks();
new Notice(result);
%>
