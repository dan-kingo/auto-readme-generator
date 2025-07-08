export interface Config {
  projectName: string;
  description: string;
  useAI: boolean;
  grokApiKey: string;
  features: string[];
  license: string;
  autoUpdate: boolean;
  lastChecksum: string;
}

export interface ProjectInfo {
  projectName: string;
  description: string;
  features: string[];
  license: string;
  folderStructure?: string;
  projectStructure?: ProjectStructure;
  screenshots?: Screenshot[];
  packageInfo?: PackageInfo;
  gitUrl?: string;
}

export interface Screenshot {
  name: string;
  path: string;
  filename: string;
}

export interface Route {
  method: string;
  path: string;
  type: string;
  file?: string;
}

export interface RoutesByMethod {
  [method: string]: Route[];
}

export interface PackageInfo {
  name?: string;
  version?: string;
  description?: string;
  scripts?: { [key: string]: string };
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
}

export interface ProjectAnalysis {
  name: string;
  language: string;
  framework: string;
  scripts: { [key: string]: string };
  keyFiles: string[];
  dependencies: string[];
}

export interface GenerateResult {
  updated: boolean;
}

export interface ProjectStructure {
  type: string;
  applications: ApplicationInfo[];
  mainTechnologies: string[];
  hasBackend: boolean;
  hasFrontend: boolean;
  hasMobile: boolean;
  databases: string[];
  deploymentInfo: any;
}

export interface ApplicationInfo {
  name: string;
  type: 'backend' | 'frontend' | 'mobile' | 'admin' | 'provider' | 'user' | 'docs' | 'main';
  path: string;
  framework: string;
  features: string[];
  description: string;
  packageInfo?: PackageInfo;
}