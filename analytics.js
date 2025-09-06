// analytics.js - lightweight optional event tracking (disabled by default)
// Only fires if chrome.storage.sync.analyticsEnabled === true

export async function trackEvent(name, data = {}) {
  try {
    const enabled = await new Promise(resolve => {
      chrome.storage.sync.get(['analyticsEnabled'], d => resolve(d.analyticsEnabled === true));
    });
    if (!enabled) return;
    // For MVP, just log. Later: POST to backend endpoint.
    console.log('[AffiliateRewards][analytics]', name, data);
  } catch (e) {
    // swallow
  }
}
