# Project Setup Guide

## Overview

This guide provides comprehensive instructions for setting up the Lotus Hieroglyphic SVG Editor development environment. Follow these steps to get the project running locally on your machine.

## Prerequisites

### Required Software

**Node.js and NPM**
- **Node.js**: Version 18.0.0 or higher
- **NPM**: Version 8.0.0 or higher (comes with Node.js)
- **Download**: [https://nodejs.org/](https://nodejs.org/)

**Git**
- **Version**: 2.30.0 or higher
- **Download**: [https://git-scm.com/](https://git-scm.com/)

**Code Editor (Recommended)**
- **VS Code**: [https://code.visualstudio.com/](https://code.visualstudio.com/)
- **Extensions**: See [VS Code Setup](#vs-code-setup) section

### Optional Software

**Docker (for containerized development)**
- **Docker Desktop**: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Docker Compose**: Included with Docker Desktop

**Package Managers (alternatives to NPM)**
- **Yarn**: `npm install -g yarn`
- **PNPM**: `npm install -g pnpm`

## Quick Start

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/darkpyramid/lotus-editor.git

# Navigate to project directory
cd lotus-editor
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Or using alternative package managers
yarn install
# or
pnpm install
```

### 3. Start Development Server

```bash
# Start the development server
npm run dev

# Or using alternative package managers
yarn dev
# or
pnpm dev
```

### 4. Open in Browser

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

## Detailed Setup Instructions

### Environment Configuration

**Environment Variables**
Create a `.env.local` file in the root directory (optional):

```bash
# Development configuration
VITE_APP_TITLE="Lotus Editor - Development"
VITE_API_BASE_URL="http://localhost:3000"
VITE_ENABLE_PERFORMANCE_STATS=true

# Production configuration (for reference)
# VITE_APP_TITLE="Lotus Hieroglyphic SVG Editor"
# VITE_API_BASE_URL="https://api.lotus-editor.com"
# VITE_ENABLE_PERFORMANCE_STATS=false
```

**Configuration Files**
The project includes several configuration files that work out of the box:

- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration (auto-generated)
- `components.json` - Shadcn/ui configuration

### VS Code Setup

**Recommended Extensions**
Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
  ]
}
```

**VS Code Settings**
Create `.vscode/settings.json` for project-specific settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Package Scripts

The project includes several NPM scripts for development and build tasks:

```bash
# Development
npm run dev          # Start development server
npm run dev:host     # Start dev server accessible on network

# Building
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors automatically
npm run typecheck    # Run TypeScript type checking

# Testing (when implemented)
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report

# Docker
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
npm run docker:dev   # Run development Docker container
```

## Development Environment

### File Structure Overview

```
lotus-editor/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── services/          # Business logic services
│   ├── store/             # State management
│   ├── types/             # TypeScript definitions
│   ├── lib/               # Utility functions
│   └── data/              # Static data
├── public/                # Static assets
│   └── jseshGlyphs/       # SVG glyph collection
├── docs/                  # Documentation
├── .github/               # GitHub workflows
└── dist/                  # Build output (generated)
```

### Development Workflow

**1. Feature Development**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
npm run dev

# Check code quality
npm run lint
npm run typecheck

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

**2. Code Quality Checks**
```bash
# Run all quality checks
npm run lint && npm run typecheck && npm run build

# Fix common issues
npm run lint:fix
```

**3. Performance Monitoring**
The development build includes performance monitoring:
- Open browser DevTools
- Check the Performance Stats component
- Monitor cache hit rates and load times

### Hot Reload and Development Features

**Vite Development Server**
- **Hot Module Replacement (HMR)**: Instant updates without page refresh
- **Fast Refresh**: React component state preservation
- **TypeScript Support**: Real-time type checking
- **CSS Hot Reload**: Instant style updates

**Development Tools**
- **React DevTools**: Component inspection and profiling
- **Redux DevTools**: State management debugging (if using Redux)
- **Performance Stats**: Built-in performance monitoring
- **Error Boundaries**: Graceful error handling in development

## Docker Development

### Development Container

**Start Development Environment**
```bash
# Build and start development container
docker-compose --profile dev up --build

# Or run specific service
docker-compose run --rm lotus-editor-dev npm run dev
```

**Development Container Features**
- Hot reload with volume mounting
- Node.js 18 Alpine base image
- All dependencies pre-installed
- Port 5173 exposed for development server

### Production Container

**Build Production Image**
```bash
# Build production Docker image
docker build -t lotus-editor:latest .

# Run production container
docker run -p 3000:80 lotus-editor:latest
```

**Production Container Features**
- Multi-stage build for optimization
- Nginx web server
- Gzip compression enabled
- Health checks configured
- Security headers included

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process using port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3001
```

**Node Modules Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or clear npm cache
npm cache clean --force
```

**TypeScript Errors**
```bash
# Restart TypeScript server in VS Code
# Command Palette: "TypeScript: Restart TS Server"

# Or run type checking manually
npm run typecheck
```

**Build Failures**
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear dist directory
rm -rf dist

# Rebuild
npm run build
```

### Performance Issues

**Slow Development Server**
```bash
# Check Node.js version (should be 18+)
node --version

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

**Large Bundle Size**
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Check for duplicate dependencies
npx npm-check-duplicates
```

### Environment-Specific Issues

**Windows Specific**
```bash
# Use cross-env for environment variables
npm install --save-dev cross-env

# Fix line ending issues
git config core.autocrlf true
```

**macOS Specific**
```bash
# Install Xcode command line tools if needed
xcode-select --install

# Fix permission issues
sudo chown -R $(whoami) ~/.npm
```

**Linux Specific**
```bash
# Install build essentials if needed
sudo apt-get install build-essential

# Fix file watching limits
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## IDE Configuration

### VS Code Workspace

**Workspace Settings**
Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    }
  ]
}
```

**Tasks Configuration**
Create `.vscode/tasks.json` for build tasks:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "npm",
      "script": "dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "build",
      "type": "npm",
      "script": "build",
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
}
```

### Other IDEs

**WebStorm Configuration**
- Enable TypeScript service
- Configure Prettier as code formatter
- Set up ESLint integration
- Configure Tailwind CSS plugin

**Vim/Neovim Configuration**
- Install TypeScript language server
- Configure Prettier integration
- Set up ESLint plugin
- Install Tailwind CSS IntelliSense

## Testing Setup

### Unit Testing (Future Implementation)

**Vitest Configuration**
```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Add test script to package.json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

**Test File Structure**
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
└── services/
    ├── glyphLoader.ts
    └── __tests__/
        └── glyphLoader.test.ts
```

### E2E Testing (Future Implementation)

**Playwright Configuration**
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Initialize Playwright
npx playwright install
```

## Deployment Setup

### Local Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Serve with static server
npx serve dist
```

### Environment-Specific Builds

**Staging Environment**
```bash
# Build for staging
VITE_APP_ENV=staging npm run build

# Deploy to staging server
# (deployment commands depend on hosting provider)
```

**Production Environment**
```bash
# Build for production
VITE_APP_ENV=production npm run build

# Deploy to production server
# (deployment commands depend on hosting provider)
```

## Contributing Setup

### Pre-commit Hooks

**Husky Setup** (Future Implementation)
```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run typecheck"
```

### Code Formatting

**Prettier Configuration**
Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Git Configuration

**Git Hooks**
```bash
# Set up commit message template
git config commit.template .gitmessage

# Set up automatic line ending conversion
git config core.autocrlf input  # Linux/Mac
git config core.autocrlf true   # Windows
```

## Next Steps

After completing the setup:

1. **Explore the Codebase**: Start with `src/App.tsx` and follow the component tree
2. **Read Documentation**: Review all files in the `docs/` directory
3. **Run the Application**: Test all features in the development environment
4. **Make a Small Change**: Try modifying a component to understand the workflow
5. **Join the Community**: Check out [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines

## Support

If you encounter issues during setup:

1. **Check Documentation**: Review this guide and other docs
2. **Search Issues**: Look for similar problems in GitHub issues
3. **Ask for Help**: Create a new issue with detailed information
4. **Contact Team**: Reach out to the development team

**Contact Information**
- **GitHub Issues**: [Project Issues](https://github.com/darkpyramid/lotus-editor/issues)
- **Email**: dev@darkpyramid.net
- **Documentation**: [Project Wiki](https://github.com/darkpyramid/lotus-editor/wiki)

---

For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
For project structure details, see [STRUCTURE.md](STRUCTURE.md).
For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).