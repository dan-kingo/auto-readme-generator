import * as fs from 'fs-extra';
import * as crypto from 'crypto';
import * as path from 'path';
import { glob } from 'glob';

export async function calculateChecksum(projectRoot: string): Promise<string> {
  try {
    // Get all relevant files
    const files = await glob('**/*', {
      cwd: projectRoot,
      ignore: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        '.next/**',
        'coverage/**',
        'README.md',
        '.autoreadme.json'
      ],
      nodir: true
    });

    // Calculate combined checksum
    const hash = crypto.createHash('md5');
    
    for (const file of files.sort()) {
      const filePath = path.join(projectRoot, file);
      const stats = await fs.stat(filePath);
      
      // Include file path and modification time
      hash.update(file);
      hash.update(stats.mtime.toISOString());
    }
    
    return hash.digest('hex');
  } catch (error) {
    console.error('Error calculating checksum:', (error as Error).message);
    return '';
  }
}