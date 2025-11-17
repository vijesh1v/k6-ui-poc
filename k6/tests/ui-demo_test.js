// k6/tests/ui-demo.test.js
import { browser } from 'k6/browser';
import { check } from 'k6';

/**
 * k6 execution options:
 * - Single shared iteration for a simple UI smoke test.
 * - Browser type: Chromium (k6 browser module).
 * - All checks must pass.
 */
export const options = {
  scenarios: {
    ui_smoke: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    checks: ['rate==1.0'],
  },
};

export default async function () {
  const page = await browser.newPage();
  const baseUrl = __ENV.BASE_URL || 'https://example.com/';

  try {
    // Navigate to demo site and wait until fully loaded
    const response = await page.goto(baseUrl, { waitUntil: 'load' });

    // Basic network-level assertion
    check(response, {
      'response is HTTP 200': (r) => r && r.status() === 200,
    });

    // Simple UI-level assertion using page title
    const title = await page.title();
    check(title, {
      'page title contains "Example Domain"': (t) =>
        typeof t === 'string' && t.includes('Example Domain'),
    });

    // Optional: take a screenshot (will be stored in the GitHub Actions workspace)
    await page.screenshot({ path: `./k6/tests/screenshots/example-home.png` });
  } finally {
    await page.close();
  }
}
