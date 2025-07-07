import * as fs from 'fs-extra';
import * as path from 'path';
import { Config } from './types';

const CONFIG_FILE = '.autoreadme.json';

export async function loadConfig(): Promise<Config> {
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

export async function saveConfig(config: Partial<Config>): Promise<void> {
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  const currentConfig = await loadConfig();
  const mergedConfig = { ...currentConfig, ...config };
  await fs.writeJson(configPath, mergedConfig, { spaces: 2 });
}

export function getDefaultConfig(): Config {
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