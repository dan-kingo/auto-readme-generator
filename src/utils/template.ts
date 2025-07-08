import { ProjectInfo, Config } from '../types';

export async function generateReadmeContent(projectInfo: ProjectInfo, config: Config): Promise<string> {
  const sections: string[] = [];
  
  // Title and Description
  sections.push(`# ${projectInfo.projectName}`);
  
  if (projectInfo.description) {
    sections.push(`\n${projectInfo.description}`);
  }
  
  // Project Structure Overview (if multi-app)
  if (projectInfo.projectStructure && projectInfo.projectStructure.applications.length > 1) {
    sections.push('\n## 🏗️ Project Structure');
    sections.push('\n```');
    sections.push(`${projectInfo.projectName}/`);
    
    projectInfo.projectStructure.applications.forEach(app => {
      if (app.path !== '.') {
        const comment = app.framework ? `# ${app.framework} ${app.type}` : `# ${app.type}`;
        sections.push(`├── ${app.path}/`.padEnd(30) + comment);
      }
    });
    
    sections.push('└── README.md                  # This file');
    sections.push('```');
  }
  
  // Applications Overview
  if (projectInfo.projectStructure && projectInfo.projectStructure.applications.length > 0) {
    sections.push('\n## 📱 Applications Overview');
    
    projectInfo.projectStructure.applications.forEach((app, index) => {
      const appNumber = projectInfo.projectStructure!.applications.length > 1 ? `${index + 1}. ` : '';
      const appTitle = app.path === '.' ? projectInfo.projectName : app.name;
      
      sections.push(`\n### ${appNumber}**${appTitle}** (${app.framework})`);
      sections.push(app.description);
      
      if (app.features.length > 0) {
        sections.push('\n**Features:**');
        app.features.forEach(feature => {
          sections.push(`- ${feature}`);
        });
      }
    });
  }
  
  // Screenshots
  if (projectInfo.screenshots && projectInfo.screenshots.length > 0) {
    sections.push('\n## 📸 Screenshots');
    projectInfo.screenshots.forEach(screenshot => {
      sections.push(`\n![${screenshot.name}](${screenshot.path})`);
    });
  }
  
  // Quick Start Section
  sections.push('\n## 🚀 Quick Start');
  
  // Prerequisites
  sections.push('\n### Prerequisites');
  sections.push('\nBefore you begin, ensure you have the following installed:');
  
  if (projectInfo.projectStructure) {
    const techs = projectInfo.projectStructure.mainTechnologies;
    
    if (techs.includes('Node.js') || projectInfo.packageInfo) {
      sections.push('- [Node.js](https://nodejs.org/) (v18 or higher)');
      sections.push('- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)');
    }
    
    if (projectInfo.projectStructure.databases.includes('MongoDB')) {
      sections.push('- [MongoDB](https://www.mongodb.com/) (local or Atlas)');
    }
    
    if (projectInfo.projectStructure.databases.includes('PostgreSQL')) {
      sections.push('- [PostgreSQL](https://www.postgresql.org/)');
    }
    
    if (projectInfo.projectStructure.hasMobile) {
      sections.push('- [Expo CLI](https://expo.dev/) (for mobile app)');
    }
    
    if (techs.includes('Docker')) {
      sections.push('- [Docker](https://www.docker.com/)');
    }
    
    sections.push('- Git');
  } else {
    sections.push('- Check the project requirements in the documentation');
  }
  
  // Installation Steps
  sections.push('\n### Installation');
  
  if (projectInfo.gitUrl) {
    sections.push(`\n1. **Clone the Repository**
\`\`\`bash
git clone ${projectInfo.gitUrl}
cd ${projectInfo.projectName}
\`\`\``);
  }
  
  // Setup for each application
  if (projectInfo.projectStructure && projectInfo.projectStructure.applications.length > 1) {
    projectInfo.projectStructure.applications.forEach((app, index) => {
      const stepNumber = projectInfo.gitUrl ? index + 2 : index + 1;
      const appTitle = app.path === '.' ? 'Root Application' : `${app.name.charAt(0).toUpperCase() + app.name.slice(1)} Setup`;
      
      sections.push(`\n### ${stepNumber}. ${appTitle}`);
      sections.push('```bash');
      
      if (app.path !== '.') {
        sections.push(`cd ${app.path}`);
        sections.push('');
      }
      
      sections.push('# Install dependencies');
      sections.push('npm install');
      sections.push('');
      
      // Environment setup
      sections.push('# Create environment file');
      sections.push('cp .env.example .env');
      sections.push('');
      
      // Add specific setup instructions based on app type
      if (app.type === 'backend') {
        sections.push('# Edit .env with your configuration:');
        if (projectInfo.projectStructure!.databases.includes('MongoDB')) {
          sections.push('# - MongoDB connection string');
        }
        if (app.features.some(f => f.includes('Cloudinary'))) {
          sections.push('# - Cloudinary credentials (optional)');
        }
        if (app.features.some(f => f.includes('Authentication'))) {
          sections.push('# - JWT secret');
        }
        sections.push('');
        
        // Seeding
        if (app.packageInfo?.scripts?.['seed:admin'] || app.packageInfo?.scripts?.seed) {
          sections.push('# Seed admin user (optional)');
          sections.push('npm run seed:admin');
          sections.push('');
        }
        
        // Start command
        const startCmd = app.packageInfo?.scripts?.dev || app.packageInfo?.scripts?.start || 'npm run dev';
        sections.push('# Start development server');
        sections.push(startCmd.startsWith('npm') ? startCmd : `npm run ${startCmd}`);
      } else if (app.type === 'frontend' || app.type === 'admin' || app.type === 'provider') {
        sections.push('# Edit .env:');
        sections.push('VITE_API_URL=http://localhost:3000/api');
        sections.push('');
        sections.push('# Start development server');
        sections.push('npm run dev');
      } else if (app.type === 'mobile') {
        sections.push('# Update API URL in src/services/api.ts');
        sections.push('# Change API_BASE_URL to your local IP:');
        sections.push('# const API_BASE_URL = \'http://YOUR_LOCAL_IP:3000/api\'');
        sections.push('');
        sections.push('# Start Expo development server');
        sections.push('npm start');
        sections.push('');
        sections.push('# Scan QR code with Expo Go app or run on simulator');
      }
      
      sections.push('```');
      
      // Add access information
      if (app.type === 'backend') {
        sections.push('\n**API Server:** http://localhost:3000');
      } else if (app.type === 'frontend') {
        sections.push('\n**Access:** http://localhost:3001');
      } else if (app.type === 'admin') {
        sections.push('\n**Access:** http://localhost:3002');
        sections.push('**Default Admin Login:**');
        sections.push('- Email: admin@example.com');
        sections.push('- Password: admin123');
      }
    });
  } else {
    // Single application setup
    const stepNumber = projectInfo.gitUrl ? 2 : 1;
    sections.push(`\n${stepNumber}. **Install Dependencies**
\`\`\`bash
npm install
\`\`\``);
    
    sections.push(`\n${stepNumber + 1}. **Environment Setup**
\`\`\`bash
# Copy environment variables
cp .env.example .env

# Edit the .env file with your configuration
nano .env
\`\`\``);
    
    sections.push(`\n${stepNumber + 2}. **Start Development Server**
\`\`\`bash
npm run dev
\`\`\``);
  }
  
  // Detailed Folder Structure
  if (projectInfo.folderStructure) {
    sections.push('\n## 📁 Detailed Folder Structure');
    
    if (projectInfo.projectStructure && projectInfo.projectStructure.applications.length > 1) {
      projectInfo.projectStructure.applications.forEach(app => {
        if (app.path !== '.') {
          sections.push(`\n### ${app.name.charAt(0).toUpperCase() + app.name.slice(1)} (\`/${app.path}\`)`);
          sections.push('```');
          // You could add specific folder structure for each app here
          sections.push(`${app.path}/`);
          sections.push('├── src/                     # Source code');
          sections.push('├── package.json             # Dependencies and scripts');
          sections.push('├── .env.example             # Environment variables template');
          sections.push('└── README.md                # Application documentation');
          sections.push('```');
        }
      });
    } else {
      sections.push('```');
      sections.push(projectInfo.folderStructure);
      sections.push('```');
    }
  }
  
  // Development Commands
  if (projectInfo.packageInfo && projectInfo.packageInfo.scripts) {
    sections.push('\n## 🔧 Development Commands');
    
    if (projectInfo.projectStructure && projectInfo.projectStructure.applications.length > 1) {
      projectInfo.projectStructure.applications.forEach(app => {
        if (app.packageInfo?.scripts) {
          sections.push(`\n### ${app.name.charAt(0).toUpperCase() + app.name.slice(1)}`);
          
          const scripts = app.packageInfo.scripts;
          if (scripts.dev) sections.push(`\`\`\`bash\nnpm run dev          # Start development server\n\`\`\``);
          if (scripts.build) sections.push(`\`\`\`bash\nnpm run build        # Build for production\n\`\`\``);
          if (scripts.start) sections.push(`\`\`\`bash\nnpm run start        # Start production server\n\`\`\``);
          if (scripts.test) sections.push(`\`\`\`bash\nnpm test             # Run tests\n\`\`\``);
          if (scripts.lint) sections.push(`\`\`\`bash\nnpm run lint         # Run linting\n\`\`\``);
        }
      });
    } else {
      const scripts = projectInfo.packageInfo.scripts;
      Object.entries(scripts).forEach(([script, command]) => {
        sections.push(`\`\`\`bash\nnpm run ${script.padEnd(12)} # ${command}\n\`\`\``);
      });
    }
  }
  
  // Technology Stack
  if (projectInfo.projectStructure) {
    sections.push('\n## 🛠️ Technology Stack');
    
    if (projectInfo.projectStructure.mainTechnologies.length > 0) {
      sections.push('\n**Core Technologies:**');
      projectInfo.projectStructure.mainTechnologies.forEach(tech => {
        sections.push(`- ${tech}`);
      });
    }
    
    if (projectInfo.projectStructure.databases.length > 0) {
      sections.push('\n**Databases:**');
      projectInfo.projectStructure.databases.forEach(db => {
        sections.push(`- ${db}`);
      });
    }
    
    const frameworks = [...new Set(projectInfo.projectStructure.applications.map(app => app.framework))];
    if (frameworks.length > 0 && !frameworks.includes('Unknown')) {
      sections.push('\n**Frameworks:**');
      frameworks.forEach(framework => {
        sections.push(`- ${framework}`);
      });
    }
  }
  
  // Contributing
  if (config.features.includes('contributingGuide')) {
    sections.push('\n## 🤝 Contributing');
    sections.push(`
1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request`);
  }
  
  // License
  sections.push(`\n## 📄 License`);
  sections.push(`\nThis project is licensed under the ${projectInfo.license} License - see the [LICENSE](LICENSE) file for details.`);
  
  // Support section
  sections.push('\n## 🆘 Support');
  sections.push('\nFor support and questions:');
  if (projectInfo.gitUrl) {
    const repoUrl = projectInfo.gitUrl.replace('.git', '');
    sections.push(`- 📧 **Issues**: [GitHub Issues](${repoUrl}/issues)`);
    sections.push(`- 💬 **Discussions**: [GitHub Discussions](${repoUrl}/discussions)`);
  }
  sections.push('- 📖 **Documentation**: [Project Wiki]');
  
  // Acknowledgments
  sections.push(`\n## 🙏 Acknowledgments`);
  sections.push('\n- Built with ❤️ using modern technologies');
  
  if (projectInfo.projectStructure) {
    const frameworks = [...new Set(projectInfo.projectStructure.applications.map(app => app.framework))];
    frameworks.forEach(framework => {
      if (framework !== 'Unknown') {
        sections.push(`- ${framework} community`);
      }
    });
  }
  
  sections.push('- All contributors and testers');
  sections.push('\n---');
  sections.push('\n<div align="center">');
  sections.push('  <strong>⭐ Star this repository if you find it helpful!</strong>');
  sections.push('</div>');
  
  return sections.join('\n');
}