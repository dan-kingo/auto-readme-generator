import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function postInstall(): Promise<void> {
  try {
    console.log('Setting up Auto README Generator...');
    
    // Check if this is a development installation
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      return;
    }
    
    // Check if we're in a git repository
    try {
      await execAsync('git rev-parse --git-dir');
    } catch (error) {
      console.log('Not a git repository, skipping git hooks setup');
      return;
    }
    
    // Setup husky if not already installed
    const packagePath = path.join(process.cwd(), 'package.json');
    if (await fs.pathExists(packagePath)) {
      const pkg = await fs.readJson(packagePath);
      
      if (!pkg.devDependencies?.husky) {
        console.log('Installing husky for git hooks...');
        await execAsync('npm install --save-dev husky');
        await execAsync('npx husky install');
      }
    }
    
    console.log('Auto README Generator setup complete!');
  } catch (error) {
    console.error('Setup failed:', (error as Error).message);
  }
}

// Run setup if called directly
if (require.main === module) {
  postInstall();
}