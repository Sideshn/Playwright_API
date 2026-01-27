const { ENDPOINTS } = require('../../config/constants');

/**
 * ProductsClient - Handles all product-related API operations
 * Encapsulates business logic for product endpoints
 */
class ProductsClient {
    constructor(request, apiHelper) {
        this.request = request;
        this.apiHelper = apiHelper;
    }

    /**
     * Get all products from the catalog
     */
    async getAllProducts() {
        return await this.apiHelper.get(
            this.request,
            ENDPOINTS.PRODUCTS.LIST,
            {}         // GET requires params object
        );
    }

    /**
     * Search for products by name
     */
    async searchProducts(searchTerm) {
        return await this.apiHelper.post(
            this.request,
            ENDPOINTS.PRODUCTS.SEARCH,
            { search_product: searchTerm },
            { contentType: 'form' }
        );
    }

    /**
     * Attempt a POST on the products list endpoint (negative test)
     */
    async postToList(payload = {}) {
        return await this.apiHelper.post(
            this.request,
            ENDPOINTS.PRODUCTS.LIST,
            payload,
            { contentType: 'form' }
        );
    }
}

module.exports = ProductsClient;
