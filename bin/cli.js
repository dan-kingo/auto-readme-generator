#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const index_1 = require("../src/index");
const config_1 = require("../src/config");
const packageJson = __importStar(require("../package.json"));
const program = new commander_1.Command();
program
    .name('auto-readme')
    .description('Automatically generate and update README.md files')
    .version(packageJson.version);
program
    .command('init')
    .description('Initialize auto-readme in your project')
    .action(async () => {
    console.log(chalk_1.default.blue('🚀 Initializing Auto README Generator...'));
    const questions = [
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
            message: 'Use AI for description generation?',
            default: true
        },
        {
            type: 'input',
            name: 'grokApiKey',
            message: 'Grok API key (required for AI features):',
            when: (answers) => answers.useAI,
            validate: (input) => input.length > 0 || 'API key is required for AI features'
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
        const answers = await inquirer_1.default.prompt(questions);
        await (0, index_1.initializeProject)(answers);
        console.log(chalk_1.default.green('✅ Auto README Generator initialized successfully!'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Error initializing project:'), error.message);
        process.exit(1);
    }
});
program
    .command('generate')
    .description('Generate README.md file')
    .option('-f, --force', 'Force regeneration even if no changes detected')
    .action(async (options) => {
    console.log(chalk_1.default.blue('📝 Generating README.md...'));
    try {
        const config = await (0, config_1.loadConfig)();
        const result = await (0, index_1.generateReadme)(config, options.force);
        if (result.updated) {
            console.log(chalk_1.default.green('✅ README.md generated successfully!'));
        }
        else {
            console.log(chalk_1.default.yellow('⚡ No changes detected, README.md is up to date'));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Error generating README:'), error.message);
        process.exit(1);
    }
});
program
    .command('config')
    .description('Update configuration')
    .action(async () => {
    console.log(chalk_1.default.blue('⚙️ Updating configuration...'));
    try {
        const config = await (0, config_1.loadConfig)();
        const questions = [
            {
                type: 'input',
                name: 'grokApiKey',
                message: 'Grok API key:',
                default: config.grokApiKey || ''
            },
            {
                type: 'confirm',
                name: 'useAI',
                message: 'Use AI for description generation?',
                default: config.useAI || true
            },
            {
                type: 'confirm',
                name: 'autoUpdate',
                message: 'Automatically update README on git commits?',
                default: config.autoUpdate || true
            }
        ];
        const answers = await inquirer_1.default.prompt(questions);
        await (0, index_1.updateConfig)(answers);
        console.log(chalk_1.default.green('✅ Configuration updated successfully!'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Error updating configuration:'), error.message);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=cli.js.map