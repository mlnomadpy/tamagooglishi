# Documentation & Developer Guide

## Development Workflow
We follow a **Test Driven Development (TDD)** workflow.
1.  **Write a Test**: Create a `.test.js` file in `__tests__` directories.
2.  **Fail**: Run `npm run test` and watch it fail.
3.  **Implement**: Write the minimum code to pass the test.
4.  **Refactor**: Clean up the code.

## Running Tests
- **Unit Tests**: `npm run test` (Runs Vitest)
- **UI Tests**: Manual verification via `npm run dev`

## Coding Standards
- **ES Modules**: Use `import`/`export`.
- **Classes**: Use `class` for game entities.
- **Physics**: All physical objects must extend `Entity` or wrapper classes around Matter.js bodies.
