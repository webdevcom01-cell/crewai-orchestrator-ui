# 🧪 Testing Guide

Kompletna test infrastruktura za CrewAI Orchestrator projekat.

## 📊 Test Coverage Status

### Frontend
- **Unit Tests**: ✅ Hooks, Reducer, Utils
- **Component Tests**: ✅ Navigation, UI components
- **Integration Tests**: ⏳ API service mocks
- **E2E Tests**: ⏳ Critical user flows

### Backend
- **Unit Tests**: ✅ Gemini service, Validation
- **Integration Tests**: ⏳ API endpoints
- **E2E Tests**: ⏳ Full request/response cycle

**Target Coverage**: 70% minimum

---

## 🚀 Quick Start

### Run All Tests

**Frontend:**
```bash
npm test
```

**Backend:**
```bash
cd server
npm test
```

### Watch Mode (Development)

```bash
# Frontend
npm run test:watch

# Backend
cd server && npm run test:watch
```

### Coverage Reports

```bash
# Frontend
npm run test:coverage

# Backend
cd server && npm run test:coverage
```

Coverage reports:
- HTML: `coverage/index.html`
- Terminal: Summary printed after tests
- LCOV: `coverage/lcov.info` (for CI/CD)

---

## 📁 Test Structure

### Frontend (`/src/test/`)

```
src/test/
├── setup.ts                    # Test environment setup
├── testUtils.tsx               # Custom render functions, mocks
├── hooks/
│   └── useOrchestrator.test.ts # Hook tests
├── components/
│   └── Navigation.test.tsx     # Component tests
├── utils/
│   └── helpers.test.ts         # Utility function tests
└── reducer.test.ts             # State management tests
```

### Backend (`/server/src/test/`)

```
server/src/test/
├── services/
│   └── gemini.service.test.ts  # AI service tests
├── routes/
│   └── ai.routes.test.ts       # API endpoint tests (TODO)
└── middleware/
    ├── validation.test.ts      # Validation middleware (TODO)
    └── errorHandler.test.ts    # Error handling (TODO)
```

---

## 🛠️ Testing Tools

### Frontend Stack

- **Vitest** - Fast unit test runner (Vite-native)
- **@testing-library/react** - React component testing
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - Browser environment simulation

### Backend Stack

- **Vitest** - Node.js testing
- **Vitest Coverage (v8)** - Code coverage
- **Mock modules** - Service mocking

---

## 📝 Writing Tests

### Example: Hook Test

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOrchestrator } from '../../hooks/useOrchestrator';

describe('useOrchestrator', () => {
  it('should return context value', () => {
    const { result } = renderHook(() => useOrchestrator(), {
      wrapper: OrchestratorProvider,
    });

    expect(result.current.state).toBeDefined();
    expect(result.current.dispatch).toBeDefined();
  });
});
```

### Example: Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../testUtils';
import MyComponent from '../../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle click', async () => {
    renderWithProviders(<MyComponent />);
    const user = userEvent.setup();
    
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### Example: Backend Service Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { GeminiService } from '../../services/gemini.service';

describe('GeminiService', () => {
  it('should generate backstory', async () => {
    const service = new GeminiService();
    const result = await service.generateBackstory({
      role: 'Developer',
      goal: 'Code',
    });

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});
```

---

## 🎯 Test Utilities

### Custom Render (`testUtils.tsx`)

```typescript
import { renderWithProviders } from './test/testUtils';

// Automatically wraps with BrowserRouter + OrchestratorContext
renderWithProviders(<MyComponent />, {
  state: { agents: [...] } // Optional initial state
});
```

### Mock Data Generators

```typescript
import { 
  createMockAgent, 
  createMockTask, 
  createMockFlow 
} from './test/testUtils';

const agent = createMockAgent({ name: 'Custom Name' });
const task = createMockTask({ agentId: agent.id });
```

---

## 🔍 Coverage Thresholds

### Frontend

```javascript
{
  lines: 70,
  functions: 70,
  branches: 70,
  statements: 70
}
```

### Backend

```javascript
{
  lines: 70,
  functions: 70,
  branches: 60,  // Lower threshold for error branches
  statements: 70
}
```

Tests will **fail** if coverage drops below these thresholds.

---

## 🤖 CI/CD Integration

### GitHub Actions (`.github/workflows/test.yml`)

Automated testing na svaki push/PR:

1. **Frontend Tests**
   - Install dependencies
   - Run unit tests
   - Generate coverage
   - Upload to Codecov

2. **Backend Tests**
   - Install dependencies
   - Run unit tests
   - Generate coverage
   - Upload to Codecov

3. **Type Check**
   - Frontend TypeScript check
   - Backend TypeScript check

### Running CI Locally

```bash
# Run same tests as CI
npm test -- --run
cd server && npm test -- --run
```

---

## 📈 Test Coverage Goals

### Phase 1 (Current) ✅
- ✅ Test infrastructure setup
- ✅ Basic hook tests
- ✅ Reducer tests
- ✅ Utils tests
- ✅ Backend service tests
- ✅ CI/CD pipeline

### Phase 2 (Next)
- ⏳ Component tests (all views)
- ⏳ API route tests (backend)
- ⏳ Middleware tests
- ⏳ Integration tests

### Phase 3 (Future)
- ⏳ E2E tests (Playwright)
- ⏳ Visual regression tests
- ⏳ Performance tests
- ⏳ Accessibility tests

---

## 🐛 Debugging Tests

### Run Single Test File

```bash
npm test src/test/hooks/useOrchestrator.test.ts
```

### Run Tests Matching Pattern

```bash
npm test -- -t "should generate backstory"
```

### Debug in VS Code

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test", "--", "--run"],
  "console": "integratedTerminal"
}
```

### View Coverage in Browser

```bash
npm run test:coverage
open coverage/index.html  # Mac
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

---

## 🎓 Best Practices

### 1. Test Behavior, Not Implementation

❌ **Bad:**
```typescript
expect(component.state.count).toBe(1);
```

✅ **Good:**
```typescript
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

### 2. Use Descriptive Test Names

❌ **Bad:**
```typescript
it('works', () => { ... });
```

✅ **Good:**
```typescript
it('should update agent name when form is submitted', () => { ... });
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should add agent to list', () => {
  // Arrange
  const { result } = renderHook(() => useAgents());
  const newAgent = createMockAgent();

  // Act
  act(() => {
    result.current.addAgent(newAgent);
  });

  // Assert
  expect(result.current.agents).toContainEqual(newAgent);
});
```

### 4. Clean Up After Tests

```typescript
afterEach(() => {
  cleanup(); // From @testing-library/react
  vi.clearAllMocks(); // From vitest
});
```

### 5. Mock External Dependencies

```typescript
vi.mock('../services/api', () => ({
  apiAgents: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue(mockAgent),
  },
}));
```

---

## 📚 Resources

### Documentation
- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### VS Code Extensions
- **Vitest** - Test runner integration
- **Jest Runner** - Run tests from editor
- **Coverage Gutters** - Inline coverage display

---

## 🎯 Next Steps

1. **Run tests:**
   ```bash
   npm test
   cd server && npm test
   ```

2. **Check coverage:**
   ```bash
   npm run test:coverage
   ```

3. **Add more tests:**
   - Copy existing test patterns
   - Follow naming conventions
   - Maintain 70%+ coverage

4. **Set up pre-commit hook:**
   ```bash
   npm install -D husky
   npx husky init
   echo "npm test -- --run" > .husky/pre-commit
   ```

---

**Happy Testing! 🧪✨**
