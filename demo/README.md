# Agent Trust Explorer — Interactive Demo

A standalone web app that lets you look up any Base address and see its **trust tier**, **attestation history**, **vouch count**, and **trust score** — all read directly from the [EAS](https://attest.org) contracts on Base.

## Quick Start

**No build step, no backend, no dependencies.**

```bash
# Option 1: Open directly in your browser
open demo/index.html

# Option 2: Serve locally (any static file server works)
cd demo
python3 -m http.server 8080
# Then visit http://localhost:8080
```

## What It Shows

For any Ethereum address:

| Section | Description |
|---------|-------------|
| **Trust Tier** | Computed tier (🆕 New → 🔧 Contributor → ⭐ Trusted → ✅ Verified → 👑 Expert) |
| **Trust Score** | 0-100 reputation score based on attestations |
| **Stats** | Total attestations, vouches, verifications, and flags |
| **Progress** | Visual progress bars toward the next tier |
| **History** | Full attestation history with links to EASScan |

## How It Works

1. Queries the **EAS GraphQL API** directly from the browser (no backend needed)
2. Categorizes attestations by schema (Verification, Vouch, Flag)
3. Computes trust tier using the same algorithm as the SDK
4. Displays results with progress toward the next tier

### Networks

- **Base Sepolia** (testnet) — default, has test attestations
- **Base Mainnet** — production attestations

Toggle between networks using the buttons at the top.

### Schema UIDs (Base Sepolia)

| Schema | UID |
|--------|-----|
| Verification | `0xee0eab33...` |
| Vouch | `0x974ebae6...` |
| Flag | `0x07b45425...` |

These match the schemas registered by the Agent Trust SDK.

## Try It

The demo pre-fills Nia's address (`0xC0D7CA6B3C1EF108696ced64F97729177F823189`). Click **Look Up** to see the genesis attestation and trust profile.

## Deployment

This is a single HTML file — deploy anywhere:

- **GitHub Pages**: Push to `gh-pages` branch or enable Pages on the `demo/` directory
- **Vercel/Netlify**: Point to the `demo/` directory
- **Any static host**: Just upload `index.html`

## Tech Stack

- Vanilla HTML/CSS/JS (zero dependencies)
- EAS GraphQL API (reads directly from chain indexer)
- Tier calculation mirrors the SDK algorithm exactly
