# Contributing to Lotus Hieroglyphic SVG Editor

Thank you for your interest in contributing to the Lotus Hieroglyphic SVG Editor! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Docker (optional, for containerized development)

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/lotus-editor.git
   cd lotus-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm run test
   npm run test:coverage
   ```

5. **Type checking**
   ```bash
   npm run typecheck
   ```

## Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation improvements**
- 🎨 **UI/UX enhancements**
- ⚡ **Performance optimizations**
- 🧪 **Test coverage improvements**
- 🔧 **Build and tooling improvements**

### Before You Start

1. **Check existing issues** - Look for existing issues or discussions
2. **Create an issue** - For new features or significant changes
3. **Discuss approach** - Get feedback on your proposed solution
4. **Follow conventions** - Adhere to our coding standards

### Branch Naming Convention

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `chore/` - Maintenance tasks

Examples:
```
feature/glyph-search-improvements
fix/canvas-zoom-bug
docs/api-documentation-update
```

## Pull Request Process

### 1. Preparation

- Ensure your fork is up to date with the main repository
- Create a feature branch from `develop`
- Make your changes in logical, atomic commits
- Write clear commit messages

### 2. Code Quality

- Run linting: `npm run lint`
- Run type checking: `npm run typecheck`
- Run tests: `npm run test`
- Ensure all checks pass

### 3. Documentation

- Update relevant documentation
- Add JSDoc comments for new functions/components
- Update README if needed
- Add changelog entry for significant changes

### 4. Testing

- Write tests for new functionality
- Ensure existing tests still pass
- Aim for good test coverage
- Test in multiple browsers if UI changes

### 5. Pull Request

- Use the PR template
- Provide clear description of changes
- Link related issues
- Add screenshots for UI changes
- Request review from maintainers

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### React Components

```typescript
// Good: Functional component with proper typing
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Styling

- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Use CSS custom properties for theming
- Maintain consistent spacing and typography

### State Management

- Use Zustand for global state
- Keep state minimal and normalized
- Use proper TypeScript types for state
- Implement proper error handling

### Performance

- Implement proper memoization with `useMemo` and `useCallback`
- Lazy load components when appropriate
- Optimize SVG loading and caching
- Monitor bundle size impact

## Testing

### Unit Tests

```typescript
// Example test structure
describe('GlyphTransform', () => {
  it('should rotate glyph correctly', () => {
    const transform = new GlyphTransform();
    transform.rotate(90);
    expect(transform.rotation).toBe(90);
  });
});
```

### Integration Tests

- Test component interactions
- Test state management flows
- Test API integrations

### E2E Tests

- Test critical user workflows
- Test cross-browser compatibility
- Test responsive design

## Documentation

### Code Documentation

- Use JSDoc for functions and classes
- Document complex algorithms
- Explain non-obvious code decisions
- Keep comments up to date

### API Documentation

- Document all public APIs
- Provide usage examples
- Document error conditions
- Keep documentation in sync with code

## Performance Guidelines

### Bundle Size

- Monitor bundle size impact of changes
- Use dynamic imports for large dependencies
- Implement proper tree shaking
- Optimize images and assets

### Runtime Performance

- Profile performance-critical code
- Implement proper caching strategies
- Optimize re-renders
- Use performance monitoring tools

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Changelog

- Update CHANGELOG.md for all changes
- Follow Keep a Changelog format
- Include migration guides for breaking changes

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Email**: contact@darkpyramid.net for private matters

### Resources

- [Project Documentation](../README.md)
- [Architecture Overview](STRUCTURE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Technology Stack](TECHNOLOGIES.md)

## Recognition

Contributors will be recognized in:

- [CONTRIBUTORS.md](CONTRIBUTORS.md)
- GitHub contributors page
- Release notes for significant contributions

Thank you for contributing to the Lotus Hieroglyphic SVG Editor! 🙏