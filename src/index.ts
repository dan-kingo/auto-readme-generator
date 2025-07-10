import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';
import { saveConfig, loadConfig } from './config';
import { generateDescription } from './generators/description';
import { generateFolderStructure } from './generators/structure';
import { getScreenshots } from './generators/screenshots';
import { analyzeProjectStructure } from './generators/projectAnalyzer';
import { setupGitHooks } from './utils/git';
import { generateReadmeContent } from './utils/template';
import { calculateChecksum } from './utils/file';
import { Config, ProjectInfo, GenerateResult } from './types';

const execAsync = promisify(exec);

export async function initializeProject(answers: Partial<Config>): Promise<void> {
  const spinner = ora('Initializing project...').start();
  
  try {
    // Save configuration
    await saveConfig(answers);
    
    // Setup git hooks if auto-update is enabled
    if (answers.autoUpdate) {
      await setupGitHooks();
    }
    
    // Generate initial README
    const config = await loadConfig();
    await generateReadme(config, true);
    
    spinner.succeed('Project initialized successfully!');
  } catch (error) {
    spinner.fail('Failed to initialize project');
    throw error;
  }
}

export async function generateReadme(config: Config, force = false): Promise<GenerateResult> {
  const spinner = ora('Generating README...').start();
  
  try {
    const projectRoot = process.cwd();
    const readmePath = path.join(projectRoot, 'README.md');
    
    // Check if regeneration is needed
    if (!force && await fs.pathExists(readmePath)) {
      const currentChecksum = await calculateChecksum(projectRoot);
      const lastChecksum = config.lastChecksum || '';
      
      if (currentChecksum === lastChecksum) {
        spinner.info('No changes detected');
        return { updated: false };
      }
    }
    
    // Gather project information
    const projectInfo = await gatherProjectInfo(config);
    
    // Generate README content
    const readmeContent = await generateReadmeContent(projectInfo, config);
    
    // Write README file
    await fs.writeFile(readmePath, readmeContent, 'utf8');
    
    // Update checksum in config
    const newChecksum = await calculateChecksum(projectRoot);
    await saveConfig({ ...config, lastChecksum: newChecksum });
    
    spinner.succeed('README.md generated successfully!');
    return { updated: true };
  } catch (error) {
    spinner.fail('Failed to generate README');
    throw error;
  }
}

async function gatherProjectInfo(config: Config): Promise<ProjectInfo> {
  const projectRoot = process.cwd();
  const projectName = config.projectName || path.basename(projectRoot);
  
  const info: ProjectInfo = {
    projectName,
    description: config.description || '',
    features: config.features || [],
    license: config.license || 'MIT',
    projectStructure: undefined
  };
  
  // Generate AI description if enabled and no manual description
  const githubToken = process.env.GITHUB_TOKEN || config.grokApiKey;
  if (config.useAI && !config.description && githubToken) {
    try {
      info.description = await generateDescription(projectRoot, githubToken);
    } catch (error) {
      console.warn(chalk.yellow('⚠️ Failed to generate AI description:', (error as Error).message));
    }
  }
  
  // Generate folder structure
  if (config.features.includes('folderStructure')) {
    info.folderStructure = await generateFolderStructure(projectRoot);
  }
  
  // Analyze project structure
  if (config.features.includes('featureExtraction') || config.features.includes('apiRoutes')) {
    info.projectStructure = await analyzeProjectStructure(projectRoot);
  }
  
  // Get screenshots
  if (config.features.includes('screenshots')) {
    info.screenshots = await getScreenshots(projectRoot);
  }
  
  // Get package.json info
  const packagePath = path.join(projectRoot, 'package.json');
  if (await fs.pathExists(packagePath)) {
    info.packageInfo = await fs.readJson(packagePath);
  }
  
  // Get git repository info
  try {
    const { stdout: gitUrl } = await execAsync('git config --get remote.origin.url');
    info.gitUrl = gitUrl.trim();
  } catch (error) {
    // Git not initialized or no remote
  }
  
  return info;
}

export async function updateConfig(newConfig: Partial<Config>): Promise<void> {
  const currentConfig = await loadConfig();
  const updatedConfig = { ...currentConfig, ...newConfig };
  await saveConfig(updatedConfig);
}