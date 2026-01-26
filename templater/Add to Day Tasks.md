<%*
/*
 * Add to Day Tasks
 * Moves checked tasks from the Tasks callout to Day's Tasks section
 * 
 * SETUP:
 * 1. Copy this file to your Obsidian vault's templates folder
 * 2. Go to Settings → Hotkeys, search for "Templater: Insert Add to Day Tasks"
 *    and click the + icon (no need to assign a key, this enables the command palette)
 */

// Get file content
let content = tp.file.content;

// Find the Tasks callout section
const calloutStart = content.indexOf('> [!todo]- Tasks');
if (calloutStart === -1) {
  new Notice("Couldn't find Tasks callout!");
  return;
}

// Find where callout ends (next section that doesn't start with >)
let calloutEnd = calloutStart;
const lines = content.slice(calloutStart).split('\n');
for (let i = 1; i < lines.length; i++) {
  if (!lines[i].startsWith('>') && lines[i].trim() !== '') {
    calloutEnd = calloutStart + lines.slice(0, i).join('\n').length;
    break;
  }
}

const calloutContent = content.slice(calloutStart, calloutEnd);

// Find checked tasks in the callout (- [x] pattern)
const checkedPattern = /^> - \[x\] .+$/gm;
const checkedTasks = calloutContent.match(checkedPattern);

if (!checkedTasks || checkedTasks.length === 0) {
  new Notice("No checked tasks found in Tasks callout!");
  return;
}

// Clean up tasks: remove the leading "> " and convert to unchecked
const tasksToAdd = checkedTasks.map(task => {
  return task.replace(/^> /, '').replace('- [x]', '- [ ]');
}).join('\n');

// Find the "### Day's Tasks" section
const dayTasksMarker = "### Day's Tasks";
const markerIndex = content.indexOf(dayTasksMarker);

if (markerIndex === -1) {
  new Notice("Couldn't find Day's Tasks section!");
  return;
}

// Find the end of the marker line
const lineEnd = content.indexOf('\n', markerIndex);

// Insert the tasks after the marker
const before = content.slice(0, lineEnd + 1);
const after = content.slice(lineEnd + 1);

// Normalize: strip leading newlines from after, we'll add our own
const afterTrimmed = after.replace(/^\n+/, '');

// If there are already tasks, join directly; otherwise add blank line before next section
const hasExistingTasks = afterTrimmed.startsWith('- [');
const separator = hasExistingTasks ? '\n' : '\n\n';

const newContent = before + '\n' + tasksToAdd + separator + afterTrimmed;

// Update the file
const file = tp.file.find_tfile(tp.file.path(true));
await app.vault.modify(file, newContent);

new Notice(`Added ${checkedTasks.length} task(s) to Day's Tasks!`);
%>
