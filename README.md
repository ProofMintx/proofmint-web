# ProofMint Web

Reference frontend for the ProofMint credential platform.

This repository contains two connected product surfaces:

- A public marketing and verification experience for recipients, employers, communities, and other verifiers.
- An issuer workspace for browsing credentials, preparing new issues, and exploring the intended wallet workflow.

It is the presentation layer for `proofmint-contracts`, `proofmint-indexer`, `proofmint-api`, and `proofmint-sdk`. The current reviewer build intentionally runs without those services by using clearly labeled fictional demo records.

## Setup

```bash
npm install
```

Create a `.env` file from `.env.example`:

```env
VITE_NETWORK=testnet
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_DEMO_MODE=true
```

Start development:

```bash
npm run dev
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/app` | Issuer dashboard |
| `/app/credentials` | Searchable credential directory |
| `/app/issue` | Credential issuance preview |
| `/app/verify` | Verification lookup workspace |
| `/verify/:id` | Public credential verifier |

## Features

- Freighter wallet connection
- Deployable demonstration mode using polished fictional credential records
- Public credential verification with active, expired, and unknown states
- Issuer dashboard, searchable credential directory, and issuance preview
- Freighter connect/disconnect with testnet network-mismatch detection
- Responsive landing and workspace layouts for desktop and mobile

## Reviewer Flow

1. Open `/` to review the product story, trust model, use cases, and public lookup form.
2. Open `/app` to review issuer metrics and recent registry activity.
3. Open `/app/credentials` to search the demo registry.
4. Open `/app/issue` to preview the issuance flow and create a local demo credential.
5. Open `/app/verify` or `/verify/PM-2026-000184` to inspect the public verifier.
6. Use **Connect wallet** to exercise the real Freighter connection and disconnect flow.

## Demo Mode

`VITE_DEMO_MODE=true` is the supported reviewer experience. It deliberately uses fictional credential data and does not submit transactions or require a deployed contract/API.

Freighter connection is real: users can connect and disconnect a testnet wallet, but demo issuance remains local to the browser until the contract and API integration are enabled.

## Live Integration

The app intentionally avoids requiring a deployed contract or API while `VITE_DEMO_MODE=true`. When live integration begins:

- use the deployed `proofmint-contracts` contract ID and Stellar RPC configuration;
- use `proofmint-sdk` for contract/API types and metadata hashing;
- use `proofmint-api` for indexed credentials and public metadata;
- use wallet simulation, signing, submission, and confirmation states for contract writes.

The demo UI should remain available as a deterministic reviewer mode.

## Related Repositories

- `proofmint-contracts` is the on-chain source of truth.
- `proofmint-indexer` builds the searchable read model.
- `proofmint-api` serves indexed views and metadata.
- `proofmint-sdk` is the shared integration client.

## License

Apache-2.0
