import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function setupGitHooks(): Promise<void> {
  try {
    // Check if we're in a git repository
    await execAsync('git rev-parse --git-dir');
    
    // Setup pre-commit hook
    const hookPath = path.join(process.cwd(), '.git', 'hooks', 'pre-commit');
    const hookContent = `#!/bin/sh
# Auto README Generator pre-commit hook
npx auto-readme generate
git add README.md
`;
    
    await fs.writeFile(hookPath, hookContent);
    await fs.chmod(hookPath, '755');
    
    console.log('Git hooks setup successfully');
  } catch (error) {
    console.error('Error setting up git hooks:', (error as Error).message);
  }
}