const { test } = require('../../../src/fixtures/apiFixtures');
const excelReader = require('../../../src/utils/excelReader');

test.describe('User Management API Tests', () => {
  const getRequestsData = excelReader.getTestData('GetRequests');
  const postRequestsData = excelReader.getTestData('PostRequests');
  const putRequestsData = excelReader.getTestData('PutRequests');
  const deleteRequestsData = excelReader.getTestData('DeleteRequests');

  test('API 13: PUT METHOD To Update User Account', async ({ userClient, apiHelper, schemaValidator }) => {
    const createData = postRequestsData.find(data => data.testCase === 'API 11: POST To Create/Register User Account');
    const testData = putRequestsData.find(data => data.testCase === 'API 13: PUT METHOD To Update User Account');
    const deleteData = deleteRequestsData.find(data => data.testCase === 'API 12: DELETE METHOD To Delete User Account');
    
    if (!testData || !createData || !deleteData) {
      throw new Error('Required test data not found in Excel sheets');
    }

    const timestamp = Date.now();
    const uniqueEmail = `testuser_${Date.now()}@gmail.com`;

    console.log('DEBUG API13 - Using unique email:', uniqueEmail);

    // Step 1: CREATE the account
    console.log('DEBUG API13 - Step 1: Creating account');
    const createPayload = JSON.parse(createData.payload);
    createPayload.email = uniqueEmail;
    
    const createResponse = await userClient.createAccount(createPayload);
    
    console.log('DEBUG API13 Create Response:', JSON.stringify(createResponse, null, 2));
    
    apiHelper.assertApiResponse(createResponse, Number(createData.expectedStatus), Number(createData.expectedResponseCode), createData.expectedMessage);
    schemaValidator.validateGeneralSuccess(createResponse);

    // Step 2: UPDATE the account
    console.log('DEBUG API13 - Step 2: Updating account');
    const updatePayload = JSON.parse(testData.payload);
    updatePayload.email = uniqueEmail;

    console.log('DEBUG API13 Update Payload:', JSON.stringify(updatePayload, null, 2));

    const updateResponse = await userClient.updateAccount(updatePayload);
    
    console.log('DEBUG API13 Update Response:', JSON.stringify(updateResponse, null, 2));
    
    apiHelper.assertApiResponse(updateResponse, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
    schemaValidator.validateGeneralSuccess(updateResponse);

    // Step 3: DELETE account (cleanup)
    console.log('DEBUG API13 - Step 3: Deleting account (cleanup)');
    
    // Use payload from Excel for DELETE request
    const deletePayload = JSON.parse(deleteData.payload);
    
    // We use the dynamic email, but take the password from the Excel payload
    const deleteResponse = await userClient.deleteAccount(uniqueEmail, deletePayload.password);
    
    console.log('DEBUG API13 Delete Response:', JSON.stringify(deleteResponse, null, 2));
    apiHelper.assertApiResponse(deleteResponse, Number(deleteData.expectedStatus), Number(deleteData.expectedResponseCode), deleteData.expectedMessage);
    schemaValidator.validateGeneralSuccess(deleteResponse);

    console.log(' API 13 complete: Created → Updated → Deleted');
  });

  test('API 14: GET user account detail by email', async ({ userClient, apiHelper, schemaValidator }) => {
    const testData = getRequestsData.find(data => data.testCase === 'API 14: GET user account detail by email');
    
    const response = await userClient.getUserByEmail(testData.email);
    
    apiHelper.assertApiResponse(response, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
    schemaValidator.validateUserDetails(response);
  });
});
