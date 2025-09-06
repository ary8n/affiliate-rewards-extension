# Privacy Policy (MVP)

This extension stores the following:

Local (`chrome.storage.local`):
 - Reward points total.

Sync (`chrome.storage.sync`):
 - `bannerEnabled` (boolean)
 - `remoteDataUrl` (string, optional user-provided)
 - `analyticsEnabled` (boolean, default false)

Runtime (in-page only, not persisted):
 - Parsed product price text for estimation (never transmitted).

No personal data, browsing history arrays, or purchase confirmations are sent externally in this MVP.

Remote Data URL (optional):
If configured by the user, the extension fetches that JSON over HTTPS. The request contains only standard browser headers—no identifiers are added.

Analytics:
Disabled by default. When enabled, events (e.g., banner shown, activation click) are currently only logged to the developer console. No network transmission occurs. Future versions may add an opt-in backend endpoint; this document will be updated prior to that change.

Future Roadmap (may require updated policy):
 - Auth & account-based sync
 - Server-side redemption & payouts
 - Category-specific commission enrichment
 - Optional telemetry for feature usage (explicit opt-in)

Policy Updates:
Any material changes will increment the extension version and update this document.
