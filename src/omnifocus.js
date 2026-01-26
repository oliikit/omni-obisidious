/**
 * OmniFocus integration via JXA (JavaScript for Automation)
 */

import { execSync } from 'child_process';

/**
 * Fetch tasks from a custom perspective
 * Uses Omni Automation API via evaluateJavascript
 */
export function fetchPerspectiveTasks(perspectiveName) {
  // Omni Automation script (runs inside OmniFocus)
  const omniScript = `
    (() => {
      const doc = document;
      const windows = doc.windows;
      
      if (windows.length === 0) {
        return JSON.stringify({error: 'No OmniFocus window open'});
      }
      
      const win = windows[0];
      const perspectiveName = "${perspectiveName}";
      
      // Try built-in perspectives first
      const builtIn = {
        'Inbox': Perspective.BuiltIn.Inbox,
        'Flagged': Perspective.BuiltIn.Flagged,
        'Forecast': Perspective.BuiltIn.Forecast,
        'Projects': Perspective.BuiltIn.Projects,
        'Tags': Perspective.BuiltIn.Tags,
        'Review': Perspective.BuiltIn.Review
      };
      
      if (builtIn[perspectiveName]) {
        win.perspective = builtIn[perspectiveName];
      } else {
        // Try custom perspective
        const customPerspective = Perspective.Custom.byName(perspectiveName);
        if (customPerspective) {
          win.perspective = customPerspective;
        } else {
          return JSON.stringify({error: 'Perspective "' + perspectiveName + '" not found'});
        }
      }
      
      const content = win.content;
      
      if (!content) {
        return JSON.stringify({error: 'No content in window'});
      }
      
      const tasks = [];
      
      content.rootNode.apply(node => {
        const obj = node.object;
        if (obj instanceof Task) {
          let projectName = null;
          try {
            if (obj.containingProject) projectName = obj.containingProject.name;
          } catch(e) {}
          
          const tagNames = [];
          try {
            for (const tag of obj.tags) {
              tagNames.push(tag.name);
            }
          } catch(e) {}
          
          tasks.push({
            id: obj.id.primaryKey,
            name: obj.name,
            completed: obj.completed,
            flagged: obj.flagged,
            dueDate: obj.dueDate ? obj.dueDate.toISOString() : null,
            deferDate: obj.deferDate ? obj.deferDate.toISOString() : null,
            note: obj.note || '',
            project: projectName,
            tags: tagNames
          });
        }
      });
      
      return JSON.stringify(tasks);
    })()
  `;

  // JXA wrapper that calls Omni Automation
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
    
    const parsed = JSON.parse(result.trim() || '[]');
    if (parsed.error) {
      throw new Error(parsed.error);
    }
    return parsed;
  } catch (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }
}

/**
 * Test connection to OmniFocus
 */
export function testConnection() {
  try {
    const result = execSync(`osascript -l JavaScript -e 'Application("OmniFocus").running()'`, {
      encoding: 'utf-8',
    });
    return result.trim() === 'true';
  } catch {
    return false;
  }
}
