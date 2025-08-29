# Testing Strategy

## Testing Philosophy

Our testing approach follows the testing pyramid:
- **Unit Tests (70%)**: Fast, isolated component and function tests
- **Integration Tests (20%)**: API endpoints and component integration
- **E2E Tests (10%)**: Critical user journeys

## Testing Stack

### Frontend Testing
- **Jest**: Test runner and assertion library
- **Testing Library**: Component testing utilities
- **MSW**: API mocking for integration tests
- **Playwright**: End-to-end testing (planned)

### Backend Testing
- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library
- **Test Containers**: Database testing with Docker

### Mobile Testing
- **Jest**: Test runner with React Native preset
- **Testing Library React Native**: Component testing
- **Detox**: E2E testing (planned)

## Test Organization

### Directory Structure
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── services/
│   ├── api.ts
│   └── __tests__/
│       └── api.test.ts
└── __tests__/
    ├── setup.ts
    └── utils/
```

### Naming Conventions
- Test files: `*.test.ts` or `*.test.tsx`
- Test utilities: `test-utils.ts`
- Mocks: `__mocks__/`

## Unit Testing Guidelines

### Component Testing
```tsx
describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Service Testing
```ts
describe('API Service', () => {
  it('fetches clipboard items', async () => {
    const mockItems = [{ id: '1', content: 'test' }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems
    });

    const items = await apiService.getClipboardItems();
    expect(items).toEqual(mockItems);
  });
});
```

## Integration Testing

### API Testing
```ts
describe('Clipboard API', () => {
  it('creates new clipboard item', async () => {
    const newItem = { content: 'test content', type: 'text' };
    
    const response = await request(app)
      .post('/api/clipboard')
      .send(newItem)
      .expect(201);

    expect(response.body.content).toBe(newItem.content);
  });
});
```

### Database Testing
```ts
describe('Clipboard Repository', () => {
  beforeEach(async () => {
    await testDb.clear();
  });

  it('saves clipboard item to database', async () => {
    const item = await clipboardRepo.create({
      content: 'test',
      type: 'text',
      userId: 'user-1'
    });

    expect(item.id).toBeDefined();
    expect(item.content).toBe('test');
  });
});
```

## E2E Testing (Planned)

### Critical User Journeys
1. **User Registration & Login**
2. **Clipboard Item Creation**
3. **Cross-device Synchronization**
4. **AI Suggestion Generation**

### E2E Test Example
```ts
test('user can create and sync clipboard items', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password');
  await page.click('[data-testid=login-button]');

  await page.waitForURL('/dashboard');
  await page.fill('[data-testid=clipboard-input]', 'Test content');
  await page.click('[data-testid=save-button]');

  await expect(page.locator('[data-testid=clipboard-item]')).toContainText('Test content');
});
```

## Test Data Management

### Fixtures
```ts
// test-fixtures.ts
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User'
};

export const mockClipboardItem = {
  id: 'item-1',
  content: 'Test content',
  type: 'text' as const,
  timestamp: new Date('2024-01-01'),
  userId: 'user-1'
};
```

### Factory Functions
```ts
// test-factories.ts
export const createMockUser = (overrides = {}) => ({
  ...mockUser,
  ...overrides
});

export const createMockClipboardItem = (overrides = {}) => ({
  ...mockClipboardItem,
  id: Math.random().toString(),
  ...overrides
});
```

## Mocking Strategies

### API Mocking
```ts
// Mock fetch globally
global.fetch = jest.fn();

// Mock specific modules
jest.mock('../services/api', () => ({
  apiService: {
    getClipboardItems: jest.fn(),
    createClipboardItem: jest.fn()
  }
}));
```

### External Service Mocking
```ts
// Mock Firebase
jest.mock('../services/firebase', () => ({
  auth: {
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn()
  }
}));

// Mock Tauri APIs
window.__TAURI__ = {
  invoke: jest.fn(),
  event: { listen: jest.fn() }
};
```

## Coverage Requirements

### Minimum Coverage Thresholds
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Coverage Exclusions
- Type definition files (`*.d.ts`)
- Configuration files
- Test setup files
- Third-party integrations

## Continuous Integration

### GitHub Actions Workflow
```yaml
- name: Run Tests
  run: |
    npm test -- --coverage --watchAll=false
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Quality Gates
- All tests must pass
- Coverage thresholds must be met
- No linting errors
- Type checking passes

## Testing Best Practices

### Do's
- Write tests before or alongside code (TDD/BDD)
- Test behavior, not implementation
- Use descriptive test names
- Keep tests simple and focused
- Mock external dependencies
- Test error conditions
- Use data-testid for reliable element selection

### Don'ts
- Don't test implementation details
- Don't write overly complex tests
- Don't ignore flaky tests
- Don't mock everything
- Don't test third-party libraries
- Don't duplicate coverage between test levels

## Performance Testing

### Load Testing (Planned)
- API endpoint performance
- Database query optimization
- Memory usage monitoring
- Concurrent user simulation

### Frontend Performance
- Bundle size monitoring
- Render performance testing
- Memory leak detection
- Accessibility performance

## Security Testing

### Authentication Testing
- Token validation
- Session management
- Permission checks
- Input sanitization

### Data Protection
- Encryption verification
- PII handling
- GDPR compliance
- Audit logging