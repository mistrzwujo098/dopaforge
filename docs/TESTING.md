# DopaForge Testing Guide

## Overview

DopaForge uses a comprehensive testing strategy including unit tests, integration tests, and end-to-end tests. All tests can be run locally or in Docker containers for consistency.

## Quick Start

### Running Tests Locally

```bash
# Install dependencies
pnpm install

# Run all tests
pnpm test:all

# Run specific test types
pnpm test:unit        # Unit tests only
pnpm test:integration # Integration tests only
pnpm test:e2e        # E2E tests only

# Watch mode for development
pnpm test:watch
```

### Running Tests with Docker

```bash
# Make script executable (first time only)
chmod +x ./scripts/test-docker.sh

# Run all tests in Docker
pnpm test:docker

# Run specific test types in Docker
pnpm test:docker:unit
pnpm test:docker:integration
pnpm test:docker:e2e
```

## Test Structure

```
DopaForge/
├── apps/web/
│   ├── src/
│   │   ├── components/__tests__/    # Component unit tests
│   │   ├── hooks/__tests__/         # Hook unit tests
│   │   ├── lib/__tests__/           # Utility unit tests
│   │   └── app/api/__tests__/       # API integration tests
│   ├── cypress/
│   │   ├── e2e/                     # E2E test specs
│   │   ├── fixtures/                # Test data
│   │   └── support/                 # Custom commands
│   └── vitest.config.ts             # Vitest configuration
├── packages/
│   ├── db/__tests__/                # Database tests
│   └── ui/__tests__/                # UI component tests
├── docker-compose.test.yml           # Docker test environment
└── scripts/test-docker.sh            # Docker test runner
```

## Test Types

### 1. Unit Tests
- **Framework**: Vitest
- **Location**: `__tests__` folders next to source files
- **Purpose**: Test individual components, hooks, and utilities in isolation
- **Example**:

```typescript
// src/components/__tests__/task-card.test.tsx
import { render, screen } from '@testing-library/react';
import { TaskCard } from '../task-card';

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard title="Test Task" />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

### 2. Integration Tests
- **Framework**: Vitest + Supabase Test Client
- **Location**: `src/app/api/__tests__/`
- **Purpose**: Test API endpoints and database interactions
- **Example**:

```typescript
// src/app/api/__tests__/tasks.test.ts
describe('Tasks API', () => {
  it('creates a new task', async () => {
    const { data, error } = await supabase
      .from('micro_tasks')
      .insert({ title: 'Test Task' })
      .select()
      .single();
      
    expect(error).toBeNull();
    expect(data.title).toBe('Test Task');
  });
});
```

### 3. E2E Tests
- **Framework**: Cypress
- **Location**: `cypress/e2e/`
- **Purpose**: Test complete user workflows
- **Example**:

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication', () => {
  it('logs in user', () => {
    cy.visit('/auth');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
    cy.contains('Check your email').should('be.visible');
  });
});
```

## Docker Test Environment

The Docker test environment provides:
- PostgreSQL with Supabase extensions
- Redis for caching
- Isolated test runner container
- Consistent environment across machines

### Docker Services

1. **test-db**: PostgreSQL database for tests
2. **test-redis**: Redis cache for tests
3. **test-studio**: Supabase Studio for debugging
4. **test-runner**: Container that runs the tests

### Environment Variables

```bash
# Test database
DATABASE_URL=postgresql://postgres:test123@test-db:5432/dopaforge_test

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key

# Redis
REDIS_URL=redis://test-redis:6379
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main`

GitHub Actions workflow includes:
1. Linting and formatting checks
2. Unit tests with coverage reporting
3. Integration tests with test database
4. E2E tests with Cypress
5. Docker-based test suite
6. Build verification

## Writing Tests

### Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
   ```typescript
   // Good
   it('should display error message when email is invalid')
   
   // Bad
   it('test email')
   ```

2. **Test Organization**: Group related tests using `describe` blocks
   ```typescript
   describe('TaskCard', () => {
     describe('rendering', () => {
       it('displays task title', () => {});
       it('shows duration in minutes', () => {});
     });
     
     describe('interactions', () => {
       it('calls onComplete when clicked', () => {});
     });
   });
   ```

3. **Test Data**: Use factories or fixtures for consistent test data
   ```typescript
   const createTestTask = (overrides = {}) => ({
     id: 'test-id',
     title: 'Test Task',
     duration_minutes: 25,
     resistance_level: 5,
     ...overrides,
   });
   ```

4. **Async Testing**: Always await async operations
   ```typescript
   it('loads user data', async () => {
     const user = await loadUser('test-id');
     expect(user).toBeDefined();
   });
   ```

### Custom Test Commands

Cypress provides custom commands for common operations:

```typescript
// Login
cy.login('test@example.com');

// Create task via API
cy.createTask({
  title: 'Test Task',
  duration: 25,
  resistance: 5,
});

// Clear test data
cy.clearTestData();

// Drag and drop
cy.get('.task').drag('.drop-zone');
```

## Debugging Tests

### Local Debugging

1. **Vitest UI**: Run `pnpm test:ui` for interactive test debugging
2. **Cypress GUI**: Run `pnpm cypress` to open Cypress Test Runner
3. **Console Logs**: Tests output to console during development

### Docker Debugging

1. **View logs**: `docker-compose -f docker-compose.test.yml logs -f`
2. **Access test database**: `docker exec -it dopaforge-test-db psql -U postgres`
3. **Supabase Studio**: Visit `http://localhost:54323` when tests are running

## Performance Testing

Monitor test performance with:
- Bundle size analysis: `ANALYZE=true pnpm build`
- Lighthouse CI integration (coming soon)
- Performance metrics in E2E tests

## Coverage Reports

Test coverage is collected automatically:
- View coverage: `pnpm test:coverage`
- Coverage reports uploaded to Codecov in CI
- Minimum coverage thresholds enforced

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 54322 (test DB) and 6380 (test Redis) are free
2. **Docker permissions**: Run `chmod +x ./scripts/test-docker.sh`
3. **Database migrations**: Run `pnpm db:migrate:test` before integration tests
4. **Flaky E2E tests**: Increase timeouts in `cypress.config.ts`

### Reset Test Environment

```bash
# Stop all test containers
docker-compose -f docker-compose.test.yml down -v

# Clean test data
pnpm test:clean

# Rebuild test images
docker-compose -f docker-compose.test.yml build --no-cache
```

## Contributing

When adding new features:
1. Write unit tests for new components/utilities
2. Add integration tests for new API endpoints
3. Create E2E tests for new user workflows
4. Ensure all tests pass locally and in Docker
5. Update this documentation as needed