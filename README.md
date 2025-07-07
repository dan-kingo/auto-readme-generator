# Auto README Generator

An intelligent npm package that automatically generates and updates README.md files using AI-powered descriptions, folder structure scanning, and feature extraction from your codebase.

## Features

- 🤖 **AI-Powered Descriptions** - Generate project descriptions using Grok AI
- 📁 **Folder Structure Scanning** - Automatically scan and display project structure
- 🔍 **Feature Extraction** - Extract features from code comments and patterns
- 🛣️ **API Route Detection** - Automatically detect and document API endpoints
- 📸 **Screenshot Integration** - Include screenshots from your project
- 🎣 **Git Hooks Integration** - Auto-update README on commits using Husky
- ⚙️ **Configurable Settings** - Customize generation with config files
- 📋 **Package.json Integration** - Extract scripts and dependencies
- 🎯 **Smart Change Detection** - Skip regeneration when no changes detected
- 📝 **Contributing Guide** - Generate standard contributing guidelines

## Installation

```bash
npm install -g auto-readme-generator
```

## Quick Start

1. Navigate to your project directory:
```bash
cd your-project
```

2. Initialize Auto README Generator:
```bash
auto-readme init
```

3. Generate your README:
```bash
auto-readme generate
```

## CLI Commands

### `auto-readme init`
Initialize the package in your project with interactive setup.

### `auto-readme generate`
Generate or update the README.md file.

Options:
- `-f, --force` - Force regeneration even if no changes detected

### `auto-readme config`
Update configuration settings.

## Configuration

The package creates a `.autoreadme.json` file in your project root with the following options:

```json
{
  "projectName": "Your Project Name",
  "description": "Custom description (leave empty for AI generation)",
  "useAI": true,
  "grokApiKey": "your-grok-api-key",
  "features": [
    "folderStructure",
    "featureExtraction",
    "apiRoutes",
    "screenshots",
    "installCommands",
    "contributingGuide"
  ],
  "license": "MIT",
  "autoUpdate": true
}
```

## Supported Features

### AI Description Generation
- Analyzes your project structure and dependencies
- Generates contextual descriptions using Grok AI
- Fallback to manual descriptions if AI is unavailable

### Folder Structure
- Recursively scans project directories
- Ignores common build and dependency folders
- Creates clean, readable tree structure

### Feature Extraction
- Extracts features from code comments
- Detects common patterns and technologies
- Supports multiple programming languages

### API Route Detection
- Express.js routes
- Next.js API routes
- FastAPI routes (Python)
- Automatic test example generation

### Screenshot Integration
- Scans `/screenshots`, `/images`, and `/assets/images` folders
- Supports PNG, JPG, JPEG, GIF, and WebP formats
- Automatically embeds images in README

## Git Integration

The package automatically sets up git hooks to update your README on commits:

```bash
# Pre-commit hook automatically runs:
auto-readme generate
git add README.md
```

## API Integration

### Grok AI Setup

1. Get your API key from [X AI Platform](https://x.ai)
2. Add it during initialization or update config:
```bash
auto-readme config
```

## File Structure

```
your-project/
├── .autoreadme.json          # Configuration file
├── README.md                 # Generated README
├── .git/hooks/pre-commit     # Auto-setup git hook
└── your-project-files...
```

## Examples

### Express.js API
```javascript
// routes/api.js
app.get('/api/users', (req, res) => {
  // feature: User management system
  res.json({ users: [] });
});
```

Generated README section:
```markdown
## API Endpoints

### GET Routes
- `GET /api/users`
  ```bash
  curl -X GET http://localhost:3000/api/users
  ```

## Features
- User management system
```

### React Application
```javascript
// App.js
import React from 'react';
// feature: Modern React application with hooks
function App() {
  return <div>Hello World</div>;
}
```

Generated README section:
```markdown
## Features
- Modern React application with hooks
- React frontend
- React hooks
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ using Node.js and modern JavaScript
- Powered by Grok AI for intelligent descriptions
- Inspired by the need for better documentation automation