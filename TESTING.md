# Testing Strategy

This project maintains a high standard of code quality through a rigorous testing strategy aiming for **90% unit test coverage**.

## Overview
- **Unit Tests**: Run on every commit via Husky. verifying utilities, hooks, and context.
- **Integration Tests**: Run on Pull Requests via GitHub Actions, verifying component interactions.

## running Tests

### Unit Tests
Run unit tests for utilities, services, hooks, and context:
```bash
npm run test:unit
```

### Integration Tests
Run integration tests for components:
```bash
npm run test:integration
```

### All Tests
Run the entire test suite:
```bash
npm test
```

### Coverage
Generate a coverage report:
```bash
npx vitest run --coverage
```

## Structure
- **Unit Tests**: Located in `__tests__` directories near the source files (e.g., `src/utils/__tests__`).
- **Integration Tests**: Located in `src/components/**/__tests__`.

## Mocks
- **Electron API**: Mocked in `src/setupTests.js` to simulate the desktop environment.
- **LocalStorage**: Mocked in `src/setupTests.js`.
