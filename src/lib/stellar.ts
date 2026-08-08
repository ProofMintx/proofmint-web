const network = import.meta.env.VITE_NETWORK ?? "testnet";
const networkPassphrase =
  import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE ??
  (network === "pubnet"
    ? "Public Global Stellar Network ; September 2015"
    : "Test SDF Network ; September 2015");

export const stellarConfig = {
  network,
  networkPassphrase,
};

export function toDateTime(unixSeconds: number | bigint): string {
  const n = typeof unixSeconds === "bigint" ? Number(unixSeconds) : unixSeconds;
  if (!Number.isFinite(n) || n <= 0) return "-";
  return new Date(n * 1000).toLocaleString();
}

export function shortAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-5)}`;
}

export type CredentialStatus = "Active" | "Expired" | "Revoked" | "NotFound";

export interface CredentialMeta {
  credential_id: string;
  status: CredentialStatus;
  issuer: string;
  recipient: string;
  metadata_hash: string;
  issued_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  metadata?: Record<string, unknown>;
}
