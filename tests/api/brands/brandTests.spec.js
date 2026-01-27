const { test } = require('../../../src/fixtures/apiFixtures');
const excelReader = require('../../../src/utils/excelReader');

test.describe('Brands API Tests', () => {
  const getRequestsData = excelReader.getTestData('GetRequests');
  const putRequestsData = excelReader.getTestData('PutRequests');

  test('API 3: Get All Brands List', async ({ brandsClient, apiHelper, schemaValidator }) => {
    const testData = getRequestsData.find(data => data.testCase === 'API 3: Get All Brands List');
    const response = await brandsClient.getAllBrands();
    apiHelper.assertApiResponse(response, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
    schemaValidator.validateBrandsList(response);
  });

  test('API 4: PUT To All Brands List', async ({ brandsClient, apiHelper, schemaValidator }) => {
    const testData = putRequestsData.find(data => data.testCase === 'API 4: PUT To All Brands List');
    
    if (!testData) {
      throw new Error('Test case "API 4: PUT To All Brands List" not found in PutRequests sheet');
    }
    
    // This test verifies that PUT is not allowed on brands list endpoint
    // use the BrandsClient instance instead of directly calling apiHelper
    const response = await brandsClient.putToList(JSON.parse(testData.payload));
    console.log('DEBUG API4 PUT Response:', JSON.stringify(response, null, 2));
    apiHelper.assertApiResponse(response, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
    schemaValidator.validateGeneralSuccess(response);
  });
});
