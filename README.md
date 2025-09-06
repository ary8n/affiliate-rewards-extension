# Affiliate Rewards Helper (MVP)

Chrome extension (Manifest V3) that detects affiliate opportunities on Amazon & Flipkart product pages, offers an affiliate link with transparent revenue split, and tracks user reward points locally.

## Features (MVP)
- Detect product identifiers (Amazon ASIN, basic Flipkart product IDs)
- Match against local `data/affiliate-list.json`
- Inject activation banner with estimated points & revenue split (50/50 self, 40/40/20 contributor)
- Parse product price (when available) and compute dynamic point estimate: `price * commissionRate * userShare`
- Update and persist points using `chrome.storage.local`
- Popup shows current points & placeholder redeem action
 - Optional remote affiliate list URL (user-specified)
 - Optional anonymous analytics toggle (OFF by default)

## File Overview
- `manifest.json` – Extension configuration
- `background.js` – Service worker initializes storage
- `content.js` – Detection, matching, banner injection, points update
- `data/affiliate-list.json` – Local affiliate link dataset
- `popup.html / popup.js / styles/popup.css` – UI showing points

## Install / Load (Chrome / Edge)
1. Clone or download this folder.
2. Open Chrome > Extensions > Enable Developer Mode.
3. Click "Load unpacked" and select the project directory.
4. Navigate to an Amazon or Flipkart product page.
5. If a match exists, a banner appears bottom-right.
6. Click "Activate Affiliate Link" to redirect and increment points.
7. Open the extension popup to view updated points.

## Points & Splits
| Link Owner       | User | Platform | Contributor |
|------------------|------|----------|-------------|
| self             | 50%  | 50%      | 0%          |
| contributor      | 40%  | 20%      | 40%         |

`content.js` currently estimates points using: `commissionRate * userShare * 100` (scaled & rounded). Real implementation would require order confirmation and actual price.

## Roadmap Ideas
- Real purchase confirmation callbacks
- Backend sync & authentication
- Contributor submission portal
- Dynamic commission rates per category
- Redemption workflow (gift cards / payouts)
- Improved product ID extraction heuristics
- A/B testing banner placements

## Options Page / Settings
The extension now includes an `options.html` page accessible via the extension card or context menu (right-click the action icon). Settings stored in `chrome.storage.sync`:
- `bannerEnabled` – toggle banner injection globally (default ON)
- `remoteDataUrl` – optional HTTPS JSON endpoint returning an array of affiliate entries identical in shape to `data/affiliate-list.json`.
 - `analyticsEnabled` – when enabled, logs lightweight anonymized events in the console (future: send to backend).

## Packaging for Chrome Web Store
1. Increment `version` in `manifest.json`.
2. Ensure icon assets meet requirements (PNG 128x128).
3. Provide clear description & screenshots (banner + popup + options page).
4. Upload ZIP of project root (exclude `.git`).
5. Link to `PRIVACY.md` and summarize minimal data usage (local only).

## Store Submission Checklist
- [x] Manifest V3, correct permissions minimal.
- [x] No remote code execution; only optional HTTPS JSON fetch if user sets.
- [x] Privacy policy included.
- [x] Icons present.
- [x] No obfuscated code.
- [x] Clear user value (rewards transparency).

## Data Format (Affiliate Entry)
```json
{
	"productId": "B0TESTASIN1",
	"platform": "amazon", // or flipkart
	"affiliateUrl": "https://www.amazon.in/dp/B0TESTASIN1?tag=tag-21",
	"commissionRate": 0.04,
	"ownerType": "self" // or contributor
}
```

Additional fields like `contributorId` are optional for contributor-owned links.

## Security & Abuse Considerations
- Banner only appears on supported hostnames.
- Product detection uses simple patterns—avoid collecting extra DOM data.
- Remote URL must be explicitly provided by user (no hard-coded tracking endpoints).

## Contributing
Open issues for detection improvements or new platforms (e.g., Myntra, eBay). Provide sample product URLs and expected product ID parsing logic.

## Development Notes
- Keep `affiliate-list.json` small for MVP; later replace with remote fetch.
- Service Worker lifetime is ephemeral; avoid long-running state inside `background.js`.
- Consider debouncing SPA URL change detection if performance issues arise.

## License
MVP example – add your chosen license.
