#!/usr/bin/env node

/**
 * End of day script - marks completed tasks in OmniFocus
 * 
 * Reads today's daily note, finds checked tasks [x],
 * and marks them complete in OmniFocus.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { config } from '../config.js';
import { getTodayFilename } from './obsidian.js';

/**
 * Parse markdown file and extract completed task IDs
 * Only reads from the "### Day's Tasks" section
 */
function getCompletedTaskIds(markdown) {
  const completedIds = [];
  
  // Find the Day's Tasks section
  const dayTasksMarker = "### Day's Tasks";
  const markerIndex = markdown.indexOf(dayTasksMarker);
  
  if (markerIndex === -1) {
    console.log('⚠️  No "### Day\'s Tasks" section found.');
    return completedIds;
  }
  
  // Get content from Day's Tasks to the next section (---)
  const afterMarker = markdown.slice(markerIndex);
  const nextSection = afterMarker.indexOf('\n---');
  const dayTasksContent = nextSection !== -1 
    ? afterMarker.slice(0, nextSection) 
    : afterMarker;
  
  // Match: - [x] [Task name](omnifocus:///task/TASKID)
  const regex = /- \[x\] \[.*?\]\(omnifocus:\/\/\/task\/([^\)]+)\)/gi;
  
  let match;
  while ((match = regex.exec(dayTasksContent)) !== null) {
    completedIds.push(match[1]);
  }
  
  return completedIds;
}

/**
 * Mark tasks as complete in OmniFocus
 */
function markTasksComplete(taskIds) {
  if (taskIds.length === 0) {
    return { completed: 0, errors: [] };
  }

  const omniScript = `
    (() => {
      const taskIds = ${JSON.stringify(taskIds)};
      const results = { completed: [], errors: [] };
      
      // Build a lookup map of tasks by ID
      const taskMap = {};
      for (const task of flattenedTasks) {
        taskMap[task.id.primaryKey] = task;
      }
      
      for (const taskId of taskIds) {
        try {
          const task = taskMap[taskId];
          if (task) {
            if (!task.completed) {
              task.markComplete();
              results.completed.push({ id: taskId, name: task.name });
            } else {
              results.completed.push({ id: taskId, name: task.name, alreadyComplete: true });
            }
          } else {
            results.errors.push({ id: taskId, error: 'Task not found' });
          }
        } catch (e) {
          results.errors.push({ id: taskId, error: e.message });
        }
      }
      
      return JSON.stringify(results);
    })()
  `;

  const jxaWrapper = `
    const app = Application('OmniFocus');
    app.includeStandardAdditions = true;
    const result = app.evaluateJavascript(${JSON.stringify(omniScript.trim())});
    result;
  `;

  try {
    const result = execSync(`osascript -l JavaScript -e '${jxaWrapper.replace(/'/g, "'\\''")}'`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      timeout: 60000,
    });
    
    return JSON.parse(result.trim());
  } catch (error) {
    throw new Error(`Failed to mark tasks complete: ${error.message}`);
  }
}

async function main() {
  console.log('✅ omni-obsidious - Marking completed tasks in OmniFocus\n');

  // Find today's daily note
  const filename = getTodayFilename();
  const filePath = join(config.obsidianVault, config.tasksFolder, filename);
  
  console.log(`📄 Reading: ${filePath}`);
  
  if (!existsSync(filePath)) {
    console.error(`❌ Daily note not found: ${filePath}`);
    console.log('💡 Run "npm start" first to create today\'s note.');
    process.exit(1);
  }

  // Read and parse the markdown
  const markdown = readFileSync(filePath, 'utf-8');
  const completedIds = getCompletedTaskIds(markdown);
  
  console.log(`📋 Found ${completedIds.length} completed tasks\n`);
  
  if (completedIds.length === 0) {
    console.log('No tasks to mark complete. Check off some tasks in your daily note!');
    process.exit(0);
  }

  // Mark tasks complete in OmniFocus
  console.log('🔄 Marking tasks complete in OmniFocus...\n');
  
  try {
    const results = markTasksComplete(completedIds);
    
    // Report results
    for (const task of results.completed) {
      if (task.alreadyComplete) {
        console.log(`  ⏭️  ${task.name} (already complete)`);
      } else {
        console.log(`  ✅ ${task.name}`);
      }
    }
    
    for (const err of results.errors) {
      console.log(`  ❌ ${err.id}: ${err.error}`);
    }
    
    console.log(`\n🎉 Done! Marked ${results.completed.filter(t => !t.alreadyComplete).length} tasks complete.`);
    
    if (results.errors.length > 0) {
      console.log(`⚠️  ${results.errors.length} tasks had errors.`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
