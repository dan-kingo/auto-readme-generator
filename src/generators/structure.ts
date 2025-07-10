import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

interface TreeNode {
  [key: string]: TreeNode | null;
}

export async function generateFolderStructure(projectRoot: string): Promise<string> {
  try {
    // Get all files and directories with detailed scanning, excluding node_modules
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
        'yarn.lock',
        'pnpm-lock.yaml'
      ],
      dot: true,
      nodir: false
    });

    // Build detailed tree structure including files
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
  
  // Sort entries: directories first, then files alphabetically
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
      'src': '                     # Source code directory',
      'components': '             # Reusable UI components',
      'pages': '                  # Page components/routes',
      'api': '                    # API routes and endpoints',
      'utils': '                  # Utility functions and helpers',
      'hooks': '                  # Custom React hooks',
      'services': '               # API services and data fetching',
      'store': '                  # State management (Redux/Zustand)',
      'stores': '                 # State management stores',
      'context': '                # React Context providers',
      'providers': '              # Context and service providers',
      'types': '                  # TypeScript type definitions',
      'interfaces': '             # TypeScript interfaces',
      'models': '                 # Data models and schemas',
      'controllers': '            # Route controllers (MVC)',
      'middleware': '             # Express middleware functions',
      'middlewares': '            # Middleware directory',
      'routes': '                 # API route definitions',
      'config': '                 # Configuration files',
      'constants': '              # Application constants',
      'assets': '                 # Static assets (images, fonts)',
      'public': '                 # Public static files',
      'static': '                 # Static file serving',
      'styles': '                 # Stylesheets and CSS',
      'css': '                    # CSS stylesheets',
      'scss': '                   # SASS/SCSS stylesheets',
      'sass': '                   # SASS stylesheets',
      'less': '                   # LESS stylesheets',
      'images': '                 # Image assets',
      'icons': '                  # Icon assets and SVGs',
      'fonts': '                  # Font files',
      'media': '                  # Media files (images, videos)',
      'uploads': '                # User uploaded files',
      'tests': '                  # Test files and suites',
      'test': '                   # Test directory',
      '__tests__': '              # Jest test files',
      'spec': '                   # Specification test files',
      'e2e': '                    # End-to-end tests',
      'cypress': '                # Cypress test files',
      'docs': '                   # Documentation files',
      'documentation': '          # Project documentation',
      'scripts': '                # Build and utility scripts',
      'tools': '                  # Development tools',
      'bin': '                    # Executable scripts',
      'lib': '                    # Library code',
      'libs': '                   # External libraries',
      'shared': '                 # Shared code between modules',
      'common': '                 # Common utilities and helpers',
      'core': '                   # Core application functionality',
      'features': '               # Feature-based modules',
      'modules': '                # Application modules',
      'plugins': '                # Plugin files',
      'extensions': '             # Extension files',
      'data': '                   # Data files and fixtures',
      'fixtures': '               # Test fixtures and mock data',
      'mocks': '                  # Mock implementations',
      'seeds': '                  # Database seed files',
      'migrations': '             # Database migration files',
      'database': '               # Database related files',
      'db': '                     # Database configuration',
      'temp': '                   # Temporary files',
      'tmp': '                    # Temporary directory',
      'cache': '                  # Cache files',
      'logs': '                   # Application log files',
      'coverage': '               # Test coverage reports',
      'dist': '                   # Distribution/build output',
      'build': '                  # Build output directory',
      'out': '                    # Output files',
      '.next': '                  # Next.js build files',
      '.nuxt': '                  # Nuxt.js build files',
      '.vscode': '                # VS Code workspace settings',
      '.idea': '                  # IntelliJ IDEA settings',
      '.github': '                # GitHub workflows and templates',
      'android': '                # Android app (React Native)',
      'ios': '                    # iOS app (React Native)',
      'web': '                    # Web application',
      'mobile': '                 # Mobile application code',
      'desktop': '                # Desktop application',
      'server': '                 # Server-side code',
      'client': '                 # Client-side code',
      'frontend': '               # Frontend application',
      'backend': '                # Backend application',
      'admin': '                  # Admin panel/dashboard',
      'dashboard': '              # Dashboard interface',
      'auth': '                   # Authentication logic',
      'authentication': '         # Authentication system',
      'authorization': '          # Authorization logic',
      'security': '               # Security related code',
      'locales': '                # Internationalization files',
      'i18n': '                   # Internationalization',
      'translations': '           # Translation files',
      'lang': '                   # Language files'
    };
    
    return dirDescriptions[filename.toLowerCase()] || '';
  } else {
    // File descriptions
    const fileDescriptions: { [key: string]: string } = {
      // Package and dependency files
      'package.json': '           # Node.js dependencies and scripts',
      'package-lock.json': '      # NPM dependency lock file',
      'yarn.lock': '              # Yarn dependency lock file',
      'pnpm-lock.yaml': '         # PNPM dependency lock file',
      'composer.json': '          # PHP Composer dependencies',
      'requirements.txt': '       # Python pip dependencies',
      'Pipfile': '                # Python Pipenv dependencies',
      'poetry.lock': '            # Python Poetry lock file',
      'pyproject.toml': '         # Python project configuration',
      'go.mod': '                 # Go module dependencies',
      'go.sum': '                 # Go dependency checksums',
      'Cargo.toml': '             # Rust package configuration',
      'Cargo.lock': '             # Rust dependency lock file',
      'pom.xml': '                # Java Maven configuration',
      'build.gradle': '           # Gradle build configuration',
      'Gemfile': '                # Ruby gem dependencies',
      'Gemfile.lock': '           # Ruby gem lock file',
      
      // Configuration files
      'tsconfig.json': '          # TypeScript compiler configuration',
      'jsconfig.json': '          # JavaScript project configuration',
      'next.config.js': '         # Next.js framework configuration',
      'next.config.ts': '         # Next.js TypeScript configuration',
      'nuxt.config.js': '         # Nuxt.js framework configuration',
      'vue.config.js': '          # Vue.js project configuration',
      'angular.json': '           # Angular workspace configuration',
      'webpack.config.js': '      # Webpack bundler configuration',
      'vite.config.js': '         # Vite build tool configuration',
      'vite.config.ts': '         # Vite TypeScript configuration',
      'rollup.config.js': '       # Rollup bundler configuration',
      'babel.config.js': '        # Babel transpiler configuration',
      '.babelrc': '               # Babel configuration file',
      '.babelrc.json': '          # Babel JSON configuration',
      'eslint.config.js': '       # ESLint linting configuration',
      '.eslintrc.js': '           # ESLint configuration file',
      '.eslintrc.json': '         # ESLint JSON configuration',
      '.eslintrc.yml': '          # ESLint YAML configuration',
      'prettier.config.js': '     # Prettier code formatting config',
      '.prettierrc': '            # Prettier configuration file',
      '.prettierrc.json': '       # Prettier JSON configuration',
      'tailwind.config.js': '     # Tailwind CSS configuration',
      'tailwind.config.ts': '     # Tailwind TypeScript config',
      'postcss.config.js': '      # PostCSS configuration',
      'jest.config.js': '         # Jest testing framework config',
      'jest.config.ts': '         # Jest TypeScript configuration',
      'vitest.config.js': '       # Vitest testing configuration',
      'vitest.config.ts': '       # Vitest TypeScript config',
      'cypress.config.js': '      # Cypress E2E testing config',
      'playwright.config.js': '   # Playwright testing config',
      
      // Docker and deployment
      'Dockerfile': '             # Docker container configuration',
      'docker-compose.yml': '     # Docker Compose services',
      'docker-compose.yaml': '    # Docker Compose configuration',
      '.dockerignore': '          # Docker build ignore rules',
      'vercel.json': '            # Vercel deployment configuration',
      'netlify.toml': '           # Netlify deployment settings',
      'render.yaml': '            # Render deployment config',
      'railway.json': '           # Railway deployment config',
      'fly.toml': '               # Fly.io deployment configuration',
      
      // Mobile and native
      'app.json': '               # Expo/React Native app config',
      'expo.json': '              # Expo development configuration',
      'eas.json': '               # Expo Application Services config',
      'metro.config.js': '        # Metro bundler configuration',
      'react-native.config.js': ' # React Native configuration',
      'android/build.gradle': '   # Android build configuration',
      'ios/Podfile': '            # iOS CocoaPods dependencies',
      
      // Environment and secrets
      '.env': '                   # Environment variables',
      '.env.local': '             # Local environment overrides',
      '.env.development': '       # Development environment vars',
      '.env.production': '        # Production environment vars',
      '.env.staging': '           # Staging environment vars',
      '.env.test': '              # Test environment variables',
      '.env.example': '           # Environment variables template',
      '.env.sample': '            # Sample environment file',
      
      // Git and version control
      '.gitignore': '             # Git ignore rules',
      '.gitattributes': '         # Git file attributes',
      '.gitmodules': '            # Git submodule configuration',
      '.gitmessage': '            # Git commit message template',
      
      // Documentation
      'README.md': '              # Project documentation',
      'CHANGELOG.md': '           # Version change history',
      'CONTRIBUTING.md': '        # Contribution guidelines',
      'CODE_OF_CONDUCT.md': '     # Community guidelines',
      'SECURITY.md': '            # Security policy',
      'LICENSE': '                # Project license',
      'LICENSE.md': '             # License documentation',
      'AUTHORS': '                # Project authors',
      'CONTRIBUTORS.md': '        # Contributors list',
      'ROADMAP.md': '             # Project roadmap',
      'TODO.md': '                # Todo list',
      'NOTES.md': '               # Development notes',
      
      // Entry points and main files
      'index.js': '               # Main JavaScript entry point',
      'index.ts': '               # Main TypeScript entry point',
      'main.js': '                # Application main file',
      'main.ts': '                # TypeScript main file',
      'app.js': '                 # Application entry point',
      'app.ts': '                 # TypeScript app entry',
      'server.js': '              # Server entry point',
      'server.ts': '              # TypeScript server entry',
      'index.html': '             # HTML entry point',
      'App.jsx': '                # Main React component',
      'App.tsx': '                # Main React TypeScript component',
      'App.vue': '                # Main Vue.js component',
      '_app.js': '                # Next.js custom App component',
      '_app.tsx': '               # Next.js TypeScript App',
      '_document.js': '           # Next.js custom Document',
      '_document.tsx': '          # Next.js TypeScript Document',
      
      // Styling files
      'global.css': '             # Global stylesheet',
      'globals.css': '            # Global CSS styles',
      'styles.css': '             # Main stylesheet',
      'index.css': '              # Main CSS entry point',
      'style.css': '              # General stylesheet',
      'main.css': '               # Main CSS file',
      'app.css': '                # Application styles',
      'reset.css': '              # CSS reset styles',
      'normalize.css': '          # CSS normalization',
      'variables.css': '          # CSS custom properties',
      'theme.css': '              # Theme styles',
      
      // Build and automation
      'Makefile': '               # Build automation rules',
      'CMakeLists.txt': '         # CMake build configuration',
      'gulpfile.js': '            # Gulp task runner',
      'Gruntfile.js': '           # Grunt task runner',
      'rakefile': '               # Ruby Rake tasks',
      'build.sh': '               # Build shell script',
      'deploy.sh': '              # Deployment script',
      'start.sh': '               # Startup script',
      'install.sh': '             # Installation script',
      
      // IDE and editor
      '.editorconfig': '          # Editor configuration',
      '.vscode/settings.json': '  # VS Code workspace settings',
      '.vscode/launch.json': '    # VS Code debug configuration',
      '.vscode/tasks.json': '     # VS Code task configuration',
      '.vscode/extensions.json': '# VS Code recommended extensions',
      
      // CI/CD and automation
      '.github/workflows/ci.yml': '# GitHub Actions CI workflow',
      '.github/workflows/deploy.yml': '# GitHub Actions deployment',
      '.travis.yml': '            # Travis CI configuration',
      '.circleci/config.yml': '   # CircleCI configuration',
      'azure-pipelines.yml': '    # Azure DevOps pipelines',
      'bitbucket-pipelines.yml': '# Bitbucket Pipelines config',
      'jenkins.yml': '            # Jenkins pipeline config',
      
      // Database
      'schema.sql': '             # Database schema',
      'seed.sql': '               # Database seed data',
      'init.sql': '               # Database initialization',
      'migrate.sql': '            # Database migration',
      'database.db': '            # SQLite database file',
      'db.json': '                # JSON database file',
      
      // API and data
      'openapi.yml': '            # OpenAPI/Swagger specification',
      'swagger.json': '           # Swagger API documentation',
      'graphql.schema': '         # GraphQL schema definition',
      'schema.graphql': '         # GraphQL schema file',
      'api.json': '               # API configuration',
      'routes.json': '            # Route definitions',
      'endpoints.json': '         # API endpoints configuration',
      
      // Logs and temporary
      'error.log': '              # Error log file',
      'access.log': '             # Access log file',
      'debug.log': '              # Debug log file',
      'app.log': '                # Application log file'
    };
    
    // Check for exact filename match first
    if (fileDescriptions[filename]) {
      return fileDescriptions[filename];
    }
    
    // Check for extension-based descriptions
    const ext = path.extname(filename).toLowerCase();
    const extensionDescriptions: { [key: string]: string } = {
      // Programming languages
      '.js': '                    # JavaScript source file',
      '.mjs': '                   # ES6 JavaScript module',
      '.cjs': '                   # CommonJS JavaScript file',
      '.ts': '                    # TypeScript source file',
      '.tsx': '                   # TypeScript React component',
      '.jsx': '                   # JavaScript React component',
      '.vue': '                   # Vue.js single file component',
      '.svelte': '                # Svelte component file',
      '.py': '                    # Python script',
      '.pyw': '                   # Python Windows script',
      '.go': '                    # Go source file',
      '.rs': '                    # Rust source file',
      '.java': '                  # Java source file',
      '.kt': '                    # Kotlin source file',
      '.scala': '                 # Scala source file',
      '.php': '                   # PHP script',
      '.rb': '                    # Ruby script',
      '.swift': '                 # Swift source file',
      '.dart': '                  # Dart source file',
      '.c': '                     # C source file',
      '.cpp': '                   # C++ source file',
      '.cc': '                    # C++ source file',
      '.cxx': '                   # C++ source file',
      '.h': '                     # C/C++ header file',
      '.hpp': '                   # C++ header file',
      '.cs': '                    # C# source file',
      '.vb': '                    # Visual Basic file',
      '.fs': '                    # F# source file',
      '.clj': '                   # Clojure source file',
      '.ex': '                    # Elixir source file',
      '.exs': '                   # Elixir script file',
      '.erl': '                   # Erlang source file',
      '.hs': '                    # Haskell source file',
      '.ml': '                    # OCaml source file',
      '.r': '                     # R script file',
      '.m': '                     # Objective-C source file',
      '.mm': '                    # Objective-C++ source file',
      
      // Styling and markup
      '.css': '                   # Cascading Style Sheet',
      '.scss': '                  # SASS stylesheet',
      '.sass': '                  # SASS stylesheet (indented)',
      '.less': '                  # LESS stylesheet',
      '.styl': '                  # Stylus stylesheet',
      '.html': '                  # HTML markup file',
      '.htm': '                   # HTML markup file',
      '.xhtml': '                 # XHTML markup file',
      '.xml': '                   # XML data file',
      '.svg': '                   # Scalable Vector Graphics',
      '.ejs': '                   # Embedded JavaScript template',
      '.hbs': '                   # Handlebars template',
      '.mustache': '              # Mustache template',
      '.pug': '                   # Pug template engine',
      '.jade': '                  # Jade template (deprecated)',
      '.twig': '                  # Twig template engine',
      '.liquid': '                # Liquid template engine',
      
      // Data and configuration
      '.json': '                  # JSON data file',
      '.json5': '                 # JSON5 data file',
      '.jsonc': '                 # JSON with comments',
      '.yaml': '                  # YAML configuration file',
      '.yml': '                   # YAML configuration file',
      '.toml': '                  # TOML configuration file',
      '.ini': '                   # INI configuration file',
      '.conf': '                  # Configuration file',
      '.config': '                # Configuration file',
      '.properties': '            # Properties configuration',
      '.env': '                   # Environment variables file',
      '.dotenv': '                # Environment variables file',
      
      // Documentation and text
      '.md': '                    # Markdown documentation',
      '.markdown': '              # Markdown documentation',
      '.mdx': '                   # MDX (Markdown + JSX)',
      '.txt': '                   # Plain text file',
      '.rtf': '                   # Rich Text Format',
      '.pdf': '                   # PDF document',
      '.doc': '                   # Microsoft Word document',
      '.docx': '                  # Microsoft Word document',
      '.odt': '                   # OpenDocument text',
      '.tex': '                   # LaTeX document',
      '.rst': '                   # reStructuredText',
      '.asciidoc': '              # AsciiDoc documentation',
      '.org': '                   # Org-mode document',
      
      // Images and media
      '.png': '                   # PNG image file',
      '.jpg': '                   # JPEG image file',
      '.jpeg': '                  # JPEG image file',
      '.gif': '                   # GIF image file',
      '.webp': '                  # WebP image file',
      '.bmp': '                   # Bitmap image file',
      '.tiff': '                  # TIFF image file',
      '.tif': '                   # TIFF image file',
      '.ico': '                   # Icon file',
      '.icns': '                  # macOS icon file',
      '.svg': '                   # Scalable Vector Graphics',
      '.mp4': '                   # MP4 video file',
      '.avi': '                   # AVI video file',
      '.mov': '                   # QuickTime video file',
      '.wmv': '                   # Windows Media Video',
      '.flv': '                   # Flash Video file',
      '.webm': '                  # WebM video file',
      '.mp3': '                   # MP3 audio file',
      '.wav': '                   # WAV audio file',
      '.flac': '                  # FLAC audio file',
      '.aac': '                   # AAC audio file',
      '.ogg': '                   # OGG audio file',
      
      // Fonts
      '.ttf': '                   # TrueType font file',
      '.otf': '                   # OpenType font file',
      '.woff': '                  # Web Open Font Format',
      '.woff2': '                 # Web Open Font Format 2',
      '.eot': '                   # Embedded OpenType font',
      
      // Archives and packages
      '.zip': '                   # ZIP archive file',
      '.rar': '                   # RAR archive file',
      '.7z': '                    # 7-Zip archive file',
      '.tar': '                   # TAR archive file',
      '.gz': '                    # Gzip compressed file',
      '.bz2': '                   # Bzip2 compressed file',
      '.xz': '                    # XZ compressed file',
      '.deb': '                   # Debian package file',
      '.rpm': '                   # RPM package file',
      '.dmg': '                   # macOS disk image',
      '.pkg': '                   # macOS package file',
      '.msi': '                   # Windows installer package',
      '.exe': '                   # Windows executable',
      '.app': '                   # macOS application bundle',
      
      // Database files
      '.db': '                    # Database file',
      '.sqlite': '                # SQLite database file',
      '.sqlite3': '               # SQLite3 database file',
      '.sql': '                   # SQL script file',
      '.mdb': '                   # Microsoft Access database',
      '.accdb': '                 # Microsoft Access database',
      
      // Scripts and executables
      '.sh': '                    # Shell script (Unix/Linux)',
      '.bash': '                  # Bash shell script',
      '.zsh': '                   # Zsh shell script',
      '.fish': '                  # Fish shell script',
      '.bat': '                   # Batch script (Windows)',
      '.cmd': '                   # Command script (Windows)',
      '.ps1': '                   # PowerShell script',
      '.psm1': '                  # PowerShell module',
      '.vbs': '                   # VBScript file',
      '.applescript': '           # AppleScript file',
      
      // Log files
      '.log': '                   # Log file',
      '.out': '                   # Output log file',
      '.err': '                   # Error log file',
      
      // Temporary and cache
      '.tmp': '                   # Temporary file',
      '.temp': '                  # Temporary file',
      '.cache': '                 # Cache file',
      '.bak': '                   # Backup file',
      '.backup': '                # Backup file',
      '.old': '                   # Old version file',
      '.orig': '                  # Original file backup',
      '.swp': '                   # Vim swap file',
      '.swo': '                   # Vim swap file',
      
      // Certificates and keys
      '.pem': '                   # PEM certificate file',
      '.crt': '                   # Certificate file',
      '.cer': '                   # Certificate file',
      '.key': '                   # Private key file',
      '.pub': '                   # Public key file',
      '.p12': '                   # PKCS#12 certificate',
      '.pfx': '                   # PKCS#12 certificate',
      '.jks': '                   # Java KeyStore file',
      
      // Version control
      '.patch': '                 # Git patch file',
      '.diff': '                  # Diff file',
      
      // Miscellaneous
      '.lock': '                  # Lock file',
      '.pid': '                   # Process ID file',
      '.sock': '                  # Unix socket file',
      '.fifo': '                  # Named pipe file',
      '.link': '                  # Symbolic link file'
    };
    
    return extensionDescriptions[ext] || '';
  }
}