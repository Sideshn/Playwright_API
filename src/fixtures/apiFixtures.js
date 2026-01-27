const base = require('@playwright/test');

// --- Import Classes (for instantiation) ---
const APIHelper = require('../helpers/apiHelper');
const UserClient = require('../api/clients/UserClient');
const ProductsClient = require('../api/clients/ProductsClient');
const BrandsClient = require('../api/clients/BrandsClient');

// --- Import Modules (to be returned as-is) ---
const schemaValidator = require('../utils/schemaValidator');
const { BASE_URL } = require('../config/constants');

/**
 * This extends Playwright's base 'test' object with custom fixtures.
 * These fixtures are instantiated or provided once per test worker,
 * ensuring isolated and configured instances for each test.
 */
exports.test = base.test.extend({
  // Expose expect for convenience
  expect: base.expect,

  /**
   * Fixture for APIHelper.
   * Injects testInfo so APIHelper can log test names automatically.
   * testInfo is automatically available in the fixture scope.
   * Uses BASE_URL from config/constants.js (or process.env.BASE_URL override).
   */
  apiHelper: async ({ }, use, testInfo) => {
    await use(new APIHelper(BASE_URL, testInfo));
  },

  /**
   * Fixture for SchemaValidator.
   * Since schemaValidator.js exports a pre-built object,
   * we just pass that object along to the test.
   */
  schemaValidator: async ({}, use) => {
    await use(schemaValidator);
  },

  /**
   * Fixture for UserClient.
   * Uses the built-in 'request' fixture (APIRequestContext)
   * and injects it into the client.
   */
  userClient: async ({ request, apiHelper }, use) => {
    await use(new UserClient(request, apiHelper));
  },

  /**
   * Fixture for ProductsClient.
   */
  productsClient: async ({ request, apiHelper }, use) => {
    await use(new ProductsClient(request, apiHelper));
  },

  /**
   * Fixture for BrandsClient.
   */
  brandsClient: async ({ request, apiHelper }, use) => {
    await use(new BrandsClient(request, apiHelper));
  },
});

// Also expose the fixtures' test/expect as defaults for convenience
exports.expect = base.expect;
// `exports.test` is already set above from `base.test.extend(...)`.