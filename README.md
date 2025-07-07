# Auto README Generator

An intelligent npm package that automatically generates and updates README.md files using AI-powered descriptions, folder structure scanning, and feature extraction from your codebase.

## 🚀 Features

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

## 📦 Installation

### Global Installation (Recommended)
```bash
npm install -g auto-readme-generator
```

### Local Installation
```bash
npm install --save-dev auto-readme-generator
```

## 🚀 Quick Start

1. **Navigate to your project directory:**
```bash
cd your-project
```

2. **Initialize Auto README Generator:**
```bash
auto-readme init
```

3. **Generate your README:**
```bash
auto-readme generate
```

## 📖 CLI Commands

### `auto-readme init`
Initialize the package in your project with interactive setup.

**Features:**
- Interactive project configuration
- AI API key setup
- Feature selection
- Git hooks configuration

### `auto-readme generate`
Generate or update the README.md file.

**Options:**
- `-f, --force` - Force regeneration even if no changes detected

**Example:**
```bash
auto-readme generate --force
```

### `auto-readme config`
Update configuration settings interactively.

## ⚙️ Configuration

The package creates a `.autoreadme.json` file in your project root:

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

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `projectName` | string | Project name (defaults to folder name) |
| `description` | string | Project description (leave empty for AI generation) |
| `useAI` | boolean | Enable AI-powered description generation |
| `grokApiKey` | string | Your Grok AI API key |
| `features` | array | List of features to include in README |
| `license` | string | Project license type |
| `autoUpdate` | boolean | Enable automatic README updates on git commits |

## 🎯 Supported Features

### 🤖 AI Description Generation
- Analyzes your project structure and dependencies
- Generates contextual descriptions using Grok AI
- Intelligent fallback to manual descriptions
- Supports multiple programming languages

### 📁 Folder Structure
- Recursively scans project directories
- Ignores common build and dependency folders (`node_modules`, `dist`, `.git`)
- Creates clean, readable tree structure
- Customizable ignore patterns

### 🔍 Feature Extraction
- Extracts features from code comments (`// feature: Description`)
- Detects common patterns and technologies
- Supports JavaScript, TypeScript, Python, Go, Rust, Java, PHP
- Framework detection (React, Vue, Angular, Express, Next.js)

### 🛣️ API Route Detection
- **Express.js routes** - `app.get()`, `app.post()`, etc.
- **Next.js API routes** - `/pages/api/` and `/app/api/`
- **FastAPI routes** - `@app.get()`, `@app.post()`, etc.
- Automatic test example generation
- HTTP method categorization

### 📸 Screenshot Integration
- Scans `/screenshots`, `/images`, and `/assets/images` folders
- Supports PNG, JPG, JPEG, GIF, and WebP formats
- Automatically embeds images in README
- Responsive image sizing

## 🔗 Git Integration

The package automatically sets up git hooks to update your README on commits:

```bash
# Pre-commit hook automatically runs:
auto-readme generate
git add README.md
```

### Manual Git Hook Setup
If automatic setup fails, you can manually create the hook:

```bash
# Create pre-commit hook
echo '#!/bin/sh
auto-readme generate
git add README.md' > .git/hooks/pre-commit

# Make it executable
chmod +x .git/hooks/pre-commit
```

## 🤖 AI Integration

### Grok AI Setup

1. **Get your API key:**
   - Visit [X AI Platform](https://x.ai)
   - Create an account or sign in
   - Generate an API key

2. **Configure the key:**
   ```bash
   auto-readme config
   ```
   Or manually add to `.autoreadme.json`:
   ```json
   {
     "grokApiKey": "your-api-key-here",
     "useAI": true
   }
   ```

### AI Features
- **Smart Project Analysis** - Understands your tech stack
- **Contextual Descriptions** - Generates relevant project descriptions
- **Framework Detection** - Identifies React, Vue, Express, etc.
- **Language Support** - Works with any programming language

## 📂 File Structure

```
your-project/
├── .autoreadme.json          # Configuration file
├── README.md                 # Generated README
├── .git/hooks/pre-commit     # Auto-setup git hook
└── your-project-files...
```

## 💡 Examples

### Express.js API Project
```javascript
// routes/api.js
app.get('/api/users', (req, res) => {
  // feature: User management system
  res.json({ users: [] });
});

app.post('/api/auth/login', (req, res) => {
  // feature: JWT authentication
  res.json({ token: 'jwt-token' });
});
```

**Generated README sections:**
```markdown
## API Endpoints

### GET Routes
- `GET /api/users`
  ```bash
  curl -X GET http://localhost:3000/api/users
  ```

### POST Routes
- `POST /api/auth/login`
  ```bash
  curl -X POST http://localhost:3000/api/auth/login
  ```

## Features
- User management system
- JWT authentication
```

### React Application
```javascript
// App.js
import React from 'react';
// feature: Modern React application with hooks
// feature: Responsive design
function App() {
  return <div>Hello World</div>;
}
```

**Generated README sections:**
```markdown
## Features
- Modern React application with hooks
- Responsive design
- React frontend
- React hooks
```

### Next.js API Routes
```javascript
// pages/api/users/[id].js
export default function handler(req, res) {
  // feature: Dynamic user profiles
  if (req.method === 'GET') {
    res.json({ user: { id: req.query.id } });
  }
}
```

**Generated README sections:**
```markdown
## API Endpoints

### GET Routes
- `GET /api/users/[id]`
  ```bash
  curl -X GET http://localhost:3000/api/users/123
  ```

## Features
- Dynamic user profiles
```

## 🛠️ Development

### Prerequisites
- Node.js >= 14.0.0
- npm or yarn
- Git

### Local Development
```bash
# Clone the repository
git clone https://github.com/dan-kingo/auto-readme-generator.git

# Navigate to project directory
cd auto-readme-generator

# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link

# Test the CLI
auto-readme --help
```

### Testing
```bash
# Run tests
npm test

# Run linting
npm run lint

# Clean build directory
npm run clean
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Follow conventional commit messages

### Areas for Contribution
- 🌐 Additional language support
- 🔌 New framework integrations
- 🎨 Template customization
- 🧪 Test coverage improvements
- 📚 Documentation enhancements

## 📋 Roadmap

- [ ] **Template System** - Custom README templates
- [ ] **Plugin Architecture** - Extensible feature system
- [ ] **Multi-language Support** - Internationalization
- [ ] **GitHub Actions Integration** - CI/CD automation
- [ ] **VS Code Extension** - IDE integration
- [ ] **Web Dashboard** - Online configuration
- [ ] **Team Collaboration** - Shared configurations

## 🐛 Troubleshooting

### Common Issues

**Issue: "Command not found: auto-readme"**
```bash
# Solution: Install globally
npm install -g auto-readme-generator

# Or use npx
npx auto-readme-generator init
```

**Issue: "API key invalid"**
```bash
# Solution: Update your Grok API key
auto-readme config
```

**Issue: "Git hooks not working"**
```bash
# Solution: Manually setup git hooks
chmod +x .git/hooks/pre-commit
```

**Issue: "Permission denied"**
```bash
# Solution: Fix file permissions
sudo chmod +x /usr/local/bin/auto-readme
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=auto-readme* auto-readme generate
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using Node.js and TypeScript
- Powered by [Grok AI](https://x.ai) for intelligent descriptions
- Inspired by the need for better documentation automation
- Thanks to all contributors and the open-source community

## 📞 Support

- 📧 **Email**: danieldejen23@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/dan-kingo/auto-readme-generator/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/dan-kingo/auto-readme-generator/discussions)
- 📖 **Documentation**: [GitHub Wiki](https://github.com/dan-kingo/auto-readme-generator/wiki)

---

<div align="center">
  <strong>⭐ Star this repository if you find it helpful!</strong>
</div>