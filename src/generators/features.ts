import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

export async function extractFeatures(projectRoot: string): Promise<string[]> {
  const features: string[] = [];
  
  try {
    // Get all source files
    const files = await glob('**/*.{js,ts,jsx,tsx,py,go,rs,java,php}', {
      cwd: projectRoot,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
      nodir: true // Only return files, not directories
    });

    // Extract features from comments and code
    for (const file of files) {
      const filePath = path.join(projectRoot, file);
      
      try {
        // Check if it's actually a file before reading
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) {
          continue;
        }
        
        const content = await fs.readFile(filePath, 'utf8');
        
        // Extract features from comments
        const commentFeatures = extractFromComments(content);
        features.push(...commentFeatures);
        
        // Extract features from code structure
        const codeFeatures = extractFromCode(content, file);
        features.push(...codeFeatures);
      } catch (error) {
        // Skip files that can't be read
        console.warn(`Skipping file ${file}: ${(error as Error).message}`);
        continue;
      }
    }

    // Remove duplicates and format
    const uniqueFeatures = [...new Set(features)];
    return uniqueFeatures.length > 0 ? uniqueFeatures : ['Feature extraction in progress...'];
  } catch (error) {
    console.error('Error extracting features:', (error as Error).message);
    return ['Error extracting features'];
  }
}

function extractFromComments(content: string): string[] {
  const features: string[] = [];
  
  // Look for feature comments
  const featureRegex = /(?:\/\/|\/\*|\*|#)\s*(?:feature|todo|fixme|note):\s*(.+)/gi;
  let match;
  
  while ((match = featureRegex.exec(content)) !== null) {
    features.push(match[1].trim());
  }
  
  return features;
}

function extractFromCode(content: string, filename: string): string[] {
  const features: string[] = [];
  
  // Detect common patterns
  if (content.includes('express()') || content.includes('app.listen')) {
    features.push('REST API server');
  }
  
  if (content.includes('React') || content.includes('jsx')) {
    features.push('React frontend');
  }
  
  if (content.includes('useState') || content.includes('useEffect')) {
    features.push('React hooks');
  }
  
  if (content.includes('mongoose') || content.includes('MongoDB')) {
    features.push('MongoDB database');
  }
  
  if (content.includes('mysql') || content.includes('PostgreSQL')) {
    features.push('SQL database');
  }
  
  if (content.includes('jwt') || content.includes('passport')) {
    features.push('Authentication');
  }
  
  if (content.includes('multer') || content.includes('file upload')) {
    features.push('File upload');
  }
  
  if (content.includes('socket.io') || content.includes('WebSocket')) {
    features.push('Real-time communication');
  }
  
  if (content.includes('test') || content.includes('jest') || content.includes('mocha')) {
    features.push('Unit testing');
  }
  
  if (content.includes('docker') || filename.includes('Dockerfile')) {
    features.push('Docker containerization');
  }
  
  return features;
}