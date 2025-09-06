# Affiliate Rewards Helper (MVP)

Chrome extension (Manifest V3) that detects affiliate opportunities on Amazon & Flipkart product pages, offers an affiliate link with transparent revenue split, and tracks user reward points locally.

## Features (MVP)
- Detect product identifiers (Amazon ASIN, basic Flipkart product IDs)
- Match against local `data/affiliate-list.json`
- Inject activation banner with estimated points & revenue split (50/50 self, 40/40/20 contributor)
- Update and persist points using `chrome.storage.local`
- Popup shows current points & placeholder redeem action

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

## Development Notes
- Keep `affiliate-list.json` small for MVP; later replace with remote fetch.
- Service Worker lifetime is ephemeral; avoid long-running state inside `background.js`.
- Consider debouncing SPA URL change detection if performance issues arise.

## License
MVP example – add your chosen license.
