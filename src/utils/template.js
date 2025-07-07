async function generateReadmeContent(projectInfo, config) {
  const sections = [];
  
  // Title
  sections.push(`# ${projectInfo.projectName}`);
  
  // Description
  if (projectInfo.description) {
    sections.push(`\n${projectInfo.description}`);
  }
  
  // Screenshots
  if (projectInfo.screenshots && projectInfo.screenshots.length > 0) {
    sections.push('\n## Screenshots');
    projectInfo.screenshots.forEach(screenshot => {
      sections.push(`\n![${screenshot.name}](${screenshot.path})`);
    });
  }
  
  // Features
  if (projectInfo.extractedFeatures && projectInfo.extractedFeatures.length > 0) {
    sections.push('\n## Features');
    projectInfo.extractedFeatures.forEach(feature => {
      sections.push(`- ${feature}`);
    });
  }
  
  // API Routes
  if (projectInfo.apiRoutes) {
    sections.push('\n## API Endpoints');
    Object.entries(projectInfo.apiRoutes).forEach(([method, routes]) => {
      sections.push(`\n### ${method} Routes`);
      routes.forEach(route => {
        sections.push(`- \`${method} ${route.path}\``);
        
        // Add example if it's a common route
        if (route.path.includes('/api/')) {
          sections.push(`  \`\`\`bash
  curl -X ${method} http://localhost:3000${route.path}
  \`\`\``);
        }
      });
    });
  }
  
  // Folder Structure
  if (projectInfo.folderStructure) {
    sections.push('\n## Project Structure');
    sections.push('```');
    sections.push(projectInfo.folderStructure);
    sections.push('```');
  }
  
  // Installation
  if (projectInfo.packageInfo) {
    sections.push('\n## Installation');
    
    if (projectInfo.gitUrl) {
      sections.push(`\n1. Clone the repository:
\`\`\`bash
git clone ${projectInfo.gitUrl}
\`\`\``);
      
      sections.push(`\n2. Navigate to the project directory:
\`\`\`bash
cd ${projectInfo.projectName}
\`\`\``);
    }
    
    sections.push(`\n3. Install dependencies:
\`\`\`bash
npm install
\`\`\``);
    
    // Add available scripts
    if (projectInfo.packageInfo.scripts) {
      sections.push('\n## Available Scripts');
      Object.entries(projectInfo.packageInfo.scripts).forEach(([script, command]) => {
        sections.push(`\n### \`npm run ${script}\`
\`\`\`bash
${command}
\`\`\``);
      });
    }
  }
  
  // Usage
  sections.push('\n## Usage');
  if (projectInfo.packageInfo && projectInfo.packageInfo.scripts.start) {
    sections.push(`\n1. Start the application:
\`\`\`bash
npm start
\`\`\``);
    
    sections.push(`\n2. Open your browser and navigate to \`http://localhost:3000\``);
  } else if (projectInfo.packageInfo && projectInfo.packageInfo.scripts.dev) {
    sections.push(`\n1. Start the development server:
\`\`\`bash
npm run dev
\`\`\``);
    
    sections.push(`\n2. Open your browser and navigate to \`http://localhost:3000\``);
  }
  
  // Contributing
  if (config.features.includes('contributingGuide')) {
    sections.push('\n## Contributing');
    sections.push(`
1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request`);
  }
  
  // License
  sections.push(`\n## License`);
  sections.push(`\nThis project is licensed under the ${projectInfo.license} License - see the [LICENSE](LICENSE) file for details.`);
  
  // Acknowledgments
  sections.push(`\n## Acknowledgments`);
  sections.push(`\n- Built with ❤️ using modern technologies
- README generated with [Auto README Generator](https://github.com/yourusername/auto-readme-generator)`);
  
  return sections.join('\n');
}

module.exports = {
  generateReadmeContent
};