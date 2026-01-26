/**
 * Obsidian markdown file writer
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
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
 * Convert a task to markdown format (simplified - no dates)
 */
function taskToMarkdown(task) {
  const checkbox = task.completed ? '- [x]' : '- [ ]';
  const flag = task.flagged ? ' 🚩' : '';
  
  // Task name with OmniFocus link
  const ofLink = `[${task.name}](omnifocus:///task/${task.id})`;
  
  return `${checkbox} ${ofLink}${flag}`;
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
  const lines = [];
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().slice(0, 5); // HH:MM
  
  // Calculate stats
  const totalTasks = tasks.length;
  const dueToday = tasks.filter(t => t.dueDate && formatDate(t.dueDate) === dateStr).length;
  const overdue = tasks.filter(t => t.dueDate && formatDate(t.dueDate) < dateStr && !t.completed).length;
  const projects = [...new Set(tasks.map(t => t.project).filter(Boolean))];
  
  // Metadata
  lines.push(`> Last Synced: ${dateStr} ${timeStr}`);
  lines.push(`> ${totalTasks} tasks | ${dueToday} due today | ${overdue} overdue | ${projects.length} projects`);
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Tasks section using Obsidian callout (collapsible)
  lines.push('> [!todo]- Tasks');
  
  if (tasks.length === 0) {
    lines.push('> *No tasks found.*');
  } else {
    // Group tasks by project
    const grouped = groupTasksByProject(tasks);
    
    // Sort project names (No Project last)
    const projectNames = Object.keys(grouped).sort((a, b) => {
      if (a === 'No Project') return 1;
      if (b === 'No Project') return -1;
      return a.localeCompare(b);
    });
    
    for (const projectName of projectNames) {
      const projectTasks = grouped[projectName];
      
      // Sort tasks within project: flagged first, then by due date
      projectTasks.sort((a, b) => {
        if (a.flagged && !b.flagged) return -1;
        if (!a.flagged && b.flagged) return 1;
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        return 0;
      });
      
      lines.push(`> **${projectName}**`);
      for (const task of projectTasks) {
        lines.push(`> ${taskToMarkdown(task)}`);
      }
      lines.push('>');
    }
  }
  
  // Button to add checked tasks to Day's Tasks
  lines.push('');
  lines.push('```button');
  lines.push('name Add to Day Tasks');
  lines.push('type command');
  lines.push('action Templater: Insert _templates/Add to Day Tasks');
  lines.push('class button-add-to-day');
  lines.push('```');
  lines.push('');
  lines.push('---');
  
  // Day Planning section
  lines.push('## Day Planning');
  lines.push('');
  lines.push("- **What's top of mind?**");
  lines.push('');
  lines.push("- **What's the energy like today?**");
  lines.push('');
  lines.push("### Day's Tasks");
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('---');
  
  // Day Notes section
  lines.push('## Day\'s Notes');
  lines.push('');
  lines.push('');
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // End of Day Review section
  lines.push('## End of Day Review');
  lines.push('');
  lines.push('- **What went well today?**');
  lines.push('');
  lines.push('');
  lines.push('- **What was draining?**');
  lines.push('');
  lines.push('');
  lines.push("- **What's lingering that's still top of mind?**");
  lines.push('');
  lines.push('');
  lines.push('');
  
  // Button to complete tasks in OmniFocus
  lines.push('```button');
  lines.push('name Complete Tasks in OmniFocus');
  lines.push('type command');
  lines.push('action Templater: Insert _templates/Complete Tasks');
  lines.push('class button-complete');
  lines.push('```');
  lines.push('');

  return lines.join('\n');
}

/**
 * Get today's date formatted as YYYY-MM-DD
 */
export function getTodayFilename() {
  const now = new Date();
  return `${now.toISOString().split('T')[0]}.md`;
}

/**
 * Write markdown content to Obsidian vault
 * If file exists, only appends new tasks to the Tasks callout
 */
export function writeToObsidian(content, tasks, options = {}) {
  const {
    vault = config.obsidianVault,
    folder = config.tasksFolder,
    filename = getTodayFilename(), // Default to daily note
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

  const filePath = join(tasksPath, filename);
  
  // If file exists, only append new tasks
  if (existsSync(filePath)) {
    const existingContent = readFileSync(filePath, 'utf-8');
    
    // Extract existing task IDs from the file
    const existingIds = new Set();
    const idRegex = /omnifocus:\/\/\/task\/([^\)]+)/g;
    let match;
    while ((match = idRegex.exec(existingContent)) !== null) {
      existingIds.add(match[1]);
    }
    
    // Find new tasks that aren't already in the file
    const newTasks = tasks.filter(t => !existingIds.has(t.id));
    
    if (newTasks.length === 0) {
      console.log('No new tasks to add.');
      return filePath;
    }
    
    // Generate markdown for new tasks only
    const newTaskLines = newTasks.map(task => `> ${taskToMarkdown(task)}`).join('\n');
    
    // Find the end of the Tasks callout and insert before it
    // Look for the line with just '>' before the '---'
    const calloutEndRegex = /(> \[!todo\]- Tasks[\s\S]*?)(\n>\n---)/;
    const updatedContent = existingContent.replace(calloutEndRegex, `$1\n${newTaskLines}$2`);
    
    writeFileSync(filePath, updatedContent, 'utf-8');
    console.log(`Added ${newTasks.length} new task(s).`);
    return filePath;
  }

  // Write new file
  writeFileSync(filePath, content, 'utf-8');
  
  return filePath;
}
