const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const productsListSchema = require('../schemas/responses/productsListSchema.json');
const brandsListSchema = require('../schemas/responses/brandsListSchema.json');
const userDetailSchema = require('../schemas/responses/userDetailSchema.json');
const searchProductSchema = require('../schemas/responses/searchProductSchema.json');
const generalSuccessSchema = require('../schemas/responses/generalSuccessSchema.json');

class SchemaValidator {
    constructor() {
        this.ajv = new Ajv({ allErrors: true });
        addFormats(this.ajv);
    }

    validate(schema, data) {
        const validate = this.ajv.compile(schema);
        const isValid = validate(data);

        if (!isValid) {
            const errorMessages = validate.errors.map(error => `  - ${error.instancePath || 'response'} ${error.message}`).join('\n');
            throw new Error(`Schema validation failed for '${schema.title}':\n${errorMessages}`);
        }
        
        console.log(`SUCCESS: Schema validation passed for '${schema.title}'.`);
        return true;
    }

    validateProductsList(response) {
        if (!response || !response.data) {
            throw new Error(`Validation failed for Products List: Response body is missing.`);
        }
        return this.validate(productsListSchema, response.data);
    }

    validateBrandsList(response) {
        if (!response || !response.data) {
            throw new Error(`Validation failed for Brands List: Response body is missing.`);
        }
        return this.validate(brandsListSchema, response.data);
    }

    validateUserDetails(response) {
        if (!response || !response.data) {
            throw new Error(`Validation failed for User Details: Response body is missing.`);
        }
        return this.validate(userDetailSchema, response.data);
    }

    validateSearchProduct(response) {
        if (!response || !response.data) {
            throw new Error(`Validation failed for Search Product: Response body is missing.`);
        }
        return this.validate(searchProductSchema, response.data);
    }

    validateGeneralSuccess(response) {
        if (!response || !response.data) {
            throw new Error(`Validation failed for General Success: Response body is missing.`);
        }
        return this.validate(generalSuccessSchema, response.data);
    }
}

module.exports = new SchemaValidator();

