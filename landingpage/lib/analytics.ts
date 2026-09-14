/**
 * Client-side Telemetry & Analytics Utility for Smart Teacher Schedule
 */

export function trackDownload(platform: string, version: string = '2.0.0', source: string = 'Website Direct') {
  try {
    if (typeof window === 'undefined') return;
    fetch('/api/analytics/downloads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform,
        version,
        source
      })
    }).catch(() => {
      // silent ignore network failures
    });
  } catch (_) {}
}

export function trackPageView(page: string) {
  try {
    if (typeof window === 'undefined') return;
    fetch('/api/analytics/traffic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page
      })
    }).catch(() => {
      // silent ignore network failures
    });
  } catch (_) {}
}
