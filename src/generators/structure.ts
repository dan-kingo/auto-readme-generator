import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

interface TreeNode {
  [key: string]: TreeNode | null;
}

export async function generateFolderStructure(projectRoot: string): Promise<string> {
  try {
    // Get all files and directories with more detailed scanning
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
        'Thumbs.db',
        'package-lock.json',
        'yarn.lock'
      ],
      dot: true,
      nodir: false
    });

    // Build detailed tree structure
    const tree = await buildDetailedTree(projectRoot, files);
    
    // Convert tree to readable format with file details
    return formatDetailedTree(tree);
  } catch (error) {
    console.error('Error generating folder structure:', (error as Error).message);
    return 'Error generating folder structure';
  }
}

async function buildDetailedTree(projectRoot: string, files: string[]): Promise<TreeNode> {
  const tree: TreeNode = {};
  
  // Sort files to ensure directories come before their contents
  const sortedFiles = files.sort((a, b) => {
    const aDepth = a.split(path.sep).length;
    const bDepth = b.split(path.sep).length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    return a.localeCompare(b);
  });
  
  for (const file of sortedFiles) {
    const parts = file.split(path.sep);
    let current = tree;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;
      
      if (!current[part]) {
        if (isLastPart) {
          // Check if it's a file or directory
          const fullPath = path.join(projectRoot, file);
          try {
            const stats = await fs.stat(fullPath);
            current[part] = stats.isDirectory() ? {} : null;
          } catch {
            current[part] = null; // Assume it's a file if we can't stat it
          }
        } else {
          current[part] = {};
        }
      }
      
      if (current[part] !== null && !isLastPart) {
        current = current[part] as TreeNode;
      }
    }
  }
  
  return tree;
}

function formatDetailedTree(tree: TreeNode, prefix = '', isRoot = true, currentPath = ''): string {
  const lines: string[] = [];
  const entries = Object.entries(tree);
  
  // Sort entries: directories first, then files
  entries.sort(([nameA, subtreeA], [nameB, subtreeB]) => {
    const aIsDir = subtreeA !== null;
    const bIsDir = subtreeB !== null;
    
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return nameA.localeCompare(nameB);
  });
  
  entries.forEach(([name, subtree], index) => {
    const isLast = index === entries.length - 1;
    const currentPrefix = isRoot ? '' : prefix;
    const connector = isLast ? '└── ' : '├── ';
    const nextPrefix = isRoot ? '' : prefix + (isLast ? '    ' : '│   ');
    
    // Add file/directory description
    const fullPath = currentPath ? `${currentPath}/${name}` : name;
    const description = getFileDescription(name, subtree !== null);
    const displayName = description ? `${name}${description}` : name;
    
    lines.push(currentPrefix + connector + displayName);
    
    if (subtree !== null) {
      const subTreeContent = formatDetailedTree(subtree, nextPrefix, false, fullPath);
      if (subTreeContent) {
        lines.push(subTreeContent);
      }
    }
  });
  
  return lines.join('\n');
}

function getFileDescription(filename: string, isDirectory: boolean): string {
  if (isDirectory) {
    // Directory descriptions
    const dirDescriptions: { [key: string]: string } = {
      'src': '                     # Source code',
      'components': '             # Reusable UI components',
      'pages': '                  # Page components',
      'api': '                    # API routes',
      'utils': '                  # Utility functions',
      'hooks': '                  # Custom React hooks',
      'services': '               # API services',
      'store': '                  # State management',
      'stores': '                 # State management',
      'types': '                  # TypeScript type definitions',
      'interfaces': '             # TypeScript interfaces',
      'models': '                 # Data models',
      'controllers': '            # Route controllers',
      'middleware': '             # Express middleware',
      'middlewares': '            # Express middleware',
      'routes': '                 # API routes',
      'config': '                 # Configuration files',
      'assets': '                 # Static assets',
      'public': '                 # Public static files',
      'styles': '                 # Stylesheets',
      'css': '                    # CSS files',
      'scss': '                   # SCSS files',
      'images': '                 # Image assets',
      'icons': '                  # Icon assets',
      'fonts': '                  # Font files',
      'tests': '                  # Test files',
      'test': '                   # Test files',
      '__tests__': '              # Jest test files',
      'spec': '                   # Specification files',
      'docs': '                   # Documentation',
      'documentation': '          # Documentation',
      'scripts': '                # Build and utility scripts',
      'tools': '                  # Development tools',
      'lib': '                    # Library code',
      'libs': '                   # Libraries',
      'shared': '                 # Shared code',
      'common': '                 # Common utilities',
      'core': '                   # Core functionality',
      'features': '               # Feature modules',
      'modules': '                # Application modules',
      'plugins': '                # Plugin files',
      'extensions': '             # Extension files',
      'data': '                   # Data files',
      'fixtures': '               # Test fixtures',
      'mocks': '                  # Mock data',
      'seeds': '                  # Database seeds',
      'migrations': '             # Database migrations',
      'uploads': '                # File uploads',
      'temp': '                   # Temporary files',
      'cache': '                  # Cache files',
      'logs': '                   # Log files',
      'coverage': '               # Test coverage reports',
      'dist': '                   # Distribution build',
      'build': '                  # Build output',
      'out': '                    # Output files',
      '.next': '                  # Next.js build files',
      '.nuxt': '                  # Nuxt.js build files',
      'node_modules': '           # Dependencies',
      '.git': '                   # Git repository',
      '.github': '                # GitHub configuration',
      '.vscode': '                # VS Code settings',
      '.idea': '                  # IntelliJ IDEA settings'
    };
    
    return dirDescriptions[filename.toLowerCase()] || '';
  } else {
    // File descriptions
    const fileDescriptions: { [key: string]: string } = {
      'package.json': '           # Dependencies and scripts',
      'package-lock.json': '      # Dependency lock file',
      'yarn.lock': '              # Yarn lock file',
      'tsconfig.json': '          # TypeScript configuration',
      'jsconfig.json': '          # JavaScript configuration',
      'next.config.js': '         # Next.js configuration',
      'nuxt.config.js': '         # Nuxt.js configuration',
      'vue.config.js': '          # Vue.js configuration',
      'angular.json': '           # Angular configuration',
      'webpack.config.js': '      # Webpack configuration',
      'vite.config.js': '         # Vite configuration',
      'vite.config.ts': '         # Vite configuration',
      'rollup.config.js': '       # Rollup configuration',
      'babel.config.js': '        # Babel configuration',
      '.babelrc': '               # Babel configuration',
      'eslint.config.js': '       # ESLint configuration',
      '.eslintrc.js': '           # ESLint configuration',
      '.eslintrc.json': '         # ESLint configuration',
      'prettier.config.js': '     # Prettier configuration',
      '.prettierrc': '            # Prettier configuration',
      'tailwind.config.js': '     # Tailwind CSS configuration',
      'postcss.config.js': '      # PostCSS configuration',
      'jest.config.js': '         # Jest testing configuration',
      'vitest.config.js': '       # Vitest configuration',
      'cypress.config.js': '      # Cypress testing configuration',
      'docker-compose.yml': '     # Docker Compose configuration',
      'docker-compose.yaml': '    # Docker Compose configuration',
      'Dockerfile': '             # Docker container configuration',
      '.dockerignore': '          # Docker ignore file',
      '.gitignore': '             # Git ignore file',
      '.gitattributes': '         # Git attributes',
      'README.md': '              # Project documentation',
      'CHANGELOG.md': '           # Change log',
      'LICENSE': '                # License file',
      'LICENSE.md': '             # License file',
      '.env': '                   # Environment variables',
      '.env.local': '             # Local environment variables',
      '.env.example': '           # Environment variables template',
      '.env.development': '       # Development environment',
      '.env.production': '        # Production environment',
      'vercel.json': '            # Vercel deployment configuration',
      'netlify.toml': '           # Netlify deployment configuration',
      'app.json': '               # Expo/React Native configuration',
      'expo.json': '              # Expo configuration',
      'metro.config.js': '        # Metro bundler configuration',
      'index.js': '               # Main entry point',
      'index.ts': '               # Main entry point',
      'main.js': '                # Main application file',
      'main.ts': '                # Main application file',
      'app.js': '                 # Application entry point',
      'app.ts': '                 # Application entry point',
      'server.js': '              # Server entry point',
      'server.ts': '              # Server entry point',
      'index.html': '             # HTML entry point',
      'App.jsx': '                # Main React component',
      'App.tsx': '                # Main React component',
      'App.vue': '                # Main Vue component',
      'global.css': '             # Global styles',
      'globals.css': '            # Global styles',
      'styles.css': '             # Main stylesheet',
      'index.css': '              # Main stylesheet',
      'style.css': '              # Stylesheet',
      'requirements.txt': '       # Python dependencies',
      'setup.py': '               # Python setup script',
      'Pipfile': '                # Python Pipenv file',
      'poetry.lock': '            # Poetry lock file',
      'pyproject.toml': '         # Python project configuration',
      'go.mod': '                 # Go module file',
      'go.sum': '                 # Go dependencies',
      'Cargo.toml': '             # Rust package configuration',
      'Cargo.lock': '             # Rust dependencies',
      'pom.xml': '                # Maven configuration',
      'build.gradle': '           # Gradle build script',
      'composer.json': '          # PHP dependencies',
      'Gemfile': '                # Ruby dependencies',
      'Makefile': '               # Build automation',
      'CMakeLists.txt': '         # CMake configuration'
    };
    
    // Check for exact filename match first
    if (fileDescriptions[filename]) {
      return fileDescriptions[filename];
    }
    
    // Check for extension-based descriptions
    const ext = path.extname(filename).toLowerCase();
    const extensionDescriptions: { [key: string]: string } = {
      '.js': '                    # JavaScript file',
      '.ts': '                    # TypeScript file',
      '.jsx': '                   # React component',
      '.tsx': '                   # React TypeScript component',
      '.vue': '                   # Vue component',
      '.py': '                    # Python script',
      '.go': '                    # Go source file',
      '.rs': '                    # Rust source file',
      '.java': '                  # Java source file',
      '.php': '                   # PHP script',
      '.rb': '                    # Ruby script',
      '.css': '                   # Stylesheet',
      '.scss': '                  # SASS stylesheet',
      '.sass': '                  # SASS stylesheet',
      '.less': '                  # LESS stylesheet',
      '.html': '                  # HTML file',
      '.htm': '                   # HTML file',
      '.xml': '                   # XML file',
      '.json': '                  # JSON data file',
      '.yaml': '                  # YAML configuration',
      '.yml': '                   # YAML configuration',
      '.toml': '                  # TOML configuration',
      '.ini': '                   # INI configuration',
      '.conf': '                  # Configuration file',
      '.config': '                # Configuration file',
      '.md': '                    # Markdown documentation',
      '.txt': '                   # Text file',
      '.log': '                   # Log file',
      '.sql': '                   # SQL script',
      '.sh': '                    # Shell script',
      '.bat': '                   # Batch script',
      '.ps1': '                   # PowerShell script',
      '.png': '                   # PNG image',
      '.jpg': '                   # JPEG image',
      '.jpeg': '                  # JPEG image',
      '.gif': '                   # GIF image',
      '.svg': '                   # SVG image',
      '.ico': '                   # Icon file',
      '.pdf': '                   # PDF document',
      '.zip': '                   # ZIP archive',
      '.tar': '                   # TAR archive',
      '.gz': '                    # Gzip archive'
    };
    
    return extensionDescriptions[ext] || '';
  }
}