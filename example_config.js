/**
 * Configuration for omni-obsidious
 */

import { homedir } from 'os';
import { join } from 'path';

export const config = {
  // Path to your Obsidian vault
  obsidianVault: join(homedir(), 'PATH', 'TO', 'YOUR', 'VAULT'),
  
  // Folder within the vault to store tasks (will be created if doesn't exist)
  tasksFolder: 'OmniFocus',
   
  // Perspective to fetch tasks from (null for all tasks)
  perspective: 'Today',
  
  // Include completed tasks
  includeCompleted: false,
  
  // Group tasks by project
  groupByProject: true,
  
  // Include task notes
  includeNotes: true,
  
  // Date format for due dates
  dateFormat: 'YYYY-MM-DD',

  // configs for Obsidian templates using Templater
  templaterAddToDayTasks: '_templates/Add to Day Tasks',
  templaterCompleteTasks: '_templates/Complete Tasks'
};
