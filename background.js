console.log("[AffiliateRewards] Service worker loaded");

chrome.runtime.onInstalled.addListener(details => {
  console.log("[AffiliateRewards] Installed:", details.reason);
  chrome.storage.local.get(["points"], d => {
    if (d.points == null) chrome.storage.local.set({ points: 0 });
  });

  // Initialize sync settings defaults
  chrome.storage.sync.get(["bannerEnabled"], data => {
    if (data.bannerEnabled === undefined) {
      chrome.storage.sync.set({ bannerEnabled: true });
    }
  });

  // Context menu for quick access to options
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "affiliateRewardsOptions",
      title: "Affiliate Rewards Settings",
      contexts: ["action"]
    });
  });
});

chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId === 'affiliateRewardsOptions') {
    chrome.runtime.openOptionsPage();
  }
});
