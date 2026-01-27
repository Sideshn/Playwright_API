const { ENDPOINTS } = require('../../config/constants');

/**
 * BrandsClient - Handles all brand-related API operations
 * Encapsulates business logic for brand endpoints
 */
class BrandsClient {
    constructor(request, apiHelper) {
        this.request = request;
        this.apiHelper = apiHelper;
    }

    /**
     * Get all available brands
     */
    async getAllBrands() {
        return await this.apiHelper.get(
            this.request,
            ENDPOINTS.BRANDS.LIST,
            {}          // params placeholder (required by APIHelper)
        );
    }

    /**
     * Attempt a PUT on the brands list endpoint
     * (used for negative test)
     */
    async putToList(payload){
        return await this.apiHelper.put(
            this.request,
            ENDPOINTS.BRANDS.LIST,
            payload
        );
    }
}

module.exports = BrandsClient;
