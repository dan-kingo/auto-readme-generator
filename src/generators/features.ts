import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

export async function extractFeatures(projectRoot: string, useAI: boolean = false): Promise<string[]> {
  const features: string[] = [];
  
  try {
    // Get all source files
    const files = await glob('**/*.{js,ts,jsx,tsx,py,go,rs,java,php,vue,svelte}', {
      cwd: projectRoot,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '.next/**', 'coverage/**'],
      nodir: true
    });

    // Extract features from code analysis
    for (const file of files) {
      const filePath = path.join(projectRoot, file);
      
      try {
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) continue;
        
        const content = await fs.readFile(filePath, 'utf8');
        
        // Extract features from comments
        const commentFeatures = extractFromComments(content);
        features.push(...commentFeatures);
        
        // Extract features from code patterns
        const codeFeatures = extractFromCodePatterns(content, file);
        features.push(...codeFeatures);
        
        // Extract features from imports and dependencies
        const importFeatures = extractFromImports(content);
        features.push(...importFeatures);
        
        // Extract features from function/class patterns
        const structuralFeatures = extractFromStructure(content, file);
        features.push(...structuralFeatures);
        
      } catch (error) {
        console.warn(`Skipping file ${file}: ${(error as Error).message}`);
        continue;
      }
    }

    // Analyze project structure for additional features
    const structuralFeatures = await analyzeProjectStructure(projectRoot);
    features.push(...structuralFeatures);

    // Use AI to enhance feature descriptions if enabled
    if (useAI && process.env.GITHUB_TOKEN) {
      return await enhanceFeaturesWithAI(features, projectRoot);
    }

    // Remove duplicates and clean up
    const uniqueFeatures = [...new Set(features)]
      .filter(feature => feature.length > 3) // Remove very short features
      .sort();
    
    return uniqueFeatures.length > 0 ? uniqueFeatures : ['Core application functionality'];
  } catch (error) {
    console.error('Error extracting features:', (error as Error).message);
    return ['Error extracting features'];
  }
}

async function enhanceFeaturesWithAI(rawFeatures: string[], projectRoot: string): Promise<string[]> {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return rawFeatures;

    // Analyze project for context
    const packagePath = path.join(projectRoot, 'package.json');
    let projectContext = '';
    
    if (await fs.pathExists(packagePath)) {
      const pkg = await fs.readJson(packagePath);
      projectContext = `
Project: ${pkg.name || 'Unknown'}
Dependencies: ${Object.keys(pkg.dependencies || {}).slice(0, 10).join(', ')}
Scripts: ${Object.keys(pkg.scripts || {}).join(', ')}
`;
    }

    const prompt = `
You are a technical expert analyzing a software project. Based on the raw features extracted from code analysis and project context, create a refined list of 5-8 key features that best represent what this application offers to users.

Project Context:
${projectContext}

Raw Features Found:
${rawFeatures.join('\n- ')}

Instructions:
1. Combine similar features into comprehensive descriptions
2. Focus on user-facing functionality and benefits
3. Use clear, professional language
4. Prioritize the most important features
5. Make each feature sound valuable and specific
6. Return only the feature list, one per line, without bullets or numbers

Example good features:
- User authentication and secure login system
- Real-time data synchronization and updates
- Responsive design for mobile and desktop
- Advanced search and filtering capabilities
- File upload and cloud storage integration
`;

    const response = await axios.post('https://models.inference.ai.azure.com/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const enhancedFeatures = response.data.choices[0].message.content
      .trim()
      .split('\n')
      .map((f: string) => f.replace(/^[-*•]\s*/, '').trim())
      .filter((f: string) => f.length > 10);

    return enhancedFeatures.length > 0 ? enhancedFeatures : rawFeatures;
  } catch (error) {
    console.error('Error enhancing features with AI:', (error as Error).message);
    return rawFeatures;
  }
}
function extractFromComments(content: string): string[] {
  const features: string[] = [];
  
  // Enhanced comment patterns
  const commentPatterns = [
    // Standard feature comments
    /(?:\/\/|\/\*|\*|#)\s*(?:feature|feat):\s*(.+)/gi,
    // TODO comments that describe features
    /(?:\/\/|\/\*|\*|#)\s*(?:todo|fixme):\s*(?:add|implement|create)\s+(.+)/gi,
    // Description comments
    /(?:\/\/|\/\*|\*|#)\s*(?:description|desc):\s*(.+)/gi,
    // Functionality comments
    /(?:\/\/|\/\*|\*|#)\s*(?:functionality|function):\s*(.+)/gi,
    // Purpose comments
    /(?:\/\/|\/\*|\*|#)\s*(?:purpose|goal):\s*(.+)/gi
  ];
  
  commentPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const feature = match[1].trim()
        .replace(/\*\//g, '') // Remove closing comment markers
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[.!?]+$/, ''); // Remove trailing punctuation
      
      if (feature.length > 5) {
        features.push(feature);
      }
    }
  });
  
  return features;
}

function extractFromCodePatterns(content: string, filename: string): string[] {
  const features: string[] = [];
  
  // Authentication patterns
  if (/(?:login|signin|authenticate|auth|jwt|token|passport)/i.test(content)) {
    if (/(?:register|signup|createUser)/i.test(content)) {
      features.push('User Registration & Authentication');
    } else {
      features.push('User Authentication');
    }
  }
  
  // Authorization patterns
  if (/(?:authorize|permission|role|admin|guard|middleware.*auth)/i.test(content)) {
    features.push('Role-based Authorization');
  }
  
  // Database operations
  if (/(?:findOne|findMany|create|update|delete|save|insert|select|query)/i.test(content)) {
    features.push('Database Operations');
  }
  
  // CRUD operations
  const crudPatterns = [
    /(?:app|router)\.(?:get|post|put|delete|patch)/i,
    /(?:CREATE|READ|UPDATE|DELETE)/i,
    /(?:insert|select|update|delete).*(?:from|into|where)/i
  ];
  if (crudPatterns.some(pattern => pattern.test(content))) {
    features.push('CRUD Operations');
  }
  
  // File upload patterns
  if (/(?:multer|upload|file.*upload|cloudinary|s3|storage)/i.test(content)) {
    features.push('File Upload & Storage');
  }
  
  // Email functionality
  if (/(?:nodemailer|sendmail|email|smtp|mail)/i.test(content)) {
    features.push('Email Notifications');
  }
  
  // Real-time features
  if (/(?:socket\.io|websocket|real.*time|live|broadcast)/i.test(content)) {
    features.push('Real-time Communication');
  }
  
  // Payment processing
  if (/(?:stripe|paypal|payment|checkout|billing|subscription)/i.test(content)) {
    features.push('Payment Processing');
  }
  
  // API integration
  if (/(?:axios|fetch|api.*call|rest.*api|graphql)/i.test(content)) {
    features.push('External API Integration');
  }
  
  // Search functionality
  if (/(?:search|filter|query|elasticsearch|algolia)/i.test(content)) {
    features.push('Search & Filtering');
  }
  
  // Caching
  if (/(?:cache|redis|memcached|localStorage|sessionStorage)/i.test(content)) {
    features.push('Caching System');
  }
  
  // Validation
  if (/(?:validate|validation|joi|yup|schema|validator)/i.test(content)) {
    features.push('Data Validation');
  }
  
  // Testing patterns
  if (/(?:test|spec|describe|it\(|expect|assert|mock)/i.test(content)) {
    features.push('Automated Testing');
  }
  
  // Logging
  if (/(?:console\.log|logger|winston|log4js|debug|error.*log)/i.test(content)) {
    features.push('Logging & Monitoring');
  }
  
  // Internationalization
  if (/(?:i18n|internationalization|translate|locale|language)/i.test(content)) {
    features.push('Internationalization (i18n)');
  }
  
  // State management
  if (/(?:redux|zustand|recoil|context|useState|useReducer)/i.test(content)) {
    features.push('State Management');
  }
  
  // Routing
  if (/(?:router|route|navigation|navigate|link|redirect)/i.test(content)) {
    features.push('Navigation & Routing');
  }
  
  // Form handling
  if (/(?:form|input|submit|validation|formik|react.*hook.*form)/i.test(content)) {
    features.push('Form Management');
  }
  
  // Mobile-specific features
  if (filename.includes('mobile') || filename.includes('app')) {
    if (/(?:camera|photo|image.*picker|expo.*camera)/i.test(content)) {
      features.push('Camera Integration');
    }
    if (/(?:location|gps|geolocation|maps)/i.test(content)) {
      features.push('Location Services');
    }
    if (/(?:notification|push|expo.*notification)/i.test(content)) {
      features.push('Push Notifications');
    }
  }
  
  // Security features
  if (/(?:bcrypt|hash|encrypt|decrypt|security|sanitize)/i.test(content)) {
    features.push('Security & Encryption');
  }
  
  // Analytics
  if (/(?:analytics|tracking|metrics|google.*analytics|mixpanel)/i.test(content)) {
    features.push('Analytics & Tracking');
  }
  
  return features;
}

function extractFromImports(content: string): string[] {
  const features: string[] = [];
  
  // Extract import statements
  const importRegex = /(?:import|require|from)\s+['"`]([^'"`]+)['"`]/g;
  let match;
  
  const importMap: { [key: string]: string } = {
    'express': 'Express.js Server',
    'react': 'React Frontend',
    'vue': 'Vue.js Frontend',
    'angular': 'Angular Frontend',
    'next': 'Next.js Framework',
    'nuxt': 'Nuxt.js Framework',
    'mongoose': 'MongoDB Integration',
    'mysql': 'MySQL Database',
    'postgresql': 'PostgreSQL Database',
    'redis': 'Redis Caching',
    'socket.io': 'Real-time Communication',
    'passport': 'Authentication System',
    'jsonwebtoken': 'JWT Authentication',
    'bcrypt': 'Password Encryption',
    'multer': 'File Upload',
    'cloudinary': 'Cloud Storage',
    'nodemailer': 'Email Service',
    'stripe': 'Payment Processing',
    'axios': 'HTTP Client',
    'joi': 'Data Validation',
    'yup': 'Schema Validation',
    'jest': 'Testing Framework',
    'mocha': 'Testing Framework',
    'cypress': 'E2E Testing',
    'winston': 'Logging System',
    'dotenv': 'Environment Configuration',
    'cors': 'Cross-Origin Resource Sharing',
    'helmet': 'Security Middleware',
    'compression': 'Response Compression',
    'morgan': 'HTTP Request Logging',
    'body-parser': 'Request Body Parsing',
    'cookie-parser': 'Cookie Parsing',
    'express-session': 'Session Management',
    'express-rate-limit': 'Rate Limiting',
    'swagger': 'API Documentation',
    'graphql': 'GraphQL API',
    'apollo': 'Apollo GraphQL',
    'prisma': 'Database ORM',
    'typeorm': 'TypeORM Database',
    'sequelize': 'Sequelize ORM'
  };
  
  while ((match = importRegex.exec(content)) !== null) {
    const importName = match[1].toLowerCase();
    
    // Check for exact matches
    if (importMap[importName]) {
      features.push(importMap[importName]);
    }
    
    // Check for partial matches
    Object.keys(importMap).forEach(key => {
      if (importName.includes(key)) {
        features.push(importMap[key]);
      }
    });
  }
  
  return features;
}

function extractFromStructure(content: string, filename: string): string[] {
  const features: string[] = [];
  
  // Function/method patterns
  const functionPatterns = [
    /(?:function|const|let|var)\s+(\w+)/g,
    /(\w+)\s*:\s*(?:function|\([^)]*\)\s*=>)/g,
    /(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g
  ];
  
  const functionNames: string[] = [];
  functionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      functionNames.push(match[1].toLowerCase());
    }
  });
  
  // Analyze function names for features
  const functionFeatureMap: { [key: string]: string } = {
    'login': 'User Login',
    'register': 'User Registration',
    'authenticate': 'Authentication',
    'authorize': 'Authorization',
    'upload': 'File Upload',
    'download': 'File Download',
    'search': 'Search Functionality',
    'filter': 'Data Filtering',
    'sort': 'Data Sorting',
    'paginate': 'Pagination',
    'validate': 'Data Validation',
    'sanitize': 'Data Sanitization',
    'encrypt': 'Data Encryption',
    'decrypt': 'Data Decryption',
    'hash': 'Password Hashing',
    'send': 'Message/Email Sending',
    'notify': 'Notifications',
    'cache': 'Caching',
    'log': 'Logging',
    'track': 'Analytics Tracking',
    'export': 'Data Export',
    'import': 'Data Import',
    'backup': 'Data Backup',
    'restore': 'Data Restore',
    'migrate': 'Database Migration',
    'seed': 'Database Seeding'
  };
  
  functionNames.forEach(name => {
    Object.keys(functionFeatureMap).forEach(key => {
      if (name.includes(key)) {
        features.push(functionFeatureMap[key]);
      }
    });
  });
  
  // Class/component patterns
  if (/class\s+\w+/i.test(content)) {
    features.push('Object-Oriented Programming');
  }
  
  if (/(?:component|react\.component|vue\.component)/i.test(content)) {
    features.push('Component-Based Architecture');
  }
  
  return features;
}

async function analyzeProjectStructure(projectRoot: string): Promise<string[]> {
  const features: string[] = [];
  
  try {
    // Check for specific directories that indicate features
    const directories = await glob('*/', {
      cwd: projectRoot,
      ignore: ['node_modules/', '.git/', 'dist/', 'build/']
    });
    
    const directoryFeatureMap: { [key: string]: string } = {
      'auth/': 'Authentication System',
      'authentication/': 'Authentication System',
      'admin/': 'Admin Panel',
      'dashboard/': 'Dashboard Interface',
      'api/': 'API Layer',
      'components/': 'Reusable Components',
      'pages/': 'Page-Based Routing',
      'routes/': 'Custom Routing',
      'middleware/': 'Middleware Layer',
      'models/': 'Data Models',
      'controllers/': 'MVC Architecture',
      'services/': 'Service Layer',
      'utils/': 'Utility Functions',
      'helpers/': 'Helper Functions',
      'hooks/': 'Custom Hooks',
      'store/': 'State Management',
      'stores/': 'State Management',
      'context/': 'Context API',
      'providers/': 'Provider Pattern',
      'tests/': 'Testing Suite',
      'test/': 'Testing Suite',
      '__tests__/': 'Jest Testing',
      'spec/': 'Specification Tests',
      'e2e/': 'End-to-End Testing',
      'docs/': 'Documentation',
      'documentation/': 'Documentation',
      'assets/': 'Static Assets',
      'public/': 'Public Assets',
      'static/': 'Static Files',
      'uploads/': 'File Upload System',
      'storage/': 'File Storage',
      'config/': 'Configuration Management',
      'environments/': 'Environment Configuration',
      'migrations/': 'Database Migrations',
      'seeds/': 'Database Seeding',
      'fixtures/': 'Test Fixtures',
      'mocks/': 'Mock Data',
      'scripts/': 'Build Scripts',
      'tools/': 'Development Tools',
      'plugins/': 'Plugin System',
      'extensions/': 'Extension System',
      'modules/': 'Modular Architecture',
      'features/': 'Feature-Based Architecture',
      'shared/': 'Shared Components',
      'common/': 'Common Utilities',
      'core/': 'Core Functionality',
      'lib/': 'Library Code',
      'libs/': 'Libraries'
    };
    
    directories.forEach(dir => {
      const dirName = dir.toLowerCase();
      if (directoryFeatureMap[dirName]) {
        features.push(directoryFeatureMap[dirName]);
      }
    });
    
    // Check for specific files that indicate features
    const files = await glob('*', {
      cwd: projectRoot,
      nodir: true
    });
    
    const fileFeatureMap: { [key: string]: string } = {
      'dockerfile': 'Docker Containerization',
      'docker-compose.yml': 'Docker Compose',
      'docker-compose.yaml': 'Docker Compose',
      '.github': 'GitHub Actions CI/CD',
      'vercel.json': 'Vercel Deployment',
      'netlify.toml': 'Netlify Deployment',
      'jest.config.js': 'Jest Testing',
      'cypress.config.js': 'Cypress Testing',
      'tailwind.config.js': 'Tailwind CSS',
      'next.config.js': 'Next.js Configuration',
      'nuxt.config.js': 'Nuxt.js Configuration',
      'vue.config.js': 'Vue.js Configuration',
      'angular.json': 'Angular Configuration',
      'expo.json': 'Expo Configuration',
      'app.json': 'React Native Configuration',
      'metro.config.js': 'Metro Bundler',
      'babel.config.js': 'Babel Transpilation',
      'webpack.config.js': 'Webpack Bundling',
      'vite.config.js': 'Vite Build Tool',
      'rollup.config.js': 'Rollup Bundling',
      'gulpfile.js': 'Gulp Task Runner',
      'gruntfile.js': 'Grunt Task Runner',
      'makefile': 'Make Build System',
      'requirements.txt': 'Python Dependencies',
      'pipfile': 'Python Pipenv',
      'poetry.lock': 'Python Poetry',
      'go.mod': 'Go Modules',
      'cargo.toml': 'Rust Cargo',
      'composer.json': 'PHP Composer',
      'gemfile': 'Ruby Gems'
    };
    
    files.forEach(file => {
      const fileName = file.toLowerCase();
      if (fileFeatureMap[fileName]) {
        features.push(fileFeatureMap[fileName]);
      }
    });
    
  } catch (error) {
    console.error('Error analyzing project structure:', (error as Error).message);
  }
  
  return features;
}