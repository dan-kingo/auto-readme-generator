import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ProjectAnalysis } from '../types';

export async function generateDescription(projectRoot: string, useAI: boolean = true): Promise<string> {
  try {
    // Use GitHub token for AI features
    const token = process.env.GITHUB_TOKEN;
    
    if (!useAI || !token) {
      console.warn('No GitHub token available for AI features or AI disabled');
      return 'A modern application built with cutting-edge technologies.';
    }

    // Analyze project files to understand what it does
    const projectInfo = await analyzeProject(projectRoot);
    
    const prompt = `
You are an expert technical writer. Based on the following project analysis, create a compelling and professional project description (2-3 sentences) that clearly explains what this application does and its main value proposition:

Project Name: ${projectInfo.name}
Primary Language: ${projectInfo.language}
Framework: ${projectInfo.framework}
Available Scripts: ${Object.keys(projectInfo.scripts).join(', ')}
Key Files Found: ${projectInfo.keyFiles.join(', ')}
Main Dependencies: ${projectInfo.dependencies.slice(0, 8).join(', ')}

Create a description that:
1. Clearly states what the application does
2. Highlights its main purpose and target users
3. Mentions key technologies used
4. Sounds professional and engaging

Focus on the application's functionality and benefits, not just the technologies used.
`;

    // Use GitHub token to access GitHub Models API (free tier)
    const response = await axios.post('https://models.inference.ai.azure.com/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical writer who creates compelling, clear, and professional project descriptions for README files. Focus on what the application does and its value to users, not just the technical stack.'
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
    return 'A modern application built with cutting-edge technologies and best practices.';
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