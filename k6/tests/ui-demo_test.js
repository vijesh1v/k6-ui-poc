import { browser } from 'k6/browser';
import { check } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.4/index.js';
import htmlReport from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

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
    const response = await page.goto(baseUrl, { waitUntil: 'load' });

    check(response, {
      'HTTP 200 OK': (r) => r && r.status() === 200,
    });

    const title = await page.title();
    check(title, {
      'Title contains Example Domain': (t) => t.includes('Example Domain'),
    });

    await page.screenshot({ path: `k6/tests/screenshots/example.png` });
  } finally {
    await page.close();
  }
}

/*
 * 🔥 CUSTOM CLIENT-FRIENDLY SUMMARY REPORT
 */
export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),

    'k6/results/ui-summary.html': htmlReport(data),

    'k6/results/ui-summary.json': JSON.stringify(data, null, 2),
  };
}
