// content.js - Affiliate Rewards Helper
// Detect product pages, match affiliate links, inject banner, handle points.

const BANNER_ID = "affiliate_rewards_banner";
const DATA_PATH = chrome.runtime.getURL("data/affiliate-list.json");
// Analytics dynamic import (only when needed)
let analyticsModule = null;
async function track(name, data) {
  try {
    if (!analyticsModule) {
      analyticsModule = await import(chrome.runtime.getURL('analytics.js'));
    }
    analyticsModule.trackEvent(name, data);
  } catch (_) {}
}
let settingsCache = { bannerEnabled: true, remoteDataUrl: null };

function loadSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(["bannerEnabled", "remoteDataUrl"], data => {
      settingsCache.bannerEnabled = data.bannerEnabled !== false; // default true
      settingsCache.remoteDataUrl = data.remoteDataUrl || null;
      resolve(settingsCache);
    });
  });
}

async function loadAffiliateData() {
  try {
    // Try remote first if configured
    if (settingsCache.remoteDataUrl) {
      try {
        const remote = await fetch(settingsCache.remoteDataUrl, { cache: "no-cache" });
        if (remote.ok) {
          const json = await remote.json();
          if (Array.isArray(json)) return json;
        }
      } catch (e) {
        console.warn("[AffiliateRewards] Remote data fetch failed, falling back", e);
      }
    }
    const res = await fetch(DATA_PATH, { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to load affiliate list local");
    return res.json();
  } catch (e) {
    console.warn("[AffiliateRewards] Data load error", e);
    return [];
  }
}

function detectProduct() {
  const host = location.host.toLowerCase();
  const url = location.href;

  if (host.includes("amazon.")) {
    // Amazon ASIN patterns (10 alphanumeric)
    // Common URL forms: /dp/ASIN/, /gp/product/ASIN/, /ASIN/
    const asinMatch = url.match(/(?:dp|gp\/product|\/)([A-Z0-9]{10})(?=[/?]|$)/i);
    if (asinMatch) {
      return { platform: "amazon", productId: asinMatch[1].toUpperCase() };
    }
  }

  if (host.includes("flipkart.com")) {
    // Flipkart product pages often contain /p/ or /itm
    // We'll try to pick a stable segment before ? or &
    const path = location.pathname;
    // Example: /some-product-name/p/itmabc123xyz
    const flMatch = path.match(/\/p\/([A-Za-z0-9_-]{6,})/i) || path.match(/\/(itm[\w]+)/i);
    if (flMatch) {
      return { platform: "flipkart", productId: flMatch[1] };
    }
  }
  return null;
}

function computeSplit(link) {
  // Returns object with userShare, platformShare, contributorShare (percentages) and baseCommissionRate
  if (link.ownerType === "self") {
    return { userShare: 0.5, platformShare: 0.5, contributorShare: 0, commissionRate: link.commissionRate };
  }
  // contributor
  return { userShare: 0.4, platformShare: 0.2, contributorShare: 0.4, commissionRate: link.commissionRate };
}

function estimatePoints(link) {
  const split = computeSplit(link);
  const price = extractPrice();
  let points;
  if (price) {
    // Points = price * commissionRate * userShare (rounded to nearest int)
    points = Math.round(price * split.commissionRate * split.userShare);
  } else {
    // Fallback legacy estimation
    points = Math.round(split.commissionRate * split.userShare * 1000) / 10;
  }
  return { points, split, price };
}

function extractPrice() {
  try {
    // Amazon price selectors
    let priceText = null;
    const amazonSelectors = [
      '#corePriceDisplay_desktop_feature_div span.a-price span.a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '#priceblock_saleprice',
      'span.a-price.a-text-price span.a-offscreen'
    ];
    const flipkartSelectors = [
      'div._30jeq3._16Jk6d', // primary price
      'div._25b18c div._30jeq3'
    ];
    const host = location.host.toLowerCase();
    const sels = host.includes('amazon.') ? amazonSelectors : (host.includes('flipkart.com') ? flipkartSelectors : []);
    for (const sel of sels) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim()) { priceText = el.textContent.trim(); break; }
    }
    if (!priceText) return null;
    // Remove currency symbols, commas
    priceText = priceText.replace(/[^0-9.,]/g, '').replace(/,/g, '');
    // Handle formats like 1,234.56 or 1.234,56 (assume last separator is decimal if followed by 2 digits)
    const decimalMatch = priceText.match(/([0-9]+)[.,]([0-9]{2})$/);
    let value;
    if (decimalMatch) {
      value = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      if (isNaN(value)) value = parseFloat(decimalMatch[1]);
    } else {
      value = parseFloat(priceText);
    }
    if (!isNaN(value) && value > 0) return value;
    return null;
  } catch (e) {
    return null;
  }
}

function injectBanner(linkMatch) {
  removeBanner();
  const { link, estimate } = linkMatch;
  const banner = document.createElement("div");
  banner.id = BANNER_ID;
  banner.style.cssText = `position:fixed;bottom:16px;right:16px;z-index:2147483647;` +
    `background:linear-gradient(135deg,#1b2735,#3a506b);color:#fff;padding:12px 14px;` +
    `box-shadow:0 4px 12px rgba(0,0,0,.3);border-radius:10px;font:13px/1.3 system-ui,Arial,sans-serif;` +
    `max-width:260px;display:flex;flex-direction:column;gap:6px;`;

  const title = document.createElement("div");
  title.style.fontWeight = "600";
  title.textContent = "Earn points on this purchase";

  const detail = document.createElement("div");
  detail.style.fontSize = "12px";
  const splitText = link.ownerType === "self" ? "50% you / 50% platform" : "40% you / 40% contributor / 20% platform";
  const priceFragment = estimate.price ? ` on ~₹${estimate.price}` : '';
  detail.textContent = `Est. +${estimate.points} pts${priceFragment} • Split: ${splitText}`;

  const actionBtn = document.createElement("button");
  actionBtn.textContent = "Activate Affiliate Link";
  actionBtn.style.cssText = `cursor:pointer;background:#ffb347;color:#222;font-weight:600;` +
    `border:none;border-radius:6px;padding:8px 10px;font-size:12px;` +
    `font-family:inherit;transition:background .2s;`;
  actionBtn.onmouseenter = () => actionBtn.style.background = '#ffc56b';
  actionBtn.onmouseleave = () => actionBtn.style.background = '#ffb347';

  const closeBtn = document.createElement("span");
  closeBtn.textContent = "×";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.style.cssText = `position:absolute;top:4px;right:8px;font-size:16px;cursor:pointer;opacity:.75;`;
  closeBtn.onclick = removeBanner;

  actionBtn.addEventListener("click", () => {
    incrementPoints(estimate.points).then(newTotal => {
      track('activation_click', { productId: link.productId, pointsAwarded: estimate.points, newTotal });
      window.location.href = link.affiliateUrl;
    });
  });

  banner.appendChild(closeBtn);
  banner.appendChild(title);
  banner.appendChild(detail);
  banner.appendChild(actionBtn);
  document.body.appendChild(banner);
  track('banner_shown', { platform: link.platform, ownerType: link.ownerType, hasPrice: !!estimate.price });
}

function removeBanner() {
  const existing = document.getElementById(BANNER_ID);
  if (existing) existing.remove();
}

function incrementPoints(delta) {
  return new Promise(resolve => {
    chrome.storage.local.get(["points"], data => {
      const current = data.points || 0;
      const updated = current + delta;
      chrome.storage.local.set({ points: updated }, () => {
        console.log(`[AffiliateRewards] Points updated: ${current} -> ${updated}`);
        resolve(updated);
      });
    });
  });
}

async function main() {
  await loadSettings();
  if (!settingsCache.bannerEnabled) return;
  const product = detectProduct();
  if (!product) return; // Not a product page
  const list = await loadAffiliateData();
  if (!list.length) return;
  const link = list.find(item => item.platform === product.platform && item.productId === product.productId);
  if (!link) return;
  const estimate = estimatePoints(link);
  injectBanner({ link, estimate });
}

// Delay a bit to let page settle
setTimeout(main, 800);

// Re-run if URL changes via SPA navigation (simple observer)
let lastUrl = location.href;
const obs = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    removeBanner();
    setTimeout(main, 600);
  }
});
obs.observe(document.documentElement, { childList: true, subtree: true });
