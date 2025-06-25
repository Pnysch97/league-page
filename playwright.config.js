import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run build && npm run preview -- --port=4173',
    port: 4173,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  }
});
