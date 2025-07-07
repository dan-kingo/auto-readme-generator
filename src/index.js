const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const chalk = require('chalk');
const ora = require('ora');
const { saveConfig, loadConfig } = require('./config');
const { generateDescription } = require('./generators/description');
const { generateFolderStructure } = require('./generators/structure');
const { extractFeatures } = require('./generators/features');
const { detectRoutes } = require('./generators/routes');
const { getScreenshots } = require('./generators/screenshots');
const { setupGitHooks } = require('./utils/git');
const { generateReadmeContent } = require('./utils/template');
const { calculateChecksum } = require('./utils/file');

const execAsync = promisify(exec);

async function initializeProject(answers) {
  const spinner = ora('Initializing project...').start();
  
  try {
    // Save configuration
    await saveConfig(answers);
    
    // Setup git hooks if auto-update is enabled
    if (answers.autoUpdate) {
      await setupGitHooks();
    }
    
    // Generate initial README
    await generateReadme(answers, true);
    
    spinner.succeed('Project initialized successfully!');
  } catch (error) {
    spinner.fail('Failed to initialize project');
    throw error;
  }
}

async function generateReadme(config, force = false) {
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

async function gatherProjectInfo(config) {
  const projectRoot = process.cwd();
  const projectName = config.projectName || path.basename(projectRoot);
  
  const info = {
    projectName,
    description: config.description || '',
    features: config.features || [],
    license: config.license || 'MIT'
  };
  
  // Generate AI description if enabled and no manual description
  if (config.useAI && !config.description && config.grokApiKey) {
    try {
      info.description = await generateDescription(projectRoot, config.grokApiKey);
    } catch (error) {
      console.warn(chalk.yellow('⚠️ Failed to generate AI description:', error.message));
    }
  }
  
  // Generate folder structure
  if (config.features.includes('folderStructure')) {
    info.folderStructure = await generateFolderStructure(projectRoot);
  }
  
  // Extract features
  if (config.features.includes('featureExtraction')) {
    info.extractedFeatures = await extractFeatures(projectRoot);
  }
  
  // Detect API routes
  if (config.features.includes('apiRoutes')) {
    info.apiRoutes = await detectRoutes(projectRoot);
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

async function updateConfig(newConfig) {
  const currentConfig = await loadConfig();
  const updatedConfig = { ...currentConfig, ...newConfig };
  await saveConfig(updatedConfig);
}

module.exports = {
  initializeProject,
  generateReadme,
  updateConfig
};