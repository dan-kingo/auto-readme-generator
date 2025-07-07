# Publishing to NPM - Step by Step Guide

## Prerequisites

1. **Create NPM Account**
   - Go to [npmjs.com](https://www.npmjs.com)
   - Sign up for a free account
   - Verify your email address

2. **Install NPM CLI** (if not already installed)
   ```bash
   npm install -g npm
   ```

## Publishing Steps

### 1. Login to NPM
```bash
npm login
```
Enter your NPM username, password, and email when prompted.

### 2. Verify Login
```bash
npm whoami
```
This should display your NPM username.

### 3. Check Package Name Availability
```bash
npm search auto-readme-generator
```
If the name is taken, update the `name` field in `package.json`.

### 4. Update Package Information
Edit `package.json`:
- Update `author` field with your name and email
- Update `repository.url` with your GitHub repository URL
- Update `bugs.url` and `homepage` URLs
- Ensure version is correct (start with 1.0.0)

### 5. Test Package Locally
```bash
# Install dependencies
npm install

# Test CLI locally
npm link
auto-readme --help

# Unlink after testing
npm unlink
```

### 6. Run Quality Checks
```bash
# Check for issues
npm audit

# Fix vulnerabilities if any
npm audit fix

# Lint code (if you have ESLint configured)
npm run lint
```

### 7. Publish to NPM
```bash
# Dry run to see what will be published
npm publish --dry-run

# Actually publish
npm publish
```

### 8. Verify Publication
```bash
# Check if package is available
npm view auto-readme-generator

# Test installation
npm install -g auto-readme-generator
auto-readme --version
```

## Version Management

### Updating Versions
```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major

# Publish updated version
npm publish
```

### Publishing Beta Versions
```bash
# Publish as beta
npm publish --tag beta

# Install beta version
npm install -g auto-readme-generator@beta
```

## Important Notes

1. **Package Name**: Must be unique on NPM. Consider scoped packages if name is taken:
   ```json
   {
     "name": "@yourusername/auto-readme-generator"
   }
   ```

2. **Semantic Versioning**: Follow semver (major.minor.patch)
   - Major: Breaking changes
   - Minor: New features (backward compatible)
   - Patch: Bug fixes

3. **Files Included**: The `files` array in package.json controls what gets published

4. **License**: Ensure you have the right to publish all included code

5. **Testing**: Always test your package before publishing

## Troubleshooting

### Common Issues:
- **403 Forbidden**: Check if package name is available or if you have permission
- **401 Unauthorized**: Run `npm login` again
- **Package name too similar**: Choose a more unique name
- **Version already exists**: Increment version number

### Unpublishing (within 24 hours):
```bash
npm unpublish auto-readme-generator@1.0.0
```

**Warning**: Unpublishing is discouraged and only possible within 24 hours for versions with no dependents.