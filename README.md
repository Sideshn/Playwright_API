# Playwright API Testing Framework

**Version:** 1.0 (Latest)  
**Last Updated:** December 15, 2025  
**Framework:** Playwright v1.42+  
**Runtime:** Node.js v16+

---

Professional API testing framework using Playwright with industry-standard architecture patterns.

## 🏗️ Architecture

This framework follows the **API Client Pattern** with a clean separation of concerns:

```
c:\playwright/
├── src/                          # Source code (Framework logic)
│   ├── api/
│   │   └── clients/              # API Clients (Business logic layer)
│   │       ├── ProductsClient.js
│   │       ├── BrandsClient.js
│   │       └── UserClient.js
│   ├── fixtures/                 # Playwright fixtures (exposes fixture-based `test`)
│   │   └── apiFixtures.js        # Provides `apiHelper`, `schemaValidator` and client fixtures
│   ├── config/                   # Configuration files
│   │   └── constants.js          # API endpoints
│   ├── helpers/                  # Generic helpers
│   │   └── apiHelper.js          # HTTP wrapper (GET, POST, PUT, DELETE) — exported as a class
│   ├── schemas/
│   │   └── responses/            # JSON Schema definitions
│   │       ├── productsListSchema.json
│   │       ├── brandsListSchema.json
│   │       ├── userDetailSchema.json
│   │       ├── searchProductSchema.json
│   │       ├── errorResponseSchema.json
│   │       └── generalSuccessSchema.json
│   └── utils/                    # Utilities
│       ├── excelReader.js        # Excel data reader
│       ├── logger.js             # Centralized Logger (Hybrid export: Logger + Global Setup)
│       └── schemaValidator.js    # JSON Schema validator (Ajv)
├── tests/                        # Test files
│   └── api/
│       ├── products/             # Product domain tests
│       ├── brands/               # Brand domain tests
│       ├── auth/                 # Authentication tests
│       └── users/                # User management tests
├── data/
│   └── excel/                    # Test data
│       └── apiData.xlsx          # Excel file with 'payload' JSON column
├── reports/                      # Test reports
│   ├── html/
│   └── json/
└── playwright.config.js          # Playwright configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```powershell
# 1) Install dependencies
npm install

# 2) Install Playwright browsers
npx playwright install --with-deps
```

### Running Tests

```powershell
# Run all tests
npx playwright test

# Run specific test suite
npx playwright test tests/api/products/
npx playwright test tests/api/brands/
npx playwright test tests/api/auth/
npx playwright test tests/api/users/

# Run with UI mode
npx playwright test --ui

# Run in headed mode
npx playwright test --headed

# View HTML report
npx playwright show-report
```

## 📊 Data-Driven Testing (Excel)

The framework uses `data/excel/apiData.xlsx` as the single source of truth for test data.

- **Sheets:** `GetRequests`, `PostRequests`, `PutRequests`, `DeleteRequests`
- **Payload Column:** A `payload` column contains the full JSON request body for each test case.
- **Dynamic Overrides:** Tests parse this JSON and override dynamic fields (like `email` or `timestamp`) at runtime.

## 📋 Test Coverage

| API | Test Case | Status |
|-----|-----------|--------|
| Products | Get All Products List | ✅ |
| Products | POST To All Products List (Method Not Allowed) | ✅ |
| Products | Search Product | ✅ |
| Products | Search Without Parameter | ✅ |
| Brands | Get All Brands List | ✅ |
| Brands | PUT To All Brands List (Method Not Allowed) | ✅ |
| Auth | Verify Login (Valid) | ✅ |
| Auth | Verify Login (No Email) | ✅ |
| Auth | Verify Login (Invalid) | ✅ |
| Auth | DELETE To Verify Login (Method Not Allowed) | ✅ |
| Auth | Create User Account | ✅ |
| Auth | Delete User Account | ✅ |
| Users | Update User Account | ✅ |
| Users | Get User Details by Email | ✅ |

**Total: 14 API tests with full JSON Schema validation**

## 🎯 Key Features

### 1. API Client Pattern
- **Separation of Concerns**: Business logic isolated in client classes
- **Reusability**: Common operations centralized
- **Maintainability**: Changes in one place affect all consumers
- **Abstraction**: Tests don't need to know about HTTP details

Example:
```javascript
// Using API Client with Playwright fixtures (Clean)
// tests/api/products/productTests.spec.js
const { test } = require('../../../src/fixtures/apiFixtures');
const excelReader = require('../../../src/utils/excelReader');

test('Get all products', async ({ productsClient }) => {
  const response = await productsClient.getAllProducts();
  // assertions...
});

// vs Direct API Helper (Verbose, discouraged)
// const response = await apiHelper.get(request, '/productsList');
```

### 2. JSON Schema Validation
- **Comprehensive Validation**: All responses validated against JSON schemas
- **Draft-07 Compliant**: Industry-standard schema definitions
- **Automatic Validation**: Integrated into every test
- **Detailed Error Messages**: Pinpoints exact validation failures

### 3. Data-Driven Testing
- **Excel Integration**: Test data managed in `apiData.xlsx`
- **Multiple Sheets**: Organized by HTTP method (GetRequests, PostRequests, etc.)
- **Easy Updates**: Non-technical users can modify test data
- **Centralized Data**: Single source of truth

### 4. Domain-Based Organization
Tests organized by business domain instead of HTTP method:
- ✅ **Good**: `tests/api/products/`, `tests/api/users/`
- ❌ **Avoid**: `tests/api/getRequests/`, `tests/api/postRequests/`

## 🔧 Configuration

## 🧩 Fixture-based setup

- The framework exposes a custom Playwright `test` from `src/fixtures/apiFixtures.js`.
- Fixtures provided include: `apiHelper` (configured instance), `schemaValidator` (validator module), and domain clients such as `userClient`, `productsClient`, `brandsClient`, and `ordersClient`.
- Import the framework test in your test files using:

```javascript
const { test } = require('../../src/fixtures/apiFixtures');
```

- Each test may accept fixtures directly in its parameter list, for example:

```javascript
test('Login user', async ({ userClient, apiHelper, schemaValidator }) => {
  const resp = await userClient.login(email, password);
});
```

This keeps tests concise and centralizes configuration in the fixture factory.

### Environment Variables
Copy `.env.example` to `.env` and customize:

```bash
BASE_URL=<your-api-url-here>
API_DATA_PATH=./data/excel/apiData.xlsx
ENABLE_HTML_REPORT=true
```

### Playwright Configuration
Edit `playwright.config.js` for:
- Parallel execution settings
- Timeout configurations
- Reporter options
- Retry strategies

## 📊 Reports

Reports are generated in the `reports/` directory:
- **HTML Reports**: `reports/html/` (auto-generated by Playwright)
- **JSON Reports**: `reports/json/` (for CI/CD integration)

## 🔄 CI/CD Integration - Jenkins Pipeline

The framework includes a comprehensive Jenkins pipeline for continuous integration and automated test execution.

### Jenkins Setup

#### Prerequisites
1. **Required Jenkins Plugins:**
   - NodeJS Plugin
   - HTML Publisher Plugin
   - Pipeline Plugin (pre-installed with Jenkins)
   - Git Plugin (for SCM integration)

2. **Configure Node.js in Jenkins:**
   - Navigate to: `Manage Jenkins` → `Global Tool Configuration`
   - Under "NodeJS installations", click `Add NodeJS`
   - Name: `NodeJS 18`
   - Version: Select Node.js 18.x or higher
   - Save configuration

#### Creating the Pipeline Job

1. **Create New Pipeline:**
   - Click `New Item` in Jenkins
   - Enter job name (e.g., "Playwright-API-Tests")
   - Select `Pipeline` project type
   - Click OK

2. **Configure Pipeline:**
   - In the job configuration page:
     - **Build Triggers**: Configure as needed (e.g., Poll SCM, GitHub webhook)
     - **Pipeline Section**:
       - Definition: `Pipeline script from SCM`
       - SCM: `Git`
       - Repository URL: Enter your repository URL
       - Branch Specifier: `*/main` (or your branch)
       - Script Path: `Jenkinsfile`
   - Save configuration

### Pipeline Features

The `Jenkinsfile` provides:

#### **Parameterized Builds**
Configure test execution with the following parameters:
- **TEST_SUITE**: Choose specific test suite to run
  - Options: `all`, `auth`, `products`, `brands`, `users`
  - Default: `all`
- **RUN_HEADED**: Run tests in headed mode (with visible browser)
  - Default: `false`
- **UPDATE_SNAPSHOTS**: Update visual snapshots during test run
  - Default: `false`
- **WORKERS**: Number of parallel workers for test execution
  - Default: `4`

#### **Pipeline Stages**

1. **Checkout**: Pulls latest code from repository
2. **Setup Node.js**: Configures Node.js environment
3. **Install Dependencies**: Installs npm packages using `npm ci`
4. **Install Playwright Browsers**: Downloads required browser binaries
5. **Run Tests**: Executes tests based on parameters
6. **Generate Reports**: Creates HTML test reports

#### **Reporting & Artifacts**

The pipeline automatically:
- Archives test reports (`playwright-report/`)
- Archives test results (`test-results/`)
- Archives application logs (`logs/`)
- Publishes HTML report accessible via Jenkins UI
- Sets build status based on test results:
  - ✅ **Success**: All tests passed
  - ⚠️ **Unstable**: Some tests failed (build continues)
  - ❌ **Failure**: Pipeline execution failed

### Running the Pipeline

#### **Method 1: Manual Trigger**
1. Navigate to your pipeline job
2. Click `Build with Parameters`
3. Select desired parameters
4. Click `Build`

#### **Method 2: Automated Triggers**
Configure in job settings:
- **Poll SCM**: Check for changes periodically
  ```
  H/15 * * * *  # Check every 15 minutes
  ```
- **GitHub Webhook**: Trigger on push/PR events
- **Scheduled Builds**: Run at specific times
  ```
  H 2 * * *  # Run daily at 2 AM
  ```

### Viewing Test Reports

After pipeline execution:
1. Navigate to the build in Jenkins
2. Click on `Playwright Test Report` in the sidebar
3. View detailed test results, screenshots, and traces

### Pipeline Configuration

Key configurations in `Jenkinsfile`:

```groovy
environment {
    NODE_VERSION = '18'
    PLAYWRIGHT_BROWSERS_PATH = "${WORKSPACE}/.playwright"
}

options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
    disableConcurrentBuilds()
}
```

### Customization

#### Add Email Notifications
Add to the `post` section in `Jenkinsfile`:

```groovy
post {
    success {
        emailext (
            subject: "✅ Tests Passed: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
            body: "All tests passed successfully. View report: ${env.BUILD_URL}",
            to: 'team@example.com'
        )
    }
    failure {
        emailext (
            subject: "❌ Tests Failed: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
            body: "Tests failed. View report: ${env.BUILD_URL}",
            to: 'team@example.com'
        )
    }
}
```

#### Add Slack Notifications
Install Slack Notification Plugin and add:

```groovy
post {
    success {
        slackSend (
            color: 'good',
            message: "Tests Passed: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}"
        )
    }
}
```

#### Run Specific Test Files
Modify the test command in the pipeline:

```groovy
// Run only specific test file
testCommand += ' tests/api/products/productTests.spec.js'
```

### Troubleshooting

**Issue: Node.js not found**
- Ensure NodeJS plugin is installed
- Verify Node.js is configured in Global Tool Configuration
- Check the name matches "NodeJS 18" in Jenkinsfile

**Issue: Playwright browsers not installing**
- Add system dependencies in Dockerfile/Jenkins agent
- Or use pre-built Playwright Docker image: `mcr.microsoft.com/playwright:latest`

**Issue: Tests failing in Jenkins but passing locally**
- Check environment variables are set correctly
- Verify network access to API endpoints from Jenkins
- Review timeout configurations for CI environment

**Issue: HTML report not displaying**
- Install HTML Publisher Plugin
- Check Jenkins security settings allow HTML/CSS rendering
- Navigate to: `Manage Jenkins` → `Script Console` and run:
  ```groovy
  System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "")
  ```

### Docker-based Jenkins Agent (Optional)

For consistent environment, use Playwright Docker image:

```groovy
pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.42.0-focal'
            args '-u root'
        }
    }
    // ... rest of pipeline
}
```

## 🧪 Adding New Tests

### 1. Create a New API Client
```javascript
// src/api/clients/OrdersClient.js
const { ENDPOINTS } = require('../../config/constants');

class OrdersClient {
  constructor(request, apiHelper) {
    this.request = request;
    this.apiHelper = apiHelper;
  }

  async createOrder(orderData) {
    return await this.apiHelper.post(this.request, ENDPOINTS.ORDERS.CREATE, orderData);
  }
}

module.exports = OrdersClient;
```

### 2. Add Test Data to Excel
Update `data/excel/apiData.xlsx` with new test case data.

### 3. Create JSON Schema
```json
// src/schemas/responses/orderSchema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Order Response",
  "type": "object",
  "required": ["orderId", "status"],
  "properties": {
    "orderId": { "type": "number" },
    "status": { "type": "string" }
  }
}
```

### 4. Write the Test (use fixtures)
```javascript
// tests/api/orders/orderTests.spec.js
const { test } = require('../../src/fixtures/apiFixtures');

test('Create Order', async ({ ordersClient }) => {
  const response = await ordersClient.createOrder(orderData);
  // Add assertions...
});
```

Note: `ordersClient` should be exposed by the fixture factory (`src/fixtures/apiFixtures.js`).

## 📦 Dependencies

- **@playwright/test**: Test runner and API client
- **xlsx**: Excel file reading
- **ajv**: JSON Schema validation
- **ajv-formats**: Extended format validation (email, date, etc.)

## 🤝 Contributing

1. Follow the existing folder structure
2. Add JSON schemas for new endpoints
3. Update Excel data files for new test cases
4. Write tests using API Clients (not direct apiHelper calls)
5. Ensure all tests pass before committing

## 📝 License

This project is licensed under the MIT License.

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev/)
- [JSON Schema Specification](https://json-schema.org/)
- [Automation Exercise API](https://automationexercise.com/api_list)

---

**Built with Playwright and modern API testing best practices**

---

## Retry Strategy (framework-level)

- **Where implemented:** `src/helpers/apiHelper.js` uses the `p-retry` library to wrap all HTTP calls via a `_retryWrapper` method.
- **Behavior:** On transient failures the helper will retry the action up to **2 times** (config: `retries: 2`) with exponential backoff (`factor: 2`, `minTimeout: 300ms`, `maxTimeout: 1000ms`).
- **Logging:** Each retry attempt and any attempt-level error are logged through the centralized logger (you will see `Retry attempt N for: ...` and `Attempt N failed for: ...` entries in the consolidated log).
- **Playwright integration:** `playwright.config.js` is configured to capture `trace` and `video` on the first retry, which helps debugging flaky failures.

You can exercise the retry logic locally via the helper script: `node tools/test-retry.js` — this will run a small simulated action that fails once and then succeeds, producing retry log lines and finalizing the consolidated log file.

## Logging and Consolidated Log File

- **Centralized logger:** `src/utils/logger.js` provides a single, run-scoped logger instance that all workers write to. The logger:
  - Creates a single file per run using the `LOG_RUN_ID` (set by the global setup). Example: `logs/Api_<RUN_ID>.log`.
  - Performs synchronous appends during test execution to avoid lost lines when multiple Playwright workers write concurrently.
  - Exposes methods: `apiRequest(testTitle, method, endpoint)` and `apiResponse(requestId, status, responseTime)` plus `info`, `error`, `response`, etc., which the helpers use to tag and group logs.
  - On teardown it runs a `finalFlush()` pass that reconstructs multi-line log entries, groups them by test title, sorts them, deduplicates exact duplicate blocks, and writes a final consolidated, human-readable log that includes per-test separators.

- **Separator format:** After each test block the final log includes an 80-character dashed separator line (`--------------------------------------------------------------------------------`) so test boundaries are visually clear.

- **Where to find logs:** `logs/Api_<RUN_ID>.log` — the logger prints the finalized path when done.

If you need strict runtime ordering (one test must fully finish before another starts), run tests serially (`npx playwright test --workers=1`) or mark suites with `test.describe.serial()`; the logger's final reordering does not change real-time parallel execution.
