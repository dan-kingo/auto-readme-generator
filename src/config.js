const fs = require('fs-extra');
const path = require('path');

const CONFIG_FILE = '.autoreadme.json';

async function loadConfig() {
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  
  try {
    if (await fs.pathExists(configPath)) {
      return await fs.readJson(configPath);
    }
  } catch (error) {
    console.warn('Failed to load config file, using defaults');
  }
  
  return getDefaultConfig();
}

async function saveConfig(config) {
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  await fs.writeJson(configPath, config, { spaces: 2 });
}

function getDefaultConfig() {
  return {
    projectName: '',
    description: '',
    useAI: true,
    grokApiKey: '',
    features: [
      'folderStructure',
      'featureExtraction',
      'apiRoutes',
      'screenshots',
      'installCommands',
      'contributingGuide'
    ],
    license: 'MIT',
    autoUpdate: true,
    lastChecksum: ''
  };
}

module.exports = {
  loadConfig,
  saveConfig,
  getDefaultConfig
};