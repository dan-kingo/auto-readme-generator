const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

async function generateFolderStructure(projectRoot) {
  const structure = [];
  
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
    console.error('Error generating folder structure:', error.message);
    return 'Error generating folder structure';
  }
}

function buildTree(files) {
  const tree = {};
  
  files.forEach(file => {
    const parts = file.split(path.sep);
    let current = tree;
    
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};
      }
      if (current[part] !== null) {
        current = current[part];
      }
    });
  });
  
  return tree;
}

function formatTree(tree, prefix = '', isRoot = true) {
  const lines = [];
  const entries = Object.entries(tree);
  
  entries.forEach(([name, subtree], index) => {
    const isLast = index === entries.length - 1;
    const currentPrefix = isRoot ? '' : prefix;
    const connector = isLast ? '└── ' : '├── ';
    const nextPrefix = isRoot ? '' : prefix + (isLast ? '    ' : '│   ');
    
    lines.push(currentPrefix + connector + name);
    
    if (subtree !== null) {
      lines.push(...formatTree(subtree, nextPrefix, false));
    }
  });
  
  return lines.join('\n');
}

module.exports = {
  generateFolderStructure
};