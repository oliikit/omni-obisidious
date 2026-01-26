/**
 * Obsidian markdown file writer
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { config } from '../config.js';

/**
 * Format a date string for display
 */
function formatDate(isoDate) {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Convert a task to markdown format
 */
function taskToMarkdown(task, options = {}) {
  const { includeNotes = true } = options;
  
  const checkbox = task.completed ? '- [x]' : '- [ ]';
  const flag = task.flagged ? ' 🚩' : '';
  const tags = task.tags.length > 0 ? ` ${task.tags.map(t => `#${t.replace(/\s+/g, '-')}`).join(' ')}` : '';
  
  let line = `${checkbox} ${task.name}${flag}${tags}`;
  
  // Add due date
  if (task.dueDate) {
    line += ` 📅 ${formatDate(task.dueDate)}`;
  }
  
  // Add defer date
  if (task.deferDate) {
    line += ` ⏳ ${formatDate(task.deferDate)}`;
  }
  
  // Add notes as sub-bullet
  if (includeNotes && task.note && task.note.trim()) {
    const noteLines = task.note.trim().split('\n').map(l => `    - ${l}`).join('\n');
    line += `\n${noteLines}`;
  }
  
  return line;
}

/**
 * Group tasks by project
 */
function groupTasksByProject(tasks) {
  const groups = {};
  
  for (const task of tasks) {
    const projectName = task.project || 'No Project';
    if (!groups[projectName]) {
      groups[projectName] = [];
    }
    groups[projectName].push(task);
  }
  
  return groups;
}

/**
 * Generate markdown content from tasks
 */
export function generateMarkdown(tasks, options = {}) {
  const { 
    groupByProject = true, 
    includeNotes = true,
    title = 'OmniFocus Tasks'
  } = options;

  const lines = [];
  const now = new Date().toISOString().split('T')[0];
  
  // Header
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`> Last synced: ${now}`);
  lines.push('');
  
  if (tasks.length === 0) {
    lines.push('*No tasks found.*');
    return lines.join('\n');
  }

  // Stats
  const flaggedCount = tasks.filter(t => t.flagged).length;
  const dueToday = tasks.filter(t => t.dueDate && formatDate(t.dueDate) === now).length;
  const overdue = tasks.filter(t => t.dueDate && formatDate(t.dueDate) < now && !t.completed).length;
  
  lines.push(`**${tasks.length} tasks** | 🚩 ${flaggedCount} flagged | 📅 ${dueToday} due today | ⚠️ ${overdue} overdue`);
  lines.push('');
  lines.push('---');
  lines.push('');

  if (groupByProject) {
    const groups = groupTasksByProject(tasks);
    const projectNames = Object.keys(groups).sort((a, b) => {
      // Put "No Project" at the end
      if (a === 'No Project') return 1;
      if (b === 'No Project') return -1;
      return a.localeCompare(b);
    });
    
    for (const projectName of projectNames) {
      lines.push(`## ${projectName}`);
      lines.push('');
      
      // Sort tasks: flagged first, then by due date
      const sortedTasks = groups[projectName].sort((a, b) => {
        if (a.flagged && !b.flagged) return -1;
        if (!a.flagged && b.flagged) return 1;
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        return 0;
      });
      
      for (const task of sortedTasks) {
        lines.push(taskToMarkdown(task, { includeNotes }));
      }
      lines.push('');
    }
  } else {
    // Flat list sorted by due date
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.flagged && !b.flagged) return -1;
      if (!a.flagged && b.flagged) return 1;
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return 0;
    });
    
    for (const task of sortedTasks) {
      lines.push(taskToMarkdown(task, { includeNotes }));
    }
  }

  return lines.join('\n');
}

/**
 * Write markdown content to Obsidian vault
 */
export function writeToObsidian(content, options = {}) {
  const {
    vault = config.obsidianVault,
    folder = config.tasksFolder,
    filename = config.outputFile,
  } = options;

  // Ensure vault directory exists
  if (!existsSync(vault)) {
    throw new Error(`Obsidian vault not found at: ${vault}`);
  }

  // Create tasks folder if it doesn't exist
  const tasksPath = join(vault, folder);
  if (!existsSync(tasksPath)) {
    mkdirSync(tasksPath, { recursive: true });
    console.log(`Created folder: ${tasksPath}`);
  }

  // Write the file
  const filePath = join(tasksPath, filename);
  writeFileSync(filePath, content, 'utf-8');
  
  return filePath;
}
