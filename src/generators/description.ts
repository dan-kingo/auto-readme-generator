import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectAnalysis } from '../types';

export async function generateDescription(projectRoot: string, githubToken?: string): Promise<string> {
  try {
    // Use hardcoded GitHub token if not provided
    const token = githubToken || 'gsk_your_hardcoded_github_token_here_replace_with_actual_token';

    // Analyze project files to understand what it does
    const projectInfo = await analyzeProject(projectRoot);
    
    const prompt = `
Based on the following project information, generate a concise and informative description (2-3 sentences) for this project:

Project Name: ${projectInfo.name}
Main Language: ${projectInfo.language}
Framework/Library: ${projectInfo.framework}
Package.json scripts: ${JSON.stringify(projectInfo.scripts, null, 2)}
Key files: ${projectInfo.keyFiles.join(', ')}
Dependencies: ${projectInfo.dependencies.slice(0, 10).join(', ')}

Generate a professional description that explains what this project does and its main purpose.
`;

    // Use GitHub token to access Grok API
    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'You are a technical writer specializing in creating clear, concise project descriptions for README files.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI description:', (error as Error).message);
    return 'A modern application built with cutting-edge technologies.';
  }
}

async function analyzeProject(projectRoot: string): Promise<ProjectAnalysis> {
  const info: ProjectAnalysis = {
    name: path.basename(projectRoot),
    language: 'Unknown',
    framework: 'Unknown',
    scripts: {},
    keyFiles: [],
    dependencies: []
  };

  try {
    // Check package.json
    const packagePath = path.join(projectRoot, 'package.json');
    if (await fs.pathExists(packagePath)) {
      const pkg = await fs.readJson(packagePath);
      info.name = pkg.name || info.name;
      info.scripts = pkg.scripts || {};
      info.dependencies = Object.keys(pkg.dependencies || {});
      
      // Detect framework/library
      if (info.dependencies.includes('react')) {
        info.framework = 'React';
        info.language = 'JavaScript/TypeScript';
      } else if (info.dependencies.includes('vue')) {
        info.framework = 'Vue.js';
        info.language = 'JavaScript/TypeScript';
      } else if (info.dependencies.includes('angular')) {
        info.framework = 'Angular';
        info.language = 'TypeScript';
      } else if (info.dependencies.includes('express')) {
        info.framework = 'Express.js';
        info.language = 'JavaScript/TypeScript';
      } else if (info.dependencies.includes('next')) {
        info.framework = 'Next.js';
        info.language = 'JavaScript/TypeScript';
      }
    }

    // Check for key files
    const keyFiles = [
      'index.js', 'index.ts', 'app.js', 'app.ts', 'main.js', 'main.ts',
      'server.js', 'server.ts', 'index.html', 'App.jsx', 'App.tsx'
    ];

    for (const file of keyFiles) {
      if (await fs.pathExists(path.join(projectRoot, file))) {
        info.keyFiles.push(file);
      }
    }

    // Check for Python files
    const pythonFiles = ['main.py', 'app.py', 'requirements.txt'];
    for (const file of pythonFiles) {
      if (await fs.pathExists(path.join(projectRoot, file))) {
        info.language = 'Python';
        break;
      }
    }

    // Check for Go files
    if (await fs.pathExists(path.join(projectRoot, 'go.mod'))) {
      info.language = 'Go';
    }

    // Check for Rust files
    if (await fs.pathExists(path.join(projectRoot, 'Cargo.toml'))) {
      info.language = 'Rust';
    }

  } catch (error) {
    console.error('Error analyzing project:', (error as Error).message);
  }

  return info;
}