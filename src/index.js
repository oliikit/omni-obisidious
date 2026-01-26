#!/usr/bin/env node

/**
 * omni-obsidious - Sync OmniFocus tasks to Obsidian
 * 
 * Reads tasks from a configured perspective in OmniFocus
 * and writes them to your Obsidian vault.
 */

import { fetchPerspectiveTasks, testConnection } from './omnifocus.js';
import { generateMarkdown, writeToObsidian } from './obsidian.js';
import { config } from '../config.js';

async function main() {
  console.log('🔄 omni-obsidious - Syncing OmniFocus to Obsidian\n');

  // Test OmniFocus connection
  console.log('📱 Connecting to OmniFocus...');
  if (!testConnection()) {
    console.error('❌ Could not connect to OmniFocus. Make sure it is running.');
    process.exit(1);
  }
  console.log('✅ Connected to OmniFocus\n');

  // Fetch tasks from configured perspective
  console.log(`📥 Fetching tasks from "${config.perspective}" perspective...`);
  const tasks = fetchPerspectiveTasks(config.perspective);
  console.log(`✅ Found ${tasks.length} tasks\n`);

  // Generate markdown
  console.log('📝 Generating markdown...');
  const markdown = generateMarkdown(tasks, {
    groupByProject: config.groupByProject,
    includeNotes: config.includeNotes,
  });

  // Write to Obsidian
  console.log('💾 Writing to Obsidian vault...');
  try {
    const filePath = writeToObsidian(markdown, tasks);
    console.log(`✅ Written to: ${filePath}\n`);
  } catch (error) {
    console.error(`❌ Failed to write: ${error.message}`);
    console.log('\n💡 Update the vault path in config.js to match your Obsidian vault location.');
    process.exit(1);
  }

  console.log('🎉 Sync complete!');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
