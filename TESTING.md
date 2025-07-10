# Local Testing Guide for dan-readme-generator

## 🧪 Testing Locally Before Publishing

### 1. **Build the Package**
```bash
# Clean and build
npm run clean
npm run build

# Verify build output
ls -la dist/
```

### 2. **Link Package Locally**
```bash
# Link the package globally for testing
npm link

# Verify it's linked
which dan-readme
dan-readme --version
```

### 3. **Test in a Sample Project**
```bash
# Create a test project
mkdir test-project
cd test-project
npm init -y

# Create some sample files
echo "console.log('Hello World');" > index.js
mkdir src
echo "export const greeting = 'Hello';" > src/utils.js

# Test the CLI
dan-readme init
dan-readme generate
```

### 4. **Test Different Scenarios**

#### **Without GitHub Token**
```bash
# Unset token
unset GITHUB_TOKEN

# Test basic functionality
dan-readme init
# Should work without AI features
```

#### **With GitHub Token**
```bash
# Set your GitHub token
export GITHUB_TOKEN=your_github_token_here

# Test AI features
dan-readme init
# Should offer AI description generation
```

### 5. **Test in Different Project Types**

#### **React Project**
```bash
mkdir react-test
cd react-test
npx create-react-app . --template typescript
dan-readme init
dan-readme generate
```

#### **Node.js API Project**
```bash
mkdir api-test
cd api-test
npm init -y
npm install express
echo "const express = require('express'); const app = express();" > index.js
dan-readme init
dan-readme generate
```

### 6. **Unlink After Testing**
```bash
# Remove global link
npm unlink -g dan-readme-generator
# or use the script
npm run unlink
```

## 🚀 Publishing Steps

### 1. **Pre-publish Checklist**
- [ ] All tests pass locally
- [ ] Package builds successfully
- [ ] CLI works in test projects
- [ ] Version number is correct
- [ ] README is updated
- [ ] All files are included in build

### 2. **Version Management**
```bash
# Patch version (1.0.3 -> 1.0.4)
npm run publish:patch

# Minor version (1.0.3 -> 1.1.0)
npm run publish:minor

# Major version (1.0.3 -> 2.0.0)
npm run publish:major
```

### 3. **Manual Publishing**
```bash
# Login to npm (first time only)
npm login

# Verify you're logged in
npm whoami

# Build and publish
npm run build
npm publish

# Or use dry run first
npm publish --dry-run
```

### 4. **Verify Publication**
```bash
# Check if package is available
npm view dan-readme-generator

# Test installation from npm
npm install -g dan-readme-generator@latest
dan-readme --version
```

## 🔧 Troubleshooting

### **Build Issues**
```bash
# Clear TypeScript cache
rm -rf dist/
rm -f *.tsbuildinfo

# Reinstall dependencies
rm -rf node_modules/
npm install

# Build again
npm run build
```

### **Link Issues**
```bash
# Force unlink
npm unlink -g dan-readme-generator --force

# Clear npm cache
npm cache clean --force

# Try linking again
npm link
```

### **Permission Issues**
```bash
# If you get permission errors
sudo npm link
# or
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

## 📋 Testing Checklist

Before publishing, ensure:

- [ ] `npm run build` succeeds
- [ ] `npm run test:local` works
- [ ] CLI responds to `dan-readme --help`
- [ ] `dan-readme init` creates config file
- [ ] `dan-readme generate` creates README.md
- [ ] Works without GitHub token
- [ ] Works with GitHub token (if available)
- [ ] Package.json version is correct
- [ ] All dependencies are listed correctly
- [ ] .npmignore excludes source files
- [ ] README.md is comprehensive

## 🎯 Quick Test Script

```bash
#!/bin/bash
echo "🧪 Testing dan-readme-generator locally..."

# Build
npm run build || exit 1

# Link
npm link || exit 1

# Test basic functionality
mkdir -p /tmp/test-dan-readme
cd /tmp/test-dan-readme
echo '{"name": "test-project", "version": "1.0.0"}' > package.json
echo "console.log('test');" > index.js

# Test CLI
dan-readme --version || exit 1
dan-readme init --help || exit 1

echo "✅ Basic tests passed!"

# Cleanup
cd -
rm -rf /tmp/test-dan-readme
npm unlink -g dan-readme-generator

echo "🎉 Testing complete!"
```

Save this as `test.sh` and run with `chmod +x test.sh && ./test.sh`