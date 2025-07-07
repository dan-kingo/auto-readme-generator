import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

interface TreeNode {
  [key: string]: TreeNode | null;
}

export async function generateFolderStructure(projectRoot: string): Promise<string> {
  try {
    // Get all files and directories
    const files = await glob('**/*', {
      cwd: projectRoot,
      ignore: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        '.next/**',
        'coverage/**',
        '.nyc_output/**',
        '*.log',
        '.DS_Store',
        'Thumbs.db'
      ],
      dot: true
    });

    // Build tree structure
    const tree = buildTree(files);
    
    // Convert tree to readable format
    return formatTree(tree);
  } catch (error) {
    console.error('Error generating folder structure:', (error as Error).message);
    return 'Error generating folder structure';
  }
}

function buildTree(files: string[]): TreeNode {
  const tree: TreeNode = {};
  
  files.forEach(file => {
    const parts = file.split(path.sep);
    let current = tree;
    
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};
      }
      if (current[part] !== null) {
        current = current[part] as TreeNode;
      }
    });
  });
  
  return tree;
}

function formatTree(tree: TreeNode, prefix = '', isRoot = true): string {
  const lines: string[] = [];
  const entries = Object.entries(tree);
  
  entries.forEach(([name, subtree], index) => {
    const isLast = index === entries.length - 1;
    const currentPrefix = isRoot ? '' : prefix;
    const connector = isLast ? '└── ' : '├── ';
    const nextPrefix = isRoot ? '' : prefix + (isLast ? '    ' : '│   ');
    
    lines.push(currentPrefix + connector + name);
    
    if (subtree !== null) {
      lines.push(formatTree(subtree, nextPrefix, false));
    }
  });
  
  return lines.join('\n');
}