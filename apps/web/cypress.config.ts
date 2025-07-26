// path: apps/web/cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    
    // Test isolation
    testIsolation: true,
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0,
    },

    setupNodeEvents(on, config) {
      // Environment-specific configuration
      const environment = config.env.environment || 'local';
      
      if (environment === 'docker') {
        config.baseUrl = 'http://test-runner:3000';
        config.env.apiUrl = 'http://test-runner:3000/api';
        config.env.supabaseUrl = 'http://test-db:54321';
      }

      return config;
    },

    env: {
      // Default environment variables
      apiUrl: 'http://localhost:3000/api',
      supabaseUrl: 'http://localhost:54321',
      supabaseAnonKey: 'test-anon-key',
    },

    // Custom test file patterns
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});