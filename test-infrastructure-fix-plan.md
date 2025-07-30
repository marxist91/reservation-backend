# Test Infrastructure Fix Plan

## Current Issues Analysis

### 1. Database Configuration Conflicts
- **Issue**: Two different database configuration systems exist
  - `config/config.json` (used by Sequelize CLI and models/index.js)
  - `config/database.js` (more advanced, environment variable support)
- **Problem**: Test database names are inconsistent:
  - `config.json` uses `"database_test"`
  - `tests/setup.js` expects `"reservation_test_db"`

### 2. Jest Configuration Issues
- **Issue**: `jest.config.js` references setup files but model loading may fail
- **Problem**: Models expect specific database configuration format

### 3. Package.json Test Script
- **Issue**: Main test script shows error instead of running Jest
- **Current**: `"test": "echo \"Error: no test specified\" && exit 1"`
- **Needed**: `"test": "jest"`

### 4. Test Environment Setup
- **Issue**: Environment variables not properly configured for tests
- **Problem**: Tests may fail due to missing or incorrect database connection

## Proposed Solution Architecture

### Phase 1: Database Configuration Unification
1. **Keep `config/config.json` as primary** (Sequelize CLI compatibility)
2. **Enhance with environment variable support**
3. **Standardize test database naming**
4. **Update `tests/setup.js` to match configuration**

### Phase 2: Jest Configuration Updates
1. **Fix test environment setup**
2. **Ensure proper model loading in tests**
3. **Configure test database isolation**
4. **Add proper cleanup mechanisms**

### Phase 3: Test Script Implementation
1. **Update package.json test script**
2. **Create basic smoke test**
3. **Verify test infrastructure works**
4. **Document usage**

## Detailed Implementation Plan

### 1. Fix config/config.json
```json
{
  "development": {
    "username": "marcel_admin",
    "password": "Reservation2025!",
    "database": "reservation_salles",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": "",
    "database": "reservation_test_db",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "logging": false
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

### 2. Update tests/env.js
- Ensure consistent environment variable naming
- Match database configuration with config.json
- Set proper test environment variables

### 3. Update tests/setup.js
- Fix database connection to use consistent naming
- Ensure proper model loading
- Add better error handling

### 4. Update jest.config.js
- Verify setup files are correctly referenced
- Add proper test environment configuration
- Ensure coverage collection works

### 5. Update package.json
- Fix main test script: `"test": "jest"`
- Ensure test-related scripts work properly

### 6. Create Basic Smoke Test
- Create `tests/smoke.test.js`
- Test database connection
- Test model loading
- Test basic functionality

## Expected Outcomes

After implementing these fixes:
1. ✅ `npm test` will run Jest successfully
2. ✅ Test database will connect properly
3. ✅ Models will load correctly in test environment
4. ✅ Basic smoke test will pass
5. ✅ Foundation for comprehensive testing will be established

## Files to Modify

1. `config/config.json` - Fix test database configuration
2. `tests/env.js` - Update environment variables
3. `tests/setup.js` - Fix database connection logic
4. `jest.config.js` - Verify configuration
5. `package.json` - Fix test script
6. `tests/smoke.test.js` - Create basic test (new file)

## Testing Strategy

1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test API endpoints and database interactions
3. **Model Tests**: Test Sequelize models and associations
4. **Authentication Tests**: Test JWT and role-based access

## Next Steps

1. Switch to Code mode to implement the fixes
2. Apply changes systematically following the plan
3. Test each change incrementally
4. Verify the complete testing infrastructure works
5. Document the final setup for future use

## Benefits of This Approach

- **Maintains Sequelize CLI compatibility**
- **Provides robust test environment**
- **Enables comprehensive testing strategy**
- **Follows Node.js/Express best practices**
- **Supports both development and production needs**