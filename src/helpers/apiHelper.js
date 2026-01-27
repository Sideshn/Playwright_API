const logger = require('../utils/logger');
const { BASE_URL } = require('../config/constants');

// import p-retry (supports both ESM & CJS default export shapes)
const pRetryModule = require('p-retry');
const pRetry = pRetryModule.default || pRetryModule;

class APIHelper {
    constructor(baseURL = BASE_URL, testInfo = null) {
        this.baseURL = baseURL;
        this.testTitle = testInfo?.title || 'Unnamed Test';
    }

    /** Logger wrapper */
    async _log(level, message, requestId = null) {
        const valid = ['info', 'success', 'warn', 'error', 'request', 'response'];
        const fn = valid.includes(level) ? logger[level].bind(logger) : logger.info.bind(logger);
        return fn(`[${this.testTitle}] ${message}`, requestId);
    }

    /** Retry wrapper */
    async _retry(fn, desc) {
        return pRetry(async (attempt) => {
            if (attempt > 1) await this._log('info', `Retry attempt ${attempt} for ${desc}`);
            try {
                return await fn();
            } catch (err) {
                await this._log('error', `Attempt ${attempt} failed: ${desc} | ${err.message}`);
                throw err;
            }
        }, {
            retries: 2,
            factor: 2,
            minTimeout: 300,
            maxTimeout: 1000
        });
    }

    /** Build request options: JSON or form depending on `options.contentType` */
    _buildRequestOptions(method, payload, options) {
        const headers = { Referer: this.baseURL };

        if (method === 'GET') return {};

        if (options?.contentType === 'form') {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            return { form: payload, headers };
        }

        headers['Content-Type'] = 'application/json';
        return { data: payload, headers };
    }

    /** Centralized request execution with retry & logging */
    async _request(method, request, endpoint, payload = {}, options = {}) {
        return this._retry(async () => {
            const url = `${this.baseURL}${endpoint}`;
            const requestId = await logger.apiRequest(this.testTitle, method, url);

            const reqOptions = this._buildRequestOptions(method, payload, options);
            const start = Date.now();

            let response;
            if (method === 'GET') {
                response = await request.get(url, { params: payload });
            } else if (method === 'DELETE') {
                response = await request.delete(url, reqOptions);
            } else if (method === 'PUT') {
                response = await request.put(url, reqOptions);
            } else {
                response = await request.post(url, reqOptions);
            }

            const time = Date.now() - start;
            const status = response.status();
            const data = await this._parse(response);

            // Log payload when present
            if (payload && Object.keys(payload).length) {
                await this._log('info', logger.formatBlock('Payload', payload), requestId);
            }

            await logger.apiResponse(requestId, status, time);
            await this._log(status >= 400 ? 'error' : 'response',
                logger.formatBlock("Response Data", data),
                requestId
            );

            return { status, data };
        }, `${method} ${endpoint}`);
    }

    /** Public request methods */
    get(request, endpoint, params = {}) {
        return this._request('GET', request, endpoint, params);
    }

    post(request, endpoint, payload = {}, options = {}) {
        return this._request('POST', request, endpoint, payload, options);
    }

    put(request, endpoint, payload = {}, options = {}) {
        return this._request('PUT', request, endpoint, payload, options);
    }

    delete(request, endpoint, payload = {}, options = {}) {
        return this._request('DELETE', request, endpoint, payload, options);
    }

    /** Parse response body (JSON if possible) */
    async _parse(response) {
        try { return await response.json(); }
        catch { return await response.text(); }
    }

    /** Assertion utility for API responses */
    assertApiResponse(response, expStatus, expCode, expMessage) {
        const errors = [];

        if (response.status !== expStatus)
            errors.push(`Status: expected ${expStatus}, got ${response.status}`);

        if (response.data?.responseCode !== expCode)
            errors.push(`responseCode: expected ${expCode}, got ${response.data?.responseCode}`);

        if (expMessage && response.data?.message !== expMessage)
            errors.push(`Message: expected "${expMessage}", got "${response.data?.message}"`);

        if (errors.length) {
            this._log('error', `AssertionFailed: ${errors.join(' | ')}`);
            throw new Error(errors.join(' | '));
        }
    }
}

module.exports = APIHelper;
