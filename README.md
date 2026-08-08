# ProofMint Web

Issuer dashboard and public verifier for verifiable credentials on Stellar.

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

## Demo Mode

`VITE_DEMO_MODE=true` is the supported reviewer experience. It deliberately uses fictional credential data and does not submit transactions or require a deployed contract/API.

Freighter connection is real: users can connect and disconnect a testnet wallet, but issuance remains local to the browser until the contract and API integration are enabled.

## Live Integration

The app intentionally avoids requiring a deployed contract or API while `VITE_DEMO_MODE=true`. When the integration phase begins, add the ProofMint contract ID, Stellar RPC URL, API URL, and real transaction submission flow behind a non-demo environment configuration.

## License

Apache-2.0
