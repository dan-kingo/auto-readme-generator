import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import { Screenshot } from '../types';

export async function getScreenshots(projectRoot: string): Promise<Screenshot[]> {
  const screenshots: Screenshot[] = [];
  
  try {
    // Check for screenshots directory
    const screenshotDirs = ['screenshots', 'images', 'assets/images', 'public/images'];
    
    for (const dir of screenshotDirs) {
      const screenshotPath = path.join(projectRoot, dir);
      
      if (await fs.pathExists(screenshotPath)) {
        const files = await glob('**/*.{png,jpg,jpeg,gif,webp}', {
          cwd: screenshotPath,
          nodir: true
        });
        
        files.forEach(file => {
          screenshots.push({
            name: path.basename(file, path.extname(file)),
            path: path.join(dir, file),
            filename: file
          });
        });
      }
    }
    
    return screenshots;
  } catch (error) {
    console.error('Error getting screenshots:', (error as Error).message);
    return [];
  }
}