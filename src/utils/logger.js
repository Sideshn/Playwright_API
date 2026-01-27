// src/utils/logger.js
const fs = require('fs');
const path = require('path');

class CentralizedLogger {
    constructor() {
        // write logs directly under `logs/` (no per-environment subfolder)
        this.logDir = path.join('logs');

        if (!process.env.LOG_RUN_ID) {
            process.env.LOG_RUN_ID = new Date().toISOString().replace(/[:.]/g, '-');
        }
        this.runId = process.env.LOG_RUN_ID;

        this.logFile = path.join(this.logDir, `Api_${this.runId}.log`);

        this.pendingRequests = new Map();
        this.requestCounter = 0;
        this.initialized = false;
    }

    ensureInitialized() {
        if (this.initialized) return;

        try {
            if (!fs.existsSync(this.logDir)) {
                fs.mkdirSync(this.logDir, { recursive: true });
            }

            if (!fs.existsSync(this.logFile)) {
                const header =
                    `${'═'.repeat(80)}\n` +
                    `API TEST EXECUTION STARTED\n` +
                    `Date: ${new Date().toLocaleString()}\n` +
                    `Run ID: ${this.runId}\n` +
                    `${'═'.repeat(80)}\n\n`;

                fs.writeFileSync(this.logFile, header);
            }

            this.initialized = true;
        } catch (err) {
            console.error('❌ Logger initialization failed:', err.message);
        }
    }

    getTimestamp() {
        return new Date().toISOString().replace('T', ' ').substring(0, 23);
    }

    writeToFile(line) {
        try {
            this.ensureInitialized();
            fs.appendFileSync(this.logFile, line + '\n');
        } catch (err) {
            console.error('❌ Failed to write log:', err.message);
        }
    }

    bufferLog(level, message) {
        const timestamp = this.getTimestamp();
        const line = `${timestamp} |${level}| ${message}`;

        console.log(line);
        this.writeToFile(line);
    }

    async info(message) { this.bufferLog('INFO', message); }
    async success(message) { this.bufferLog('SUCCESS', message); }
    async warn(message) { this.bufferLog('WARN', message); }
    async error(message) { this.bufferLog('ERROR', message); }
    async request(message) { this.bufferLog('REQUEST', message); }
    async response(message) { this.bufferLog('RESPONSE', message); }

    async apiRequest(testTitle, method, endpoint) {
        const requestId = ++this.requestCounter;

        this.pendingRequests.set(requestId, {
            testTitle,
            method,
            endpoint,
            timestamp: new Date()
        });

        this.bufferLog('REQUEST', `[${testTitle}] ${method} request to: ${endpoint}`);
        return requestId;
    }

    async apiResponse(requestId, status, responseTime = '') {
        const request = this.pendingRequests.get(requestId);

        if (!request) {
            return this.bufferLog('ERROR', `Missing response mapping for ID: ${requestId}`);
        }

        this.pendingRequests.delete(requestId);

        const timeStr = responseTime ? ` (${responseTime}ms)` : '';
        const message = `[${request.testTitle}] Response Status: ${status}${timeStr}`;
        const level = status >= 400 ? 'ERROR' : status >= 300 ? 'WARN' : 'RESPONSE';

        this.bufferLog(level, message);
    }

    serialize(data) {
        try {
            return JSON.stringify(data, null, 2) + '\n';
        } catch {
            return String(data) + '\n';
        }
    }

    formatBlock(label, obj) {
        return `${label}:\n${this.serialize(obj)}\n`;
    }

    // ⭐⭐⭐ NEW: Add separator after each test
    async addTestSeparator() {
        const separator = '-'.repeat(80);
        this.writeToFile(separator + '\n');
        console.log(separator);
    }

    async finalFlush() {
        try {
            this.ensureInitialized();

            const content = fs.readFileSync(this.logFile, 'utf8');
            const lines = content.split('\n');

            let headerEnd = 0;
            for (let i = 0; i < lines.length; i++) {
                if (i > 0 && lines[i].includes('═'.repeat(10))) {
                    headerEnd = i + 1;
                    break;
                }
            }
            const header = lines.slice(0, headerEnd).join('\n');
            const bodyLines = lines.slice(headerEnd);

            const timestampRegex = /^\d{4}-\d{2}-\d{2}/;
            const entries = [];
            let current = null;

            for (const line of bodyLines) {
                if (!line.trim()) continue;

                if (timestampRegex.test(line)) {
                    if (current) entries.push(current);
                    current = { lines: [line] };
                } else {
                    current.lines.push(line);
                }
            }
            if (current) entries.push(current);

            const testRegex = /\[([^\]]+)\]/;
            const grouped = new Map();

            for (const e of entries) {
                const firstLine = e.lines[0];
                const match = firstLine.match(testRegex);
                const testTitle = match ? match[1] : '__general__';

                if (!grouped.has(testTitle)) grouped.set(testTitle, []);
                grouped.get(testTitle).push(e.lines.join('\n'));
            }

            const sortedEntries = [];
            const separator = '-'.repeat(80);

            // Write each test's grouped items followed by a separator
            for (const [testTitle, items] of grouped.entries()) {
                // join all entries belonging to the same test title
                sortedEntries.push(items.join('\n'));
                // append separator after each test block
                sortedEntries.push(separator);
            }

            const footer =
                `\n${'═'.repeat(80)}\n` +
                `API TEST EXECUTION COMPLETED\n` +
                `Completed at: ${new Date().toLocaleString()}\n` +
                `${'═'.repeat(80)}\n`;

            fs.writeFileSync(this.logFile, header + '\n' + sortedEntries.join('\n') + footer);

            console.log(`✅ Log file finalized: ${path.resolve(this.logFile)}`);

        } catch (err) {
            console.error('❌ Error in finalFlush:', err.message);
        }
    }
}

const loggerInstance = new CentralizedLogger();

/**
 * Hybrid Export:
 * 1. Acts as a function for Playwright globalSetup
 * 2. Acts as the logger object for the rest of the app (via proxy properties)
 */
const loggerExport = async () => {
    console.log(`📋 [Global Setup] Run ID: ${loggerInstance.runId}`);
    return async () => {
        await loggerInstance.finalFlush();
    };
};

// Copy all properties and methods from the logger instance to the export function
Object.assign(loggerExport, loggerInstance);
const proto = Object.getPrototypeOf(loggerInstance);
Object.getOwnPropertyNames(proto).forEach(prop => {
    if (prop !== 'constructor' && typeof loggerInstance[prop] === 'function') {
        loggerExport[prop] = loggerInstance[prop].bind(loggerInstance);
    }
});

// Also copy instance properties that might be set in constructor
Object.keys(loggerInstance).forEach(key => {
    loggerExport[key] = loggerInstance[key];
});

module.exports = loggerExport;
