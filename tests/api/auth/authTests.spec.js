const { test } = require('../../../src/fixtures/apiFixtures');
const excelReader = require('../../../src/utils/excelReader');

test.describe('Authentication API Tests', () => {
  const postRequestsData = excelReader.getTestData('PostRequests');
  const deleteRequestsData = excelReader.getTestData('DeleteRequests');

  test('API 7: POST To Verify Login with valid details', async ({ userClient, apiHelper, schemaValidator }) => {
    const testData = postRequestsData.find(data => data.testCase === 'API 7: POST To Verify Login with valid details');
    const createData = postRequestsData.find(data => data.testCase === 'API 11: POST To Create/Register User Account');
    const deleteData = deleteRequestsData.find(data => data.testCase === 'API 12: DELETE METHOD To Delete User Account');
    const uniqueEmail = `testuser_${Date.now()}@gmail.com`;

    // STEP 1: Create account to test login
    const createPayload = JSON.parse(createData.payload);
    createPayload.email = uniqueEmail;
    const createResponse = await userClient.createAccount(createPayload);
    apiHelper.assertApiResponse(createResponse, Number(createData.expectedStatus), Number(createData.expectedResponseCode), createData.expectedMessage);
    schemaValidator.validateGeneralSuccess(createResponse);
    console.log('DEBUG API 7: Account created successfully');

    // STEP 2: Verify login with the created account
    // Use password from the login test data if provided, otherwise use the password from the created account payload
    const accountPassword = testData.password || (createPayload && createPayload.password);
    const response = await userClient.login(uniqueEmail, accountPassword);
    apiHelper.assertApiResponse(response, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
    schemaValidator.validateGeneralSuccess(response);
    console.log('DEBUG API 7: Login verified successfully');

    // STEP 3: Delete account (cleanup)
    const deleteResponse = await userClient.deleteAccount(uniqueEmail, deleteData.password);
    apiHelper.assertApiResponse(deleteResponse, Number(deleteData.expectedStatus), Number(deleteData.expectedResponseCode), deleteData.expectedMessage);
    schemaValidator.validateGeneralSuccess(deleteResponse);
    console.log('DEBUG API 7: Account deleted successfully');
  });

  test('API 8: POST To Verify Login without email parameter', async ({ userClient, apiHelper, schemaValidator }) => {
    const testData = postRequestsData.find(data => data.testCase === 'API 8: POST To Verify Login without email parameter');
    // Login with empty email to test validation
    const payload = JSON.parse(testData.payload);
    console.log('DEBUG API 8 Payload:', { payload });
    // Call login with empty email and provided password
    const response = await userClient.login(payload.email, payload.password);
    // Debug: print full response
    console.log('DEBUG API 8 Response:', JSON.stringify(response, null, 2));
    apiHelper.assertApiResponse(response, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
    schemaValidator.validateGeneralSuccess(response);
  });

  test('API 9: DELETE To Verify Login', async ({ userClient, apiHelper, schemaValidator }) => {
    const testData = deleteRequestsData.find(data => data.testCase === 'API 9: DELETE To Verify Login');
    const payload = JSON.parse(testData.payload);
    console.log('DEBUG API 9 Delete Payload:', JSON.stringify(payload, null, 2));
    // use the UserClient instance for domain-specific operations
    const deleteResponse = await userClient.deleteVerifyLogin(payload);
    console.log('DEBUG API 9 Delete Response:', JSON.stringify(deleteResponse, null, 2));
    apiHelper.assertApiResponse(deleteResponse, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
    schemaValidator.validateGeneralSuccess(deleteResponse);
  });

  test('API 10: POST To Verify Login with invalid details', async ({ userClient, apiHelper, schemaValidator }) => {
    const testData = postRequestsData.find(data => data.testCase === 'API 10: POST To Verify Login with invalid details');
    const payload = JSON.parse(testData.payload);
    const response = await userClient.login(payload.email, payload.password);
    apiHelper.assertApiResponse(response, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
    schemaValidator.validateGeneralSuccess(response);
  });
  test('API 11: POST To Create/Register User Account', async ({ userClient, apiHelper, schemaValidator }) => {
    const testData = postRequestsData.find(data => data.testCase === 'API 11: POST To Create/Register User Account');
    const deleteData = deleteRequestsData.find(data => data.testCase === 'API 12: DELETE METHOD To Delete User Account');
    const uniqueEmail = `testuser_${Date.now()}@gmail.com`;
    
    await test.step('Create and then delete a user account', async () => {
      // STEP 1: POST (CREATE ACCOUNT)
      const createPayload = JSON.parse(testData.payload);
       createPayload.email = uniqueEmail;
       // Only override password if the test scenario provides one; otherwise keep the password from Excel payload
       if (testData && testData.password) {
         createPayload.password = testData.password;
       }
    const createResponse = await userClient.createAccount(createPayload);
    apiHelper.assertApiResponse(createResponse, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
    schemaValidator.validateGeneralSuccess(createResponse);
    console.log('DEBUG API 11: Account created successfully.');

    // STEP 2: DELETE (DATA CLEANUP / TEARDOWN)
    const deleteResponse = await userClient.deleteAccount(uniqueEmail, deleteData.password);
      
    // Assert successful deletion using Excel data
    apiHelper.assertApiResponse(deleteResponse, Number(deleteData.expectedStatus), Number(deleteData.expectedResponseCode), deleteData.expectedMessage);
    schemaValidator.validateGeneralSuccess(deleteResponse);
    console.log('DEBUG API 11: Data cleanup complete. User deleted successfully.');
    });
  });

  test('API 12: DELETE METHOD To Delete User Account', async ({ userClient, apiHelper, schemaValidator }) => {
    const createData = postRequestsData.find(data => data.testCase === 'API 11: POST To Create/Register User Account');
    const testData = deleteRequestsData.find(data => data.testCase === 'API 12: DELETE METHOD To Delete User Account');
    const uniqueEmail = `testuser_${Date.now()}@gmail.com`;

    console.log('DEBUG API 12 - Using unique email:', uniqueEmail);

    // STEP 1: CREATE the account first (must exist before deleting)
    console.log('DEBUG API 12 - Step 1: Creating account');
    const createPayload = JSON.parse(createData.payload);
    createPayload.email = uniqueEmail;
    
    const createResponse = await userClient.createAccount(createPayload);
    
    console.log('DEBUG API 12 Create Response:', JSON.stringify(createResponse, null, 2));
    apiHelper.assertApiResponse(createResponse, Number(createData.expectedStatus), Number(createData.expectedResponseCode), createData.expectedMessage);
    schemaValidator.validateGeneralSuccess(createResponse);
    
    // STEP 2: DELETE the account (now it exists!)
    console.log('DEBUG API 12 - Step 2: Deleting account');
    const deleteResponse = await userClient.deleteAccount(uniqueEmail, testData.password);
    
    console.log('DEBUG API 12 Delete Response:', JSON.stringify(deleteResponse, null, 2));
    apiHelper.assertApiResponse(deleteResponse, Number(testData.expectedStatus), Number(testData.expectedResponseCode), testData.expectedMessage);
    schemaValidator.validateGeneralSuccess(deleteResponse);
    
    console.log('API 12 complete: Created → Deleted');
  });
});
