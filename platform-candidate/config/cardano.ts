// Cardano holder-gating configuration.
//
// Wallets proving ownership (CIP-8 signed challenge) and holding at least
// WEBOT_HOLDER_MIN_ASSET_COUNT assets under WEBOT_HOLDER_POLICY_ID become
// eligible for the holder_unlimited entitlement ($5/mo, unlimited quota,
// dashboard + API access). Eligibility is re-checked server-side and the
// entitlement layer ignores holder entitlements while a wallet is
// ineligible (graceful downgrade; nothing is deleted).

export const WEBOT_HOLDER_POLICY_ID = "adc5716393953403109c335e68c0384238fd19653e960e03afa1fb1f";

export const WEBOT_HOLDER_MIN_ASSET_COUNT = 25;

/**
 * Sentinel quota for the holder tier. The entitlement schema requires a
 * non-negative integer quota; one million jobs/month is documented as
 * "unlimited" for all practical purposes.
 */
export const WEBOT_HOLDER_UNLIMITED_MONTHLY_QUOTA = 1_000_000;

export const WEBOT_HOLDER_ENTITLEMENT_CODE = "holder_unlimited";

export const WEBOT_HOLDER_TIER_AMOUNT_CENTS = 500;

/**
 * Minimum seconds between on-chain holding refreshes for one wallet, so
 * customer-triggered refreshes cannot hammer the chain providers.
 */
export const WEBOT_HOLDER_REFRESH_MIN_INTERVAL_SECONDS = 60;

/**
 * Holdings older than this are considered stale; the internal refresh
 * endpoint (daemon-friendly) re-checks wallets past this window.
 */
export const WEBOT_HOLDER_REFRESH_STALE_AFTER_SECONDS = 24 * 60 * 60;

export const WEBOT_WALLET_CHALLENGE_TTL_SECONDS = 10 * 60;
