const { test } = require('../../../src/fixtures/apiFixtures');
const excelReader = require('../../../src/utils/excelReader');

test.describe('Products API Tests', () => {
  const getRequestsData = excelReader.getTestData('GetRequests');
  const postRequestsData = excelReader.getTestData('PostRequests');

  test('API 1: Get All Products List', async ({ productsClient, apiHelper, schemaValidator }) => {
    const testData = getRequestsData.find(data => data.testCase === 'API 1: Get All Products List');
    const response = await productsClient.getAllProducts();
    apiHelper.assertApiResponse(response, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
    schemaValidator.validateProductsList(response);
  });

  test('API 2: POST To All Products List', async ({ productsClient, apiHelper, schemaValidator }) => {
    const testData = postRequestsData.find(data => data.testCase === 'API 2: POST To All Products List');
    // This test verifies that POST is not allowed on products list endpoint
    // Use payload from Excel if present
    const payload = testData && testData.payload ? JSON.parse(testData.payload) : {};
    const response = await productsClient.postToList(payload);
    apiHelper.assertApiResponse(response, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
    schemaValidator.validateGeneralSuccess(response);
  });

  test('API 5: POST To Search Product', async ({ productsClient, apiHelper, schemaValidator }) => {
    const testData = postRequestsData.find(data => data.testCase === 'API 5: POST To Search Product');
    // Use payload from Excel if present
    const payload = testData && testData.payload ? JSON.parse(testData.payload) : { search_product: testData.search_product };
    const response = await productsClient.searchProducts(payload.search_product);
    apiHelper.assertApiResponse(response, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
    schemaValidator.validateSearchProduct(response);
  });

  test('API 6: POST To Search Product without search_product parameter', async ({ productsClient, apiHelper, schemaValidator }) => {
    const testData = postRequestsData.find(data => data.testCase === 'API 6: POST To Search Product without search_product parameter');
    // Use payload from Excel if present
    const payload = testData && testData.payload ? JSON.parse(testData.payload) : { search_product: '' };
    const response = await productsClient.searchProducts(payload.search_product);
    apiHelper.assertApiResponse(response, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
  });
});
