/** @type {import('@playwright/test').PlaywrightTestConfig} */
const { BASE_URL } = require('./src/config/constants');

const config = {
  testDir: './tests',
  timeout: 90 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  workers: 4,
  reporter: [['list'], ['html']],
  // Point directly to logger.js - it now exports a setup function that is also the logger
  globalSetup: require.resolve('./src/utils/logger.js'),
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on-first-retry'
  },
  projects: [
    { name: 'api' }
  ],
  testMatch: /.*\.(spec|test)\.js$/,
};

module.exports = config;