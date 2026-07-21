/**
 * Setup script for Obsidian integration
 * Copies templates and CSS snippets to your vault
 */

import { config } from '../config.js';
import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function setup() {
  console.log('🔧 Setting up Obsidian integration...\n');
  
  const vaultPath = config.obsidianVault;
  
  if (!existsSync(vaultPath)) {
    console.error(`❌ Vault not found: ${vaultPath}`);
    console.error('   Please check your config.js obsidianVault path');
    process.exit(1);
  }
  
  // 1. Copy templates
  const templatesSource = join(projectRoot, 'templater');
  const templatesDestination = join(vaultPath, '_templates'); // Common convention
  
  if (!existsSync(templatesDestination)) {
    mkdirSync(templatesDestination, { recursive: true });
    console.log(`📁 Created templates folder: ${templatesDestination}`);
  }
  
  const templateFiles = readdirSync(templatesSource).filter(f => f.endsWith('.md'));
  for (const file of templateFiles) {
    const src = join(templatesSource, file);
    const dest = join(templatesDestination, file);
    copyFileSync(src, dest);
    console.log(`📝 Copied template: ${file}`);
  }
  
  // 2. Copy CSS snippets
  const snippetsSource = join(projectRoot, '.obsidian', 'snippets');
  const snippetsDestination = join(vaultPath, '.obsidian', 'snippets');
  
  if (!existsSync(snippetsDestination)) {
    mkdirSync(snippetsDestination, { recursive: true });
    console.log(`📁 Created snippets folder: ${snippetsDestination}`);
  }
  
  const snippetFiles = readdirSync(snippetsSource).filter(f => f.endsWith('.css'));
  for (const file of snippetFiles) {
    const src = join(snippetsSource, file);
    const dest = join(snippetsDestination, file);
    copyFileSync(src, dest);
    console.log(`🎨 Copied snippet: ${file}`);
  }
  
  console.log('\n✅ Setup complete!\n');
  console.log('Next steps in Obsidian:');
  console.log('  1. Settings → Appearance → CSS snippets');
  console.log('     → Click refresh icon, then enable "omni-obsidious-buttons"');
  console.log('  2. Settings → Templater → Template folder location');
  console.log('     → Set to: _templates');
  console.log('  3. Settings → Templater → User System Command Functions');
  console.log('     → Add "refresh_tasks" and "complete_tasks" commands (see README for details)');
}

setup().catch(console.error);
