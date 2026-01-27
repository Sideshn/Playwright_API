const { ENDPOINTS } = require('../../config/constants');

/**
 * UserClient - Handles all user and authentication-related API operations
 * Encapsulates business logic for user management and auth endpoints
 */
class UserClient {
    constructor(request, apiHelper) {
        this.request = request;
        this.apiHelper = apiHelper;
    }

    /**
     * Create a new user account
     */
    async createAccount(userData) {
        return await this.apiHelper.post(
            this.request,
            ENDPOINTS.AUTH.CREATE_ACCOUNT,
            userData,
            { contentType: 'form' }
        );
    }

    /**
     * Login user with credentials
     */
    async login(email, password) {
        return await this.apiHelper.post(
            this.request,
            ENDPOINTS.AUTH.VERIFY_LOGIN,
            { email, password },
            { contentType: 'form' }
        );
    }

    /**
     * Delete a user account
     */
    async deleteAccount(email, password) {
        return await this.apiHelper.delete(
            this.request,
            ENDPOINTS.AUTH.DELETE_ACCOUNT,
            { email, password },
            { contentType: 'form' }
        );
    }

    /**
     * Attempt DELETE on verify-login (negative test)
     */
    async deleteVerifyLogin(payload = {}) {
        return await this.apiHelper.delete(
            this.request,
            ENDPOINTS.AUTH.VERIFY_LOGIN,
            payload,
            { contentType: 'form' }
        );
    }

    /**
     * Get user details by email
     */
    async getUserByEmail(email) {
        return await this.apiHelper.get(
            this.request,
            ENDPOINTS.USER.GET_DETAILS,
            { email }
        );
    }

    /**
     * Update user account information
     */
    async updateAccount(userData) {
        return await this.apiHelper.put(
            this.request,
            ENDPOINTS.USER.UPDATE_ACCOUNT,
            userData,
            { contentType: 'form' }
        );
    }
}

module.exports = UserClient;
