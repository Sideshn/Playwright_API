#  Architecture Diagrams

**Framework Version:** 1.0  
**Documentation Updated:** December 15, 2025  
**Status:** ✅ Production Ready

---
┌───────────────────────────────────────────────────────────┐
│                        TEST LAYER                         │
│  tests/api/{products|brands|auth|users}/*.spec.js         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Products │  │  Brands  │  │   Auth   │  │  Users   │   │
│  │  Tests   │  │  Tests   │  │  Tests   │  │  Tests   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼─────────┘
                │             │             │             │
                │  Uses       │  Uses       │  Uses       │  Uses
                ▼             ▼             ▼             ▼
┌────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                     │
│           src/api/clients/*Client.js (class-based)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │ Products │  │  Brands  │  │      UserClient          │  │
│  │  Client  │  │  Client  │  │  (Auth + User Mgmt)      │  │
│  │ (class)  │  │ (class)  │  │  (class)                 │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────────────────────┘  │
└───────┼─────────────┼─────────────┼────────────────────────┘
                │             │             │
                │  Calls      │  Calls      │  Calls
                ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                   HTTP ABSTRACTION LAYER                    │
│                src/helpers/apiHelper.js (class exported)    │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌────────┐                   │
│  │ GET  │  │ POST │  │ PUT  │  │ DELETE │                   │
│  └───┬──┘  └───┬──┘  └───┬──┘  └───┬────┘                   │
│                                                             │
│  - Exposes: get/post/put/delete helpers                     │
│  - Handles headers, content-type, debug logging             │
│  - Instantiated by the Playwright fixture factory so tests  │
│    and clients receive a configured instance (baseURL,      │
│    default headers).                                        │
└──────┼─────────┼─────────┼─────────┼────────────────────────┘
               │         │         │         │
               └─────────┴─────────┴─────────┘
                               │
                               ▼             
                       [External API]
               https://automationexercise.com/api


┌────────────────────────────────────────────────────────────────────────────┐
│                   SUPPORTING LAYERS                                        │
├────────────────────────────────────────────────────────────────────────────┤
│  VALIDATION:  src/utils/schemaValidator.js                                 │
│               src/schemas/responses/*.json                                 │
├────────────────────────────────────────────────────────────────────────────┤
│  DATA:        src/utils/excelReader.js                                     │
│               data/excel/apiData.xlsx                                      │
│               - Contains 'payload' column with full JSON request bodies    │
│               - Tests parse JSON and override dynamic fields (email, etc.) │
├────────────────────────────────────────────────────────────────────────────┤
│  LOGGING:     src/utils/logger.js                                          │
│               - Hybrid Export: Acts as Logger instance AND Global Setup    │
│               - Centralized single-file logger per run (LOG_RUN_ID)        │
│               - Synchronous appends during execution, finalFlush() merges  │
│                 and groups entries by test title, adds separators.         │
├────────────────────────────────────────────────────────────────────────────┤
│  RETRIES:     src/helpers/apiHelper.js                                     │
│               - Uses `p-retry` to retry transient HTTP failures (retries:2)│
│               - Logs retry attempts and per-attempt errors via logger      │
├────────────────────────────────────────────────────────────────────────────┤
│  CONFIG:      src/config/constants.js                                      │
│               .env                                                         │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagram (updated)

### Example: User Login Flow (fixture-based)

```
1. TEST INITIATES (fixture-based)
       ┌─────────────────────────────────────────────────────────────────────────────┐
       │ tests/api/auth/authTests.spec.js                                            │
       │                                                                             │
       │ const { test } = require('../../src/fixtures/apiFixtures');                 │
       │ const excelReader = require('../../src/utils/excelReader');                 │
       │                                                                             │
       │ test('Login user', async ({ userClient, apiHelper, schemaValidator }) => {  │
       │    const resp = await userClient.login(email, password);                    │
       │ });                                                                         │
       └─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
2. API CLIENT PROCESSES
       ┌───────────────────────────────────────────────────────────┐
       │ src/api/clients/UserClient.js                             │
       │ (class, constructed via fixture with request + apiHelper) │
       │                                                           │
       │ class UserClient {                                        │
       │   constructor(request, apiHelper) {                       │
       │     this.request = request;                               │
       │     this.apiHelper = apiHelper;                           │
       │   }                                                       │
       │   async login(email, password) {                          │
       │     return this.apiHelper.post(this.request,              │
       │       ENDPOINTS.AUTH.VERIFY_LOGIN,                        │
       │       { email, password }, { contentType: 'form' });      │
       │   }                                                       │
       │ }                                                         │
       └───────────────────────────────────────────────────────────┘
                                    │
                                    ▼
3. API HELPER SENDS REQUEST
       ┌─────────────────────────────────────────────────────────────────┐
       │ src/helpers/apiHelper.js (instantiated by fixture)              │
       │                                                                 │
       │ async post(request, endpoint,                                   │
       │           payload, options) {                                   │
       │   const url = baseURL + endpoint                                │
       │   const response = await request.post(url, optionsWithPayload); │
       │   return {status: response.status, data: response.data};        │
       │ }                                                               │
       └────────────┬────────────────────────────────────────────────────┘
                                    │
                                    ▼
```
## Pattern Comparison

### New Pattern (API Client)

```
Test File
       │
       │ Clean, semantic call:
       ▼
userClient.login(request, email, password)
       │
       ▼
UserClient (API Client)
       │
       │ Encapsulates:
       │ - Endpoint path
       │ - HTTP method
       │ - Headers
       │ - Payload structure
       ▼
apiHelper.post(request, '/verifyLogin',
                        {email, password},
                        {contentType: 'form'})
       │
       ▼
External API


**Benefits:**
- Test is clean and focused
- Reusable business logic
- Easy to maintain
- Single source of truth
├─── tests/                  ◄─── TEST FILES (domain-organized)
│    └─── api/
│         ├─── products/
│         │    └─── productTests.spec.js
│         ├─── brands/
│         │    └─── brandTests.spec.js
│         ├─── auth/
│         │    └─── authTests.spec.js
│         └─── users/
│              └─── userTests.spec.js
│
├─── data/                   ◄─── TEST DATA
│    └─── excel/
│         └─── apiData.xlsx
│
├─── docs/                   ◄─── Documentation (architecture, README, playbook)
├─── .github/                ◄─── CI workflows
├─── playwright.config.js    ◄─── Playwright runner config
└─── package.json            ◄─── Dev scripts and dependencies
```

---

## Quick migration summary (what changed)
- Converted API clients to classes accepting `request` in constructor.
- Updated tests to instantiate clients in `beforeEach` and remove per-call `request` args.
- Replaced direct `apiHelper` calls inside tests with client instance methods (added small helpers for previously direct checks like invalid methods).
- Removed duplicate test data and temporary scripts used for migration.
- Made `excelReader` explicit (env override + fail-fast) to avoid silent fallbacks.

---

## Recommendations / Next housekeeping steps
- Add a short README snippet showing the new client usage pattern (instantiate in `beforeEach`).
- Add `package.json` convenience scripts (e.g., `test:api`) and a CI job if missing.
- Optionally add ESLint/Prettier for consistent style.

---

## Final note
This document now reflects the current, class-based API client architecture plus the data-driven setup and the few migration decisions (removed duplicates, helper scripts, and added small client helpers). If you'd like, I can also update any other docs that still show the old `apiHelper`-first examples (I can search and replace examples across `docs/` and `README.md`).┐───────────────────────────────────────────────────────────┐
│                        TEST LAYER                         │
│  tests/api/{products|brands|auth|users}/*.spec.js         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Products │  │  Brands  │  │   Auth   │  │  Users   │   │
│  │  Tests   │  │  Tests   │  │  Tests   │  │  Tests   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼─────────┘
       │             │             │             │
       │  Uses       │  Uses       │  Uses       │  Uses
       ▼             ▼             ▼             ▼
┌────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                     │
│           src/api/clients/*Client.js (class-based)         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │ Products │  │  Brands  │  │      UserClient          │  │
│  │  Client  │  │  Client  │  │  (Auth + User Mgmt)      │  │
│  │ (class)  │  │ (class)  │  │  (class)                 │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────────────────────┘  │
└───────┼─────────────┼─────────────┼────────────────────────┘
       │             │             │
       │  Calls      │  Calls      │  Calls
       ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                   HTTP ABSTRACTION LAYER                    │
│                src/helpers/apiHelper.js                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌────────┐                   │
│  │ GET  │  │ POST │  │ PUT  │  │ DELETE │                   │
│  └───┬──┘  └───┬──┘  └───┬──┘  └───┬────┘                   │
└──────┼─────────┼─────────┼─────────┼────────────────────────┘
       │         │         │         │
       └─────────┴─────────┴─────────┘
                  │
                  ▼
           [External API]
       (see BASE_URL in src/config/constants.js)



┌────────────────────────────────────────────────────────────────────────────┐
│                   SUPPORTING LAYERS                                        │
├────────────────────────────────────────────────────────────────────────────┤
│  VALIDATION:  src/utils/schemaValidator.js                                 │
│               src/schemas/responses/*.json                                 │
├────────────────────────────────────────────────────────────────────────────┤
│  DATA:        src/utils/excelReader.js                                     │
│               data/excel/apiData.xlsx                                      │
│               (supports API_DATA_PATH env var; fail-fast on missing file)  │
├────────────────────────────────────────────────────────────────────────────┤
│  CONFIG:      src/config/constants.js                                      │
│               .env                                                         │
└────────────────────────────────────────────────────────────────────────────┘
```
        │    └──► xlsx (Excel reader)         │
        └─────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────┐
│ Excel File   │
│ apiData.xlsx │
└──────┬───────┘
       │
       │ Read by
       ▼
┌────────────────┐
│ excelReader.js │
└──────┬─────────┘
       │
       │ Provides data to
       ▼
┌─────────────────┐      ┌──────────────┐
│   Test File     │─────►│ API Client   │
└─────────────────┘      └──────┬───────┘
                                │
                                │ Calls
                                ▼
                         ┌──────────────┐
                         │  apiHelper   │
                         └──────┬───────┘
                                │
                                │ Sends HTTP
                                ▼
                         ┌──────────────┐
                         │ External API │
                         └──────┬───────┘
                                │
                                │ Returns response
                                ▼
                         ┌────────────────┐
                         │ schemaValidator│
                         └──────┬─────────┘
                                │
                                │ Uses schemas
                                ▼
                         ┌──────────────┐
                         │ *.json files │
                         └──────┬───────┘
                                │
                                │ Validates
                                ▼
                         ┌──────────────┐
                         │ Test Passes/ │
                         │    Fails     │
                         └──────────────┘
```

---

## Domain Organization

### Test Organization by Business Domain

```
DOMAIN STRUCTURE
├─── PRODUCTS DOMAIN
│    ├─── Client: ProductsClient.js
│    ├─── Tests: products/productTests.spec.js
│    ├─── Schemas: productsListSchema.json
│    │             searchProductSchema.json
│    └─── Excel: GetRequests, PostRequests sheets
│
├─── BRANDS DOMAIN
│    ├─── Client: BrandsClient.js
│    ├─── Tests: brands/brandTests.spec.js
│    ├─── Schema: brandsListSchema.json
│    └─── Excel: GetRequests, PutRequests sheets
│
└─── USER DOMAIN
     ├─── Client: UserClient.js (handles both Auth & User Mgmt)
     ├─── Tests:
     │    ├─── auth/authTests.spec.js (login, create, delete)
     │    └─── users/userTests.spec.js (get, update)
     ├─── Schemas: userDetailSchema.json
     │             generalSuccessSchema.json
     └─── Excel: PostRequests, PutRequests, DeleteRequests sheets
```

---

## Pattern Comparison

### Old Pattern (Direct API Helper)

```
Test File
    │
    │ Direct call with ALL details:
    │ - Endpoint path
    │ - HTTP method
    │ - Headers
    │ - Payload structure
    ▼
apiHelper.post(request, '/verifyLogin',
               {email, password},
               {contentType: 'form'})
    │
    ▼
External API
```

**Issues:**
- Test knows too much
- No reusability
- Difficult to maintain

---

### New Pattern (API Client)

```
Test File
    │
    │ Clean, semantic call:
    ▼
userClient.login(request, email, password)
    │
    ▼
UserClient (API Client)
    │
    │ Encapsulates:
    │ - Endpoint path
    │ - HTTP method
    │ - Headers
    │ - Payload structure
    ▼
apiHelper.post(request, '/verifyLogin',
               {email, password},
               {contentType: 'form'})
    │
    ▼
External API
```

**Benefits:**
- Test is clean and focused
- Reusable business logic
- Easy to maintain
- Single source of truth

---

## 🔄 Test Execution Flow

```
1. PLAYWRIGHT TEST RUNNER STARTS
   │
   ├─► Reads: playwright.config.js
   ├─► Loads: test files from tests/api/**/*.spec.js
   │
   ▼

2. TEST FILE INITIALIZES
   │
   ├─► Imports: API Clients
   ├─► Imports: Validators
   ├─► Loads: Excel data
   │
   ▼

3. TEST EXECUTES
   │
   ├─► Step 1: Call API Client method
   │            userClient.login(...)
   │
   ├─► Step 2: API Client calls apiHelper
   │            apiHelper.post(...)
   │
   ├─► Step 3: apiHelper makes HTTP request
   │            request.post(url, options)
   │
   ├─► Step 4: Receive response
   │            {status: 200, data: {...}}
   │
   ├─► Step 5: Validate response
   │            schemaValidator.validate(...)
   │
   └─► Step 6: Assert expectations
                expect(status).toBe(200)
   │
   ▼

4. REPORT GENERATED
   │
   ├─► HTML Report: reports/html/
   ├─► JSON Report: reports/json/
   └─► Terminal Output: Pass/Fail summary
```

---

## Benefits Visualization
### After (Centralized Logic)

```
     Test 1        Test 2        Test 3        Test 4
       │             │             │             │
       │             │             │             │
       └─────────────┴─────────────┴─────────────┘
                             │
                             ▼
                       UserClient.login()
                            (ONE location)
                             │
                             ▼
                         apiHelper
```

**Benefits:**
-  Logic in ONE place
-  Change once, affects all
-  Low maintenance cost
---

## Summary

**The new architecture provides:**

- Clear separation of concerns (layers)  
- Reusable business logic (API Clients)  
- Easy maintenance (centralized)  
- Scalable structure (domain-based)  
- Professional quality (industry standard)  

**Your framework now follows the same architectural patterns used by Fortune 500 companies!** 
