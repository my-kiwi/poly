# Copilot Instructions

## Project Overview
This is a Threejs experiment that use the AudioAnalyser to show psychedelic visuals that react to a background music and make the user feel like in a dream, where anything can happen.

## Code Style & Standards
- **Language**: TypeScript (strict mode)
- **Linter**: ESLint - follow all linting rules
- **Formatting**: Code should pass ESLint checks before submission
- **Build Tool**: Vite for bundling and development

## Project Structure
- `src/` - All source code
  - `*.ts` - TypeScript modules
  - `*.test.ts` - Unit tests using vitest
- `index.html` - Entry point
- `styles.css` - Global styles
- Configuration files in root directory

## Key Components
- `main.ts` - Application entry point
- `utils/` - Utility functions that can be re-used in other projects

## Build & Development
- Development: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Lint fix: `npm run lint:fix`
- Test: `npm run test`

## Code Guidelines
1. Write modular, reusable components that follow the Single Responsibility Principle, create new files for new components and utilities as needed
2. Keep functions small and focused
3. Add comments to explain complex logic
4. Do not create new classes or types unless necessary - prefer simple functions and objects
5. Follow the existing code patterns in the project
6. Ensure all code passes linting before commit
7. Write concise code and don't create types when they're not needed - type inference works great

## Common Patterns
- Use TypeScript for all new code
- Export components and utilities as named exports
- Keep CSS classes semantic and descriptive
- Use relative imports within src/
