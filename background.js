console.log("[AffiliateRewards] Service worker loaded");

chrome.runtime.onInstalled.addListener(details => {
  console.log("[AffiliateRewards] Installed:", details.reason);
  chrome.storage.local.get(["points"], d => {
    if (d.points == null) chrome.storage.local.set({ points: 0 });
  });
});
