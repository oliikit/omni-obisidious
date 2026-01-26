#!/usr/bin/env node

/**
 * Remake script - removes today's daily note and creates a fresh one
 * Useful for testing
 */

import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { config } from '../config.js';
import { getTodayFilename } from './obsidian.js';

// Get today's file path
const filename = getTodayFilename();
const filePath = join(config.obsidianVault, config.tasksFolder, filename);

// Remove if exists
if (existsSync(filePath)) {
  unlinkSync(filePath);
  console.log(`🗑️  Removed: ${filePath}`);
} else {
  console.log(`📄 File doesn't exist: ${filePath}`);
}

// Now run the sync
console.log('');
import('./index.js');
