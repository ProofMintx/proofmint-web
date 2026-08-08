# ProofMint Web

Issuer dashboard and public verifier for verifiable credentials on Stellar.

## Setup

```bash
npm install
```

Create a `.env` file from `.env.example`:

```env
VITE_NETWORK=testnet
VITE_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_PROOFMINT_CONTRACT_ID=C...
VITE_API_URL=http://localhost:3001
```

Start development:

```bash
npm run dev
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/app` | Issuer dashboard (wallet required) |
| `/verify/:id` | Public credential verifier |
| `/credentials/:id` | Credential detail page |

## Features

- Freighter wallet connection
- Issue credentials on-chain (simulate, sign, submit, confirm)
- Metadata upload to API with hash verification
- Public credential verification with status display
- Quick credential ID lookup
- Network mismatch detection

## Prerequisites

- A running `proofmint-api` instance
- A running `proofmint-indexer` with indexed contract events
- A deployed `proofmint-contracts` instance on testnet

## License

Apache-2.0
