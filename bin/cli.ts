#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer, { QuestionCollection } from 'inquirer';
import { initializeProject, generateReadme, updateConfig } from '../src/index';
import { loadConfig } from '../src/config';
import * as packageJson from '../package.json';

const program = new Command();

interface InitAnswers {
  projectName: string;
  description: string;
  useAI: boolean;
  grokApiKey?: string;
  features: string[];
  license: string;
  autoUpdate: boolean;
}

interface ConfigAnswers {
  grokApiKey: string;
  useAI: boolean;
  autoUpdate: boolean;
}

program
  .name('dan-readme')
  .description('Automatically generate and update README.md files')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize auto-readme in your project')
  .action(async () => {
    console.log(chalk.blue('🚀 Initializing Auto README Generator...'));
    
   const questions: QuestionCollection[] = [
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name (leave empty to use folder name):',
        default: ''
      },
      {
        type: 'input',
        name: 'description',
        message: 'Brief project description (leave empty for AI generation):',
        default: ''
      },
      {
        type: 'confirm',
        name: 'useAI',
        message: 'Use AI for description generation? (optional - requires GITHUB_TOKEN)',
        default: !!process.env.GITHUB_TOKEN
      },
      {
        type: 'checkbox',
        name: 'features',
        message: 'Which features would you like to include?',
        choices: [
          { name: 'Folder structure', value: 'folderStructure', checked: true },
          { name: 'Feature extraction', value: 'featureExtraction', checked: true },
          { name: 'API routes (if backend)', value: 'apiRoutes', checked: true },
          { name: 'Screenshots', value: 'screenshots', checked: true },
          { name: 'Installation commands', value: 'installCommands', checked: true },
          { name: 'Contributing guide', value: 'contributingGuide', checked: true }
        ]
      },
      {
        type: 'list',
        name: 'license',
        message: 'Choose a license:',
        choices: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'Custom', 'None'],
        default: 'MIT'
      },
      {
        type: 'confirm',
        name: 'autoUpdate',
        message: 'Automatically update README on git commits?',
        default: true
      }
    ];

    try {
      const answers = await inquirer.prompt<InitAnswers>(questions);
      await initializeProject(answers);
      console.log(chalk.green('✅ Auto README Generator initialized successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Error initializing project:'), (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('generate')
  .description('Generate README.md file')
  .option('-f, --force', 'Force regeneration even if no changes detected')
  .action(async (options) => {
    console.log(chalk.blue('📝 Generating README.md...'));
    
    try {
      const config = await loadConfig();
      const result = await generateReadme(config, options.force);
      
      if (result.updated) {
        console.log(chalk.green('✅ README.md generated successfully!'));
      } else {
        console.log(chalk.yellow('⚡ No changes detected, README.md is up to date'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Error generating README:'), (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Update configuration')
  .action(async () => {
    console.log(chalk.blue('⚙️ Updating configuration...'));
    
    try {
      const config = await loadConfig();
      const questions: QuestionCollection[] = [
        {
          type: 'confirm',
          name: 'useAI',
          message: 'Use AI for description generation? (requires GITHUB_TOKEN env var)',
          default: config.useAI && !!process.env.GITHUB_TOKEN
        },
        {
          type: 'confirm',
          name: 'autoUpdate',
          message: 'Automatically update README on git commits?',
          default: config.autoUpdate || true
        }
      ];

      const answers = await inquirer.prompt<ConfigAnswers>(questions);
      await updateConfig(answers);
      console.log(chalk.green('✅ Configuration updated successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Error updating configuration:'), (error as Error).message);
      process.exit(1);
    }
  });

program.parse();