import { useState, useCallback } from "react";
import { useWallet } from "./hooks/useWallet";
import { stellarConfig, shortAddress } from "./lib/stellar";
import { createHash } from "./lib/hash";
import {
  ShieldCheck,
  Home,
  LayoutDashboard,
  Search,
  Sun,
  Moon,
  Wallet,
  Award,
  FilePlus2,
  X,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

type Theme = "light" | "dark";
type Page =
  | { name: "landing" }
  | { name: "dashboard" }
  | { name: "verify"; id: string }
  | { name: "credential"; id: string };

function useRouter() {
  const [page, setPage] = useState<Page>(() => {
    const path = window.location.pathname;
    if (path.startsWith("/verify/")) return { name: "verify", id: path.split("/verify/")[1] };
    if (path.startsWith("/credentials/")) return { name: "credential", id: path.split("/credentials/")[1] };
    if (path === "/app") return { name: "dashboard" };
    return { name: "landing" };
  });

  const navigate = useCallback((to: Page) => {
    setPage(to);
    switch (to.name) {
      case "landing": window.history.pushState({}, "", "/"); break;
      case "dashboard": window.history.pushState({}, "", "/app"); break;
      case "verify": window.history.pushState({}, "", `/verify/${to.id}`); break;
      case "credential": window.history.pushState({}, "", `/credentials/${to.id}`); break;
    }
  }, []);

  return { page, navigate };
}

export function App() {
  const { page, navigate } = useRouter();
  const [theme, setTheme] = useState<Theme>("dark");
  const wallet = useWallet();

  if (page.name === "landing") {
    return <LandingPage theme={theme} onToggleTheme={() => setTheme(t => t === "dark" ? "light" : "dark")} onLaunch={() => navigate({ name: "dashboard" })} />;
  }

  return (
    <main className="crypto-shell" data-theme={theme}>
      <aside className="crypto-sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><ShieldCheck size={20} /></div>
          <div>
            <strong>ProofMint</strong>
            <span>Credentials</span>
          </div>
        </div>
        <nav className="crypto-nav">
          <button className={page.name === "dashboard" ? "active" : ""} type="button" onClick={() => navigate({ name: "dashboard" })}>
            <LayoutDashboard size={18} />Dashboard
          </button>
        </nav>
        <button className="sidebar-home" type="button" onClick={() => navigate({ name: "landing" })}>
          <Home size={17} />Home
        </button>
      </aside>

      <section className="crypto-main">
        <header className="crypto-header">
          <div className="search-box">
            <Search size={17} />
            <input
              placeholder="Verify credential ID..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) navigate({ name: "verify", id: val });
                }
              }}
            />
          </div>
          <div className="topbar-actions">
            <span className="network-pill">{stellarConfig.network.toUpperCase()}</span>
            <button className="icon-button" type="button" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {wallet.connected ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="network-pill">{shortAddress(wallet.address!)}</span>
                <button className="primary-button" type="button" onClick={wallet.disconnect}>Disconnect</button>
              </div>
            ) : (
              <button className="primary-button" type="button" onClick={() => wallet.connect().catch(() => {})}>
                <Wallet size={18} />Connect
              </button>
            )}
          </div>
        </header>

        {wallet.networkMismatch && (
          <div style={{ background: "#ff6b351a", border: "1px solid #ff6b35", padding: "12px 16px", borderRadius: 8, marginBottom: 16, color: "#ff6b35" }}>
            Wallet network mismatch. Please switch Freighter to {stellarConfig.network.toUpperCase()}.
          </div>
        )}

        {page.name === "dashboard" && <Dashboard wallet={wallet} navigate={navigate} />}
        {page.name === "verify" && <VerifyPage id={page.id} />}
        {page.name === "credential" && <CredentialPage id={page.id} />}
      </section>
    </main>
  );
}

function LandingPage({ theme, onToggleTheme, onLaunch }: { theme: Theme; onToggleTheme: () => void; onLaunch: () => void }) {
  return (
    <main className="landing-shell" data-theme={theme}>
      <div className="landing-texture" />
      <nav className="landing-nav">
        <div className="brand-lockup">
          <div className="brand-mark"><ShieldCheck size={20} /></div>
          <div>
            <strong>ProofMint</strong>
            <span>Verifiable credentials on Stellar</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="icon-button" type="button" onClick={onToggleTheme}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className="primary-button" type="button" onClick={onLaunch}>Launch app</button>
        </div>
      </nav>
      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow">Open-source credential verification</p>
          <h1>Issue and verify tamper-proof certificates on Stellar.</h1>
          <p>Schools, DAOs, bootcamps, and event organizers can issue verifiable credentials to Stellar wallets. Anyone can verify authenticity, status, expiry, or revocation.</p>
          <div className="hero-actions">
            <button className="primary-button large" type="button" onClick={onLaunch}>Launch app</button>
          </div>
        </div>
        <div className="hero-product">
          <div className="receipt-ticket landing-ticket">
            <div className="ticket-top"><span>#0001</span><strong>Active</strong></div>
            <h3>Certificate of Completion</h3>
            <p>Blockchain Development Bootcamp</p>
            <div className="ticket-grid">
              <span>Issuer<strong>Academy DAO</strong></span>
              <span>Network<strong>Stellar testnet</strong></span>
              <span>Verification<strong>Public & instant</strong></span>
              <span>Proof<strong>On-chain hash</strong></span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function VerifyPage({ id }: { id: string }) {
  const [status, setStatus] = useState<"loading" | "found" | "not-found" | "error">("loading");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [meta, setMeta] = useState<Record<string, unknown> | null>(null);

  useState(() => {
    fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/verify/${encodeURIComponent(id)}`)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(d => {
        setData(d);
        setStatus("found");
        if (d.metadata_hash) {
          fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/credentials/${encodeURIComponent(id)}`)
            .then(r => r.json())
            .then(c => setMeta(c.metadata ?? null))
            .catch(() => {});
        }
      })
      .catch(() => setStatus("not-found"));
  });

  const StatusIcon = status === "loading" ? RefreshCw : status === "found" && data?.status === "Active" ? CheckCircle : status === "found" && data?.status === "Expired" ? Clock : XCircle;

  return (
    <div style={{ padding: "32px", maxWidth: 640, margin: "0 auto" }}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Credential Verification</p>
          <h2>{status === "loading" ? "Verifying..." : status === "error" ? "Error" : status === "not-found" ? "Not Found" : `Credential #${id}`}</h2>
        </div>
        {status === "found" && <span className={`state ${data?.status === "Active" ? "good" : ""}`}>{data?.status as string}</span>}
      </div>

      {status === "loading" && <div style={{ textAlign: "center", padding: 48, opacity: 0.6 }}>Verifying credential...</div>}

      {status === "not-found" && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <XCircle size={48} style={{ opacity: 0.3 }} />
          <p style={{ marginTop: 16, opacity: 0.6 }}>Credential not found. It may not exist or may have been removed.</p>
        </div>
      )}

      {status === "found" && data && (
        <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
          <div className="asset-meta" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <span>Credential ID<strong>#{data.credential_id as string}</strong></span>
            <span>Status<strong>{data.status as string}</strong></span>
            <span>Issuer<strong>{shortAddress(data.issuer as string)}</strong></span>
            <span>Recipient<strong>{shortAddress(data.recipient as string)}</strong></span>
            <span>Metadata Hash<strong>{shortAddress(data.metadata_hash as string)}</strong></span>
            <span>Issued<strong>{new Date((data.issued_at as string) || "").toLocaleDateString()}</strong></span>
          </div>

          {meta && (
            <div style={{ background: "var(--surface)", padding: 16, borderRadius: 8 }}>
              <h3 style={{ marginBottom: 8 }}>Credential Metadata</h3>
              <pre style={{ fontSize: "0.85em", opacity: 0.8, overflow: "auto" }}>
                {JSON.stringify(meta, null, 2)}
              </pre>
            </div>
          )}

          <div style={{ textAlign: "center", padding: 16, opacity: 0.7, fontSize: "0.9em" }}>
            Verified on Stellar {stellarConfig.network} / ProofMint
          </div>
        </div>
      )}
    </div>
  );
}

function CredentialPage({ id }: { id: string }) {
  return <VerifyPage id={id} />;
}

interface IssueInput {
  recipient: string;
  metadataJson: string;
  expiresAt: string;
}

function Dashboard({ wallet, navigate }: { wallet: ReturnType<typeof useWallet>; navigate: (p: Page) => void }) {
  const [issueInput, setIssueInput] = useState<IssueInput>({ recipient: "", metadataJson: '{\n  "title": ""\n}', expiresAt: "" });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<string[]>([]);
  const [verifyId, setVerifyId] = useState("");

  async function handleIssue() {
    if (!wallet.connected || !wallet.address) {
      setStatus("Connect your wallet first.");
      return;
    }

    if (!issueInput.recipient || !issueInput.recipient.startsWith("G")) {
      setStatus("Enter a valid Stellar recipient address.");
      return;
    }

    let metadata: Record<string, unknown>;
    try {
      metadata = JSON.parse(issueInput.metadataJson);
    } catch {
      setStatus("Invalid JSON in metadata field.");
      return;
    }

    setBusy(true);
    setStatus("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
      const json = JSON.stringify(metadata);
      const hash = await createHash(json);

      const metaRes = await fetch(`${apiUrl}/metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash, metadata: JSON.parse(json) }),
      });

      if (!metaRes.ok) {
        const err = await metaRes.json().catch(() => ({ error: "api_error" }));
        setStatus(`Metadata upload failed: ${err.error}`);
        setBusy(false);
        return;
      }

      const cid = (import.meta.env.VITE_PROOFMINT_CONTRACT_ID ?? "").trim();
      if (!cid) {
        setStatus("Contract ID not configured. Set VITE_PROOFMINT_CONTRACT_ID.");
        setBusy(false);
        return;
      }

      const { rpc, stellarConfig: sc } = await import("./lib/stellar");
      const { Contract, TransactionBuilder, BASE_FEE, nativeToScVal, xdr, scValToNative } = await import("@stellar/stellar-sdk");

      const sourceAcct = await rpc.getAccount(wallet.address!);
      const contract = new Contract(cid);
      const expiresAt = issueInput.expiresAt
        ? BigInt(Math.floor(new Date(issueInput.expiresAt).getTime() / 1000))
        : null;

      const hashBytes = new Uint8Array(hash.match(/.{2}/g)!.map((b) => parseInt(b, 16)));

      const expiryVal = expiresAt !== null
        ? xdr.ScVal.scvVec([nativeToScVal(expiresAt, { type: "u64" })])
        : xdr.ScVal.scvVec([]);

      const tx = new TransactionBuilder(sourceAcct, {
        fee: BASE_FEE,
        networkPassphrase: sc.networkPassphrase,
      })
        .addOperation(
          contract.call(
            "issue_credential",
            nativeToScVal(wallet.address, { type: "address" }),
            nativeToScVal(issueInput.recipient, { type: "address" }),
            nativeToScVal(hashBytes, { type: "bytes" }),
            expiryVal,
          ),
        )
        .setTimeout(180)
        .build();

      const { rpc: rpcMod } = await import("@stellar/stellar-sdk");
      const sim = await rpc.simulateTransaction(tx);
      if (rpcMod.Api.isSimulationError(sim)) {
        setStatus(`Simulation failed: ${String((sim as { error: unknown }).error)}`);
        setBusy(false);
        return;
      }

      const prepared = await rpc.prepareTransaction(tx);
      const signedXdr = await wallet.sign(prepared.toXDR());
      const signedTx = TransactionBuilder.fromXDR(signedXdr, sc.networkPassphrase);

      const sendRes = await rpc.sendTransaction(signedTx);
      if (sendRes.status === "ERROR") {
        setStatus(`Transaction failed: ${(sendRes as { errorResult: unknown }).errorResult}`);
        setBusy(false);
        return;
      }

      const pollRes = await rpc.pollTransaction(sendRes.hash);
      if (pollRes.status !== "SUCCESS") {
        setStatus(`Transaction failed: ${pollRes.status}`);
        setBusy(false);
        return;
      }

      let credId = "?";
      try {
        if (pollRes.returnValue) {
          const v = scValToNative(pollRes.returnValue);
          if (v != null) credId = String(v);
        }
      } catch {}

      setIssued((prev) => [credId, ...prev].slice(0, 10));
      setIssueInput({ recipient: "", metadataJson: '{\n  "title": ""\n}', expiresAt: "" });
      setStatus(`Credential #${credId} issued successfully! Tx: ${sendRes.hash}`);
    } catch (e) {
      setStatus(`Error: ${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: "32px" }}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Issuer Dashboard</p>
          <h2>Manage Credentials</h2>
        </div>
        <span className={wallet.connected ? "state good" : "state"}>{wallet.connected ? "Connected" : "Wallet required"}</span>
      </div>

      <div className="crypto-grid" style={{ marginTop: 24 }}>
        <section className="trade-panel">
          <div className="section-heading">
            <div><p className="eyebrow">Issue</p><h2>New Credential</h2></div>
          </div>
          <div className="form-grid app-form-grid">
            <label>Recipient Address
              <input value={issueInput.recipient} onChange={e => setIssueInput({ ...issueInput, recipient: e.target.value })} placeholder="G..." />
            </label>
            <label>Metadata (JSON)
              <textarea rows={5} value={issueInput.metadataJson} onChange={e => setIssueInput({ ...issueInput, metadataJson: e.target.value })} style={{ width: "100%", fontFamily: "monospace" }} />
            </label>
            <label>Expiry (optional)
              <input type="datetime-local" value={issueInput.expiresAt} onChange={e => setIssueInput({ ...issueInput, expiresAt: e.target.value })} />
            </label>
            <div className="button-cluster">
              <button className="primary-button" disabled={!wallet.connected || busy} type="button" onClick={handleIssue}>
                <Award size={17} />{busy ? "Issuing..." : "Issue Credential"}
              </button>
            </div>
          </div>
          {status && <div className="status-line">{status}</div>}
        </section>

        <aside className="side-stack">
          <section className="market-panel">
            <div className="section-heading">
              <div><p className="eyebrow">Verify</p><h2>Quick Lookup</h2></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={verifyId} onChange={e => setVerifyId(e.target.value)} placeholder="Credential ID" style={{ flex: 1 }} />
              <button className="primary-button" type="button" onClick={() => verifyId && navigate({ name: "verify", id: verifyId })}>Check</button>
            </div>
          </section>

          {issued.length > 0 && (
            <section className="activity-panel">
              <div className="section-heading">
                <div><p className="eyebrow">Recent</p><h2>Issued Credentials</h2></div>
              </div>
              {issued.map((id) => (
                <div key={id} className="activity-item" style={{ cursor: "pointer" }} onClick={() => navigate({ name: "verify", id })}>
                  <span>#{id}</span>
                  <div><strong>Issued</strong><p>Click to verify</p></div>
                </div>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
