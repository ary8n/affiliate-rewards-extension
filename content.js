// content.js - Affiliate Rewards Helper
// Detect product pages, match affiliate links, inject banner, handle points.

const BANNER_ID = "affiliate_rewards_banner";
const DATA_PATH = chrome.runtime.getURL("data/affiliate-list.json");

async function loadAffiliateData() {
  try {
    const res = await fetch(DATA_PATH, { cache: "no-cache" });
    if (!res.ok) throw new Error("Failed to load affiliate list");
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
  // Simplified: points = commissionRate * userShare * 100 (placeholder)
  // Real world you'd multiply by product price after purchase confirmation.
  const points = Math.round(split.commissionRate * split.userShare * 1000) / 10; // one decimal
  return { points, split };
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
  detail.textContent = `Est. +${estimate.points} pts • Split: ${splitText}`;

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
    incrementPoints(estimate.points).then(() => {
      window.location.href = link.affiliateUrl;
    });
  });

  banner.appendChild(closeBtn);
  banner.appendChild(title);
  banner.appendChild(detail);
  banner.appendChild(actionBtn);
  document.body.appendChild(banner);
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
