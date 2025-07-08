import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import { ProjectStructure, ApplicationInfo } from '../types';

export async function analyzeProjectStructure(projectRoot: string): Promise<ProjectStructure> {
  const structure: ProjectStructure = {
    type: 'unknown',
    applications: [],
    mainTechnologies: [],
    hasBackend: false,
    hasFrontend: false,
    hasMobile: false,
    databases: [],
    deploymentInfo: {}
  };

  try {
    // Get all directories and key files
    const files = await glob('**/*', {
      cwd: projectRoot,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '.next/**'],
      dot: false
    });

    // Analyze directory structure
    const directories = files.filter(file => {
      const fullPath = path.join(projectRoot, file);
      try {
        return fs.statSync(fullPath).isDirectory();
      } catch {
        return false;
      }
    });

    // Detect project type and applications
    structure.applications = await detectApplications(projectRoot, directories);
    structure.type = determineProjectType(structure.applications);
    
    // Analyze technologies
    structure.mainTechnologies = await detectTechnologies(projectRoot, files);
    
    // Set flags
    structure.hasBackend = structure.applications.some(app => app.type === 'backend');
    structure.hasFrontend = structure.applications.some(app => app.type === 'frontend');
    structure.hasMobile = structure.applications.some(app => app.type === 'mobile');
    
    // Detect databases
    structure.databases = await detectDatabases(projectRoot, files);
    
    // Analyze deployment
    structure.deploymentInfo = await analyzeDeployment(projectRoot, files);

    return structure;
  } catch (error) {
    console.error('Error analyzing project structure:', (error as Error).message);
    return structure;
  }
}

async function detectApplications(projectRoot: string, directories: string[]): Promise<ApplicationInfo[]> {
  const applications: ApplicationInfo[] = [];
  
  // Common application directory patterns
  const appPatterns = [
    { pattern: /^(backend|server|api)$/i, type: 'backend' },
    { pattern: /^(frontend|client|web)$/i, type: 'frontend' },
    { pattern: /^(mobile|app|react-native)$/i, type: 'mobile' },
    { pattern: /^(admin|dashboard)$/i, type: 'admin' },
    { pattern: /^(provider|vendor).*app$/i, type: 'provider' },
    { pattern: /^(traveler|user|customer).*app$/i, type: 'user' },
    { pattern: /^(docs|documentation)$/i, type: 'docs' }
  ];

  for (const dir of directories) {
    const dirName = path.basename(dir);
    
    // Check if it's a top-level application directory
    if (!dir.includes('/')) {
      for (const { pattern, type } of appPatterns) {
        if (pattern.test(dirName)) {
          const appInfo = await analyzeApplication(projectRoot, dir, type);
          if (appInfo) {
            applications.push(appInfo);
          }
          break;
        }
      }
    }
  }

  // If no specific app directories found, analyze root as single application
  if (applications.length === 0) {
    const rootApp = await analyzeApplication(projectRoot, '.', 'main');
    if (rootApp) {
      applications.push(rootApp);
    }
  }

  return applications;
}

async function analyzeApplication(projectRoot: string, appDir: string, type: string): Promise<ApplicationInfo | null> {
  const appPath = path.join(projectRoot, appDir);
  
  try {
    const packageJsonPath = path.join(appPath, 'package.json');
    let packageInfo = null;
    
    if (await fs.pathExists(packageJsonPath)) {
      packageInfo = await fs.readJson(packageJsonPath);
    }

    const framework = await detectFramework(appPath, packageInfo);
    const features = await extractApplicationFeatures(appPath, framework);
    
    return {
      name: appDir === '.' ? path.basename(projectRoot) : appDir,
      type: type as any,
      path: appDir,
      framework,
      features,
      description: generateApplicationDescription(type, framework, features),
      packageInfo
    };
  } catch (error) {
    console.error(`Error analyzing application ${appDir}:`, (error as Error).message);
    return null;
  }
}

async function detectFramework(appPath: string, packageInfo: any): Promise<string> {
  if (!packageInfo?.dependencies && !packageInfo?.devDependencies) {
    return 'Unknown';
  }

  const deps = { ...packageInfo.dependencies, ...packageInfo.devDependencies };
  
  // Mobile frameworks
  if (deps['react-native'] || deps['expo']) return 'React Native/Expo';
  if (deps['flutter']) return 'Flutter';
  if (deps['ionic']) return 'Ionic';
  
  // Frontend frameworks
  if (deps['next']) return 'Next.js';
  if (deps['react']) return 'React';
  if (deps['vue']) return 'Vue.js';
  if (deps['angular']) return 'Angular';
  if (deps['svelte']) return 'Svelte';
  
  // Backend frameworks
  if (deps['express']) return 'Node.js/Express';
  if (deps['fastify']) return 'Node.js/Fastify';
  if (deps['koa']) return 'Node.js/Koa';
  if (deps['nestjs']) return 'NestJS';
  
  // Check for specific files
  if (await fs.pathExists(path.join(appPath, 'requirements.txt'))) return 'Python';
  if (await fs.pathExists(path.join(appPath, 'go.mod'))) return 'Go';
  if (await fs.pathExists(path.join(appPath, 'Cargo.toml'))) return 'Rust';
  if (await fs.pathExists(path.join(appPath, 'pom.xml'))) return 'Java/Maven';
  
  return 'Node.js';
}

async function extractApplicationFeatures(appPath: string, framework: string): Promise<string[]> {
  const features: string[] = [];
  
  try {
    // Check package.json for feature hints
    const packageJsonPath = path.join(appPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const pkg = await fs.readJson(packageJsonPath);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      // Authentication
      if (deps['passport'] || deps['jsonwebtoken'] || deps['auth0']) {
        features.push('Authentication & Authorization');
      }
      
      // Database
      if (deps['mongoose'] || deps['mongodb']) features.push('MongoDB Integration');
      if (deps['mysql'] || deps['mysql2']) features.push('MySQL Database');
      if (deps['pg'] || deps['postgresql']) features.push('PostgreSQL Database');
      if (deps['sqlite3']) features.push('SQLite Database');
      
      // Real-time
      if (deps['socket.io']) features.push('Real-time Communication');
      
      // File handling
      if (deps['multer'] || deps['cloudinary']) features.push('File Upload & Management');
      
      // Testing
      if (deps['jest'] || deps['mocha'] || deps['cypress']) features.push('Testing Suite');
      
      // UI/Styling
      if (deps['tailwindcss']) features.push('Tailwind CSS Styling');
      if (deps['styled-components']) features.push('Styled Components');
      if (deps['material-ui'] || deps['@mui/material']) features.push('Material-UI Components');
      
      // Mobile specific
      if (framework.includes('React Native')) {
        if (deps['@react-navigation/native']) features.push('Navigation System');
        if (deps['expo-camera']) features.push('Camera Integration');
        if (deps['expo-location']) features.push('Location Services');
      }
      
      // State management
      if (deps['redux'] || deps['zustand'] || deps['recoil']) features.push('State Management');
      
      // API
      if (deps['axios'] || deps['fetch']) features.push('API Integration');
    }
    
    // Check for specific directories/files
    const hasAuth = await fs.pathExists(path.join(appPath, 'src/auth')) || 
                   await fs.pathExists(path.join(appPath, 'auth'));
    if (hasAuth) features.push('Authentication System');
    
    const hasAPI = await fs.pathExists(path.join(appPath, 'src/api')) || 
                  await fs.pathExists(path.join(appPath, 'api'));
    if (hasAPI) features.push('API Layer');
    
    const hasComponents = await fs.pathExists(path.join(appPath, 'src/components')) || 
                         await fs.pathExists(path.join(appPath, 'components'));
    if (hasComponents) features.push('Reusable Components');
    
  } catch (error) {
    console.error('Error extracting application features:', (error as Error).message);
  }
  
  return features.length > 0 ? features : ['Core Functionality'];
}

function generateApplicationDescription(type: string, framework: string, features: string[]): string {
  const typeDescriptions = {
    backend: `${framework} API server providing backend services and data management.`,
    frontend: `${framework} web application for user interface and client-side functionality.`,
    mobile: `${framework} mobile application for iOS and Android platforms.`,
    admin: `${framework} administrative dashboard for platform management and oversight.`,
    provider: `${framework} application for service providers to manage their offerings.`,
    user: `${framework} application for end users to access and interact with services.`,
    docs: 'Documentation and guides for the project.',
    main: `${framework} application providing the core functionality of the project.`
  };
  
  return typeDescriptions[type as keyof typeof typeDescriptions] || `${framework} application.`;
}

async function detectTechnologies(projectRoot: string, files: string[]): Promise<string[]> {
  const technologies: string[] = [];
  
  // Check for technology indicators
  const techIndicators = [
    { files: ['package.json'], tech: 'Node.js' },
    { files: ['requirements.txt', 'setup.py'], tech: 'Python' },
    { files: ['go.mod'], tech: 'Go' },
    { files: ['Cargo.toml'], tech: 'Rust' },
    { files: ['pom.xml'], tech: 'Java' },
    { files: ['composer.json'], tech: 'PHP' },
    { files: ['Dockerfile'], tech: 'Docker' },
    { files: ['docker-compose.yml', 'docker-compose.yaml'], tech: 'Docker Compose' },
    { files: ['.github/workflows'], tech: 'GitHub Actions' },
    { files: ['vercel.json'], tech: 'Vercel' },
    { files: ['netlify.toml'], tech: 'Netlify' }
  ];
  
  for (const { files: techFiles, tech } of techIndicators) {
    if (techFiles.some(file => files.includes(file))) {
      technologies.push(tech);
    }
  }
  
  return technologies;
}

async function detectDatabases(projectRoot: string, files: string[]): Promise<string[]> {
  const databases: string[] = [];
  
  // Check package.json files for database dependencies
  const packageFiles = files.filter(file => file.endsWith('package.json'));
  
  for (const packageFile of packageFiles) {
    try {
      const packagePath = path.join(projectRoot, packageFile);
      const pkg = await fs.readJson(packagePath);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps['mongoose'] || deps['mongodb']) databases.push('MongoDB');
      if (deps['mysql'] || deps['mysql2']) databases.push('MySQL');
      if (deps['pg'] || deps['postgresql']) databases.push('PostgreSQL');
      if (deps['sqlite3']) databases.push('SQLite');
      if (deps['redis']) databases.push('Redis');
    } catch (error) {
      // Skip invalid package.json files
    }
  }
  
  return [...new Set(databases)];
}

async function analyzeDeployment(projectRoot: string, files: string[]): Promise<any> {
  const deployment: any = {};
  
  if (files.includes('Dockerfile')) {
    deployment.docker = true;
  }
  
  if (files.includes('docker-compose.yml') || files.includes('docker-compose.yaml')) {
    deployment.dockerCompose = true;
  }
  
  if (files.includes('vercel.json')) {
    deployment.vercel = true;
  }
  
  if (files.includes('netlify.toml')) {
    deployment.netlify = true;
  }
  
  if (files.some(file => file.includes('.github/workflows'))) {
    deployment.githubActions = true;
  }
  
  return deployment;
}

function determineProjectType(applications: ApplicationInfo[]): string {
  if (applications.length > 1) {
    const hasBackend = applications.some(app => app.type === 'backend');
    const hasFrontend = applications.some(app => app.type === 'frontend');
    const hasMobile = applications.some(app => app.type === 'mobile');
    
    if (hasBackend && hasFrontend && hasMobile) {
      return 'Full-Stack Multi-Platform';
    } else if (hasBackend && hasFrontend) {
      return 'Full-Stack Web Application';
    } else if (hasBackend && hasMobile) {
      return 'Backend + Mobile Application';
    } else {
      return 'Multi-Application Project';
    }
  } else if (applications.length === 1) {
    const app = applications[0];
    switch (app.type) {
      case 'backend': return 'Backend API';
      case 'frontend': return 'Frontend Web Application';
      case 'mobile': return 'Mobile Application';
      default: return 'Single Application';
    }
  }
  
  return 'Unknown Project Type';
}