import { browser } from 'k6/browser';
import { check } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.4/index.js';

// ✅ FIXED: Use the correct import for HTML reporter
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/2.4.0/dist/bundle.js';

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
  
  // Use the environment variable or default to a test site
  const baseUrl = __ENV.BASE_URL || 'https://test.k6.io/';

  try {
    console.log(`🌐 Navigating to: ${baseUrl}`);
    
    const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });

    check(response, {
      'HTTP 200 OK': (r) => r && r.status() === 200,
    });

    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    check(title, {
      'Title is not empty': (t) => t && t.length > 0,
    });

    // Take screenshot
    await page.screenshot({ 
      path: `k6/tests/screenshots/example-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('✅ Test completed successfully');

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    // Take screenshot on failure
    await page.screenshot({ 
      path: `k6/tests/screenshots/error-${Date.now()}.png`,
      fullPage: true 
    });
    throw error;
  } finally {
    await page.close();
  }
}

export function handleSummary(data) {
  console.log('📊 Generating summary reports...');
  
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'k6/results/ui-summary.html': htmlReport(data),
    'k6/results/ui-summary.json': JSON.stringify(data, null, 2),
  };
}
