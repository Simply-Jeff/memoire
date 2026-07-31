import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'AUTH_URL=http://localhost:3000 AUTH_SECRET=falskjdfalskdjfaslkdjflkasdjf AUTH_TRUST_HOST=true NEXT_PUBLIC_WS_URL=ws://localhost:8080 npm run dev -- --webpack',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
