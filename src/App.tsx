import {
  type FormEvent,
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Copy,
  ExternalLink,
  FileCheck2,
  FilePlus2,
  Fingerprint,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wallet,
  X,
} from "lucide-react";
import { useWallet } from "./hooks/useWallet";
import { shortAddress, stellarConfig } from "./lib/stellar";

type CredentialStatus = "Active" | "Expired" | "Revoked";
type AppTab = "overview" | "credentials" | "issue" | "verify";
type Route = { page: "landing" } | { page: "app"; tab: AppTab } | { page: "verify"; id: string };

type Credential = {
  id: string;
  title: string;
  program: string;
  issuer: string;
  recipient: string;
  issuedAt: string;
  expiresAt?: string;
  status: CredentialStatus;
  category: string;
  accent: "indigo" | "gold" | "emerald" | "plum";
  description: string;
  skills: string[];
  hash: string;
};

const demoCredentials: Credential[] = [
  {
    id: "PM-2026-000184",
    title: "Certificate of Completion",
    program: "Stellar Smart Contract Foundations",
    issuer: "Meridian Academy",
    recipient: "K. Williams",
    issuedAt: "2026-07-12",
    status: "Active",
    category: "Education",
    accent: "indigo",
    description: "Completed the applied curriculum for designing, testing, and deploying Soroban smart contracts.",
    skills: ["Soroban", "Rust", "Stellar RPC"],
    hash: "0x8f7a...e41c",
  },
  {
    id: "PM-2026-000183",
    title: "Community Contributor",
    program: "Open Protocol Fellowship",
    issuer: "Constellation DAO",
    recipient: "M. Ortega",
    issuedAt: "2026-07-09",
    status: "Active",
    category: "Community",
    accent: "gold",
    description: "Recognized for meaningful contributions to the Open Protocol Fellowship community.",
    skills: ["Governance", "Open source", "Facilitation"],
    hash: "0x1b3c...90ad",
  },
  {
    id: "PM-2026-000178",
    title: "Workshop Credential",
    program: "Web3 Identity Lab",
    issuer: "Field Notes Studio",
    recipient: "A. Chen",
    issuedAt: "2026-06-28",
    expiresAt: "2027-06-28",
    status: "Active",
    category: "Professional development",
    accent: "emerald",
    description: "Verified participation in an intensive workshop exploring portable identity systems.",
    skills: ["Identity", "Credentials", "Product design"],
    hash: "0x4de1...6a09",
  },
  {
    id: "PM-2025-000091",
    title: "Event Attendance",
    program: "Stellar Builders Summit 2025",
    issuer: "Stellar Builders Guild",
    recipient: "R. Okafor",
    issuedAt: "2025-11-18",
    expiresAt: "2026-05-18",
    status: "Expired",
    category: "Event",
    accent: "plum",
    description: "Attendance credential for the Stellar Builders Summit 2025.",
    skills: ["Community", "Stellar"],
    hash: "0x9aa0...b7e3",
  },
];

const navItems: Array<{ tab: AppTab; label: string; icon: typeof LayoutDashboard }> = [
  { tab: "overview", label: "Overview", icon: LayoutDashboard },
  { tab: "credentials", label: "Credentials", icon: Award },
  { tab: "issue", label: "Issue credential", icon: FilePlus2 },
  { tab: "verify", label: "Verify", icon: BadgeCheck },
];

function parseRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/verify/")) return { page: "verify", id: decodeURIComponent(path.slice(8)) };
  if (path.startsWith("/app/")) {
    const tab = path.slice(5) as AppTab;
    if (["overview", "credentials", "issue", "verify"].includes(tab)) return { page: "app", tab };
  }
  if (path === "/app") return { page: "app", tab: "overview" };
  return { page: "landing" };
}

function useRouter() {
  const [route, setRoute] = useState<Route>(parseRoute);

  useEffect(() => {
    const onPopState = () => startTransition(() => setRoute(parseRoute()));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(next: Route) {
    const path = next.page === "landing"
      ? "/"
      : next.page === "verify"
        ? `/verify/${encodeURIComponent(next.id)}`
        : next.tab === "overview" ? "/app" : `/app/${next.tab}`;
    window.history.pushState({}, "", path);
    startTransition(() => setRoute(next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return { route, navigate };
}

function statusClass(status: CredentialStatus) {
  return status.toLowerCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export function App() {
  const { route, navigate } = useRouter();
  const wallet = useWallet();
  const [credentials, setCredentials] = useState(demoCredentials);
  const [menuOpen, setMenuOpen] = useState(false);

  function createCredential(input: Pick<Credential, "title" | "program" | "recipient" | "expiresAt">) {
    const id = `PM-2026-${String(185 + credentials.length).padStart(6, "0")}`;
    const credential: Credential = {
      ...input,
      id,
      issuer: "Meridian Academy",
      issuedAt: "2026-08-08",
      status: "Active",
      category: "Education",
      accent: "indigo",
      description: `Demo credential issued for ${input.program}. This record is stored only in the browser for this prototype.`,
      skills: ["Verified achievement", "Stellar"],
      hash: "0xdemo...2026",
    };
    setCredentials((current) => [credential, ...current]);
    navigate({ page: "verify", id });
  }

  if (route.page === "landing") {
    return <Landing onNavigate={navigate} wallet={wallet} />;
  }

  if (route.page === "verify") {
    return <VerificationPage credential={credentials.find((credential) => credential.id === route.id)} onNavigate={navigate} wallet={wallet} />;
  }

  return (
    <div className="app-frame">
      <AppSidebar activeTab={route.tab} onNavigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="app-main">
        <AppHeader wallet={wallet} onNavigate={navigate} onOpenMenu={() => setMenuOpen(true)} />
        <div className="prototype-note"><Sparkles size={15} /> Prototype mode: all credentials and analytics shown below are fictional demo data.</div>
        {route.tab === "overview" && <Overview credentials={credentials} onNavigate={navigate} />}
        {route.tab === "credentials" && <CredentialDirectory credentials={credentials} onNavigate={navigate} />}
        {route.tab === "issue" && <IssueCredential wallet={wallet} onCreate={createCredential} />}
        {route.tab === "verify" && <VerifyWorkspace credentials={credentials} onNavigate={navigate} />}
      </main>
    </div>
  );
}

function Landing({ onNavigate, wallet }: { onNavigate: (route: Route) => void; wallet: ReturnType<typeof useWallet> }) {
  const [lookup, setLookup] = useState("");

  function submitLookup(event: FormEvent) {
    event.preventDefault();
    if (lookup.trim()) onNavigate({ page: "verify", id: lookup.trim() });
  }

  return (
    <main className="marketing-page">
      <header className="marketing-nav">
        <button className="brand" type="button" onClick={() => onNavigate({ page: "landing" })}>
          <span className="brand-mark"><Fingerprint size={22} /></span>
          <span>ProofMint<small>Credential registry</small></span>
        </button>
        <nav className="marketing-links" aria-label="Primary navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#use-cases">Use cases</a>
          <a href="#trust">Trust model</a>
        </nav>
        <div className="nav-actions">
          <button className="text-button" type="button" onClick={() => onNavigate({ page: "verify", id: "PM-2026-000184" })}>Verify a credential</button>
          <WalletButton wallet={wallet} compact />
          <button className="button button-dark" type="button" onClick={() => onNavigate({ page: "app", tab: "overview" })}>Issuer workspace <ArrowRight size={16} /></button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="kicker"><span /> Verifiable achievement, built for Stellar</p>
          <h1>Credentials that carry <em>their proof.</em></h1>
          <p className="hero-description">Issue beautiful, tamper-evident certificates to Stellar wallets. Let anyone verify an achievement without calling your office, logging into a portal, or trusting a screenshot.</p>
          <div className="hero-actions">
            <button className="button button-dark button-large" type="button" onClick={() => onNavigate({ page: "app", tab: "issue" })}>Start issuing <ArrowRight size={18} /></button>
            <button className="button button-quiet button-large" type="button" onClick={() => onNavigate({ page: "verify", id: "PM-2026-000184" })}><BadgeCheck size={18} /> Try public verification</button>
          </div>
          <div className="hero-proof-row">
            <div><strong>Immutable</strong><span>On-chain proof</span></div>
            <div><strong>Public</strong><span>Instant verification</span></div>
            <div><strong>Private</strong><span>Metadata stays off-chain</span></div>
          </div>
        </div>
        <div className="hero-art" aria-label="Example ProofMint credential">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <article className="certificate-card">
            <div className="certificate-topline"><span>MERIDIAN ACADEMY</span><span className="seal"><Fingerprint size={15} /> PROOFED</span></div>
            <div className="certificate-icon"><GraduationCap size={34} /></div>
            <p className="certificate-label">CERTIFICATE OF COMPLETION</p>
            <h2>Stellar Smart Contract Foundations</h2>
            <p className="certificate-recipient">Awarded to <strong>K. Williams</strong></p>
            <div className="certificate-bottom"><span>PM-2026-000184</span><span><CircleCheck size={15} /> Active</span></div>
          </article>
          <div className="hero-verification-chip"><span className="pulse" /> Verified in 0.8 seconds</div>
        </div>
      </section>

      <section className="lookup-strip">
        <div><p className="kicker">Public verification</p><h2>Check a credential in seconds.</h2></div>
        <form onSubmit={submitLookup} className="lookup-form">
          <Search size={18} />
          <input value={lookup} onChange={(event) => setLookup(event.target.value)} placeholder="Enter a credential ID, e.g. PM-2026-000184" aria-label="Credential ID" />
          <button className="button button-dark" type="submit">Verify <ArrowRight size={16} /></button>
        </form>
      </section>

      <section className="story-section" id="how-it-works">
        <div className="section-intro"><p className="kicker">A clear trust trail</p><h2>Proof that travels with the person who earned it.</h2></div>
        <div className="steps-grid">
          <article><span className="step-number">01</span><Building2 size={24} /><h3>Approve issuers</h3><p>Give recognized schools, communities, and organizers the ability to issue on your registry.</p></article>
          <article><span className="step-number">02</span><FileCheck2 size={24} /><h3>Issue once</h3><p>Hash the credential metadata and anchor its issuance, recipient, and status on Stellar.</p></article>
          <article><span className="step-number">03</span><Globe2 size={24} /><h3>Verify anywhere</h3><p>Share a link or QR code. The verifier sees active, expired, or revoked status instantly.</p></article>
        </div>
      </section>

      <section className="use-case-section" id="use-cases">
        <div className="use-case-copy"><p className="kicker">Built for real recognition</p><h2>One registry. Many moments worth proving.</h2><p>From a semester’s work to a weekend buildathon, ProofMint gives institutions a reliable way to recognize participation and achievement.</p><button className="text-button arrow-link" type="button" onClick={() => onNavigate({ page: "app", tab: "credentials" })}>Explore the credential directory <ArrowUpRight size={16} /></button></div>
        <div className="use-case-grid">
          <article className="use-card indigo"><GraduationCap size={24} /><strong>Education</strong><span>Certificates, diplomas, course completion</span></article>
          <article className="use-card gold"><UsersRound size={24} /><strong>Communities</strong><span>Fellowships, contributions, memberships</span></article>
          <article className="use-card emerald"><Sparkles size={24} /><strong>Events</strong><span>Attendance, speakers, hackathon wins</span></article>
          <article className="use-card plum"><BookOpen size={24} /><strong>Professional growth</strong><span>Training, skills, continuing education</span></article>
        </div>
      </section>

      <section className="trust-section" id="trust">
        <div className="trust-panel"><LockKeyhole size={28} /><div><p className="kicker">Privacy by design</p><h2>Only the proof belongs on-chain.</h2><p>ProofMint records a credential hash and lifecycle status on Stellar. Sensitive or optional metadata stays off-chain, under issuer control.</p></div></div>
        <div className="trust-points"><span><Check size={17} /> Immutable metadata hash</span><span><Check size={17} /> Revocation aware</span><span><Check size={17} /> Recipient wallet ownership</span></div>
      </section>

      <footer className="marketing-footer"><span>ProofMint / Stellar testnet prototype</span><span>Verifiable credentials for open communities.</span></footer>
    </main>
  );
}

function AppSidebar({ activeTab, onNavigate, menuOpen, setMenuOpen }: { activeTab: AppTab; onNavigate: (route: Route) => void; menuOpen: boolean; setMenuOpen: (open: boolean) => void }) {
  return <aside className={`app-sidebar ${menuOpen ? "open" : ""}`}>
    <div className="sidebar-brand-row"><button className="brand" type="button" onClick={() => onNavigate({ page: "landing" })}><span className="brand-mark"><Fingerprint size={20} /></span><span>ProofMint<small>Issuer workspace</small></span></button><button className="sidebar-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
    <nav className="sidebar-nav" aria-label="Workspace navigation">{navItems.map(({ tab, label, icon: Icon }) => <button type="button" key={tab} className={tab === activeTab ? "active" : ""} onClick={() => { onNavigate({ page: "app", tab }); setMenuOpen(false); }}><Icon size={18} />{label}</button>)}</nav>
    <div className="sidebar-card"><div className="sidebar-card-icon"><Sparkles size={17} /></div><strong>Prototype workspace</strong><p>Explore the full product using fictional records and testnet-ready flows.</p><span>DEMO MODE</span></div>
    <button type="button" className="sidebar-return" onClick={() => onNavigate({ page: "landing" })}><ArrowRight size={16} /> Return to site</button>
  </aside>;
}

function AppHeader({ wallet, onNavigate, onOpenMenu }: { wallet: ReturnType<typeof useWallet>; onNavigate: (route: Route) => void; onOpenMenu: () => void }) {
  const [query, setQuery] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); if (query.trim()) onNavigate({ page: "verify", id: query.trim() }); }
  return <header className="app-header"><button className="mobile-menu" type="button" onClick={onOpenMenu} aria-label="Open navigation"><Menu size={20} /></button><form className="app-search" onSubmit={submit}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by credential ID" /><kbd>Enter</kbd></form><div className="app-header-actions"><span className="network-tag"><span /> {stellarConfig.network === "testnet" ? "Stellar testnet" : stellarConfig.network}</span><button type="button" className="icon-control" aria-label="Notifications"><Bell size={18} /><i /></button><WalletButton wallet={wallet} /></div></header>;
}

function WalletButton({ wallet, compact = false }: { wallet: ReturnType<typeof useWallet>; compact?: boolean }) {
  const [message, setMessage] = useState<string | null>(null);
  async function connect() {
    setMessage(null);
    try { await wallet.connect(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to connect wallet"); }
  }
  return <div className="wallet-control">{wallet.connected && wallet.address ? <button className="wallet-connected" type="button" onClick={wallet.disconnect}><span className="wallet-avatar">{wallet.address.slice(1, 3)}</span>{compact ? shortAddress(wallet.address) : <span><small>CONNECTED</small>{shortAddress(wallet.address)}</span>}<ChevronRight size={15} /></button> : <button className="button button-dark wallet-button" type="button" onClick={connect}><Wallet size={16} />{compact ? "Connect" : "Connect wallet"}</button>}{message && <span className="wallet-error">{message}</span>}</div>;
}

function Overview({ credentials, onNavigate }: { credentials: Credential[]; onNavigate: (route: Route) => void }) {
  const active = credentials.filter((credential) => credential.status === "Active").length;
  return <section className="workspace"><div className="workspace-title"><div><p className="kicker">Meridian Academy / Issuer</p><h1>Good morning, <em>Meridian.</em></h1><p>Here is the current health of your credential registry.</p></div><button className="button button-dark" type="button" onClick={() => onNavigate({ page: "app", tab: "issue" })}><Plus size={17} /> Issue credential</button></div><div className="metrics-grid"><Metric label="Credentials issued" value="1,284" trend="+18.4%" icon={Award} /><Metric label="Active credentials" value={String(active + 1_016)} trend="79.1% active" icon={CircleCheck} /><Metric label="Verified this month" value="342" trend="+26.7%" icon={BadgeCheck} /><Metric label="Registered issuers" value="12" trend="All in good standing" icon={Building2} /></div><div className="dashboard-grid"><section className="panel credentials-panel"><div className="panel-heading"><div><p className="kicker">Recent activity</p><h2>Credential registry</h2></div><button className="text-button" type="button" onClick={() => onNavigate({ page: "app", tab: "credentials" })}>View all <ArrowRight size={15} /></button></div><div className="credential-table">{credentials.slice(0, 4).map((credential) => <CredentialRow key={credential.id} credential={credential} onClick={() => onNavigate({ page: "verify", id: credential.id })} />)}</div></section><aside className="panel verification-panel"><p className="kicker">Public verification</p><div className="verification-orb"><Fingerprint size={30} /></div><h2>A verifiable story for every achievement.</h2><p>Share an ID, link, or QR code. ProofMint checks the credential lifecycle against the registry.</p><button className="button button-quiet" type="button" onClick={() => onNavigate({ page: "verify", id: "PM-2026-000184" })}>Open example <ArrowUpRight size={16} /></button></aside></div><div className="dashboard-grid lower"><section className="panel activity-panel"><div className="panel-heading"><div><p className="kicker">Registry events</p><h2>Latest activity</h2></div><button className="icon-control" type="button" aria-label="More actions"><MoreHorizontal size={18} /></button></div><div className="event-list"><Event icon={FilePlus2} title="Credential issued" detail="Stellar Smart Contract Foundations to K. Williams" time="12 minutes ago" /><Event icon={BadgeCheck} title="Credential verified" detail="PM-2026-000178 was checked from a public link" time="34 minutes ago" /><Event icon={UsersRound} title="Issuer review complete" detail="Constellation DAO is active and in good standing" time="2 hours ago" /></div></section><section className="panel insight-panel"><p className="kicker">Issuer insight</p><h2>Verification is up <strong>26.7%</strong> this month.</h2><div className="mini-chart"><span style={{ height: "38%" }} /><span style={{ height: "52%" }} /><span style={{ height: "42%" }} /><span style={{ height: "70%" }} /><span style={{ height: "59%" }} /><span style={{ height: "88%" }} /><span style={{ height: "76%" }} /></div><p>Public links are your most frequent verification channel.</p></section></div></section>;
}

function Metric({ label, value, trend, icon: Icon }: { label: string; value: string; trend: string; icon: typeof Award }) { return <article className="metric"><span className="metric-icon"><Icon size={19} /></span><p>{label}</p><strong>{value}</strong><small>{trend}</small></article>; }
function Event({ icon: Icon, title, detail, time }: { icon: typeof Award; title: string; detail: string; time: string }) { return <div className="event"><span className="event-icon"><Icon size={16} /></span><div><strong>{title}</strong><p>{detail}</p></div><time>{time}</time></div>; }
function CredentialRow({ credential, onClick }: { credential: Credential; onClick: () => void }) { return <button className="credential-row" type="button" onClick={onClick}><span className={`credential-mini ${credential.accent}`}><Award size={17} /></span><span className="credential-row-main"><strong>{credential.title}</strong><small>{credential.program}</small></span><span className="credential-date">{formatDate(credential.issuedAt)}</span><span className={`status-pill ${statusClass(credential.status)}`}>{credential.status}</span><ChevronRight size={17} /></button>; }

function CredentialDirectory({ credentials, onNavigate }: { credentials: Credential[]; onNavigate: (route: Route) => void }) {
  const [filter, setFilter] = useState<"All" | CredentialStatus>("All");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const visible = credentials.filter((credential) => (filter === "All" || credential.status === filter) && `${credential.title} ${credential.program} ${credential.recipient} ${credential.id}`.toLowerCase().includes(deferredQuery.toLowerCase()));
  return <section className="workspace"><div className="workspace-title"><div><p className="kicker">Credential registry</p><h1>Issued <em>credentials.</em></h1><p>Browse the fictional records included in this prototype workspace.</p></div><button className="button button-dark" type="button" onClick={() => onNavigate({ page: "app", tab: "issue" })}><Plus size={17} /> Issue credential</button></div><section className="panel directory-panel"><div className="directory-controls"><div className="segmented" role="tablist">{(["All", "Active", "Expired", "Revoked"] as const).map((item) => <button key={item} type="button" className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="table-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search credentials" /></label></div><div className="directory-header"><span>Credential</span><span>Recipient</span><span>Issued</span><span>Status</span><span /></div><div className="directory-list">{visible.map((credential) => <button className="directory-row" type="button" key={credential.id} onClick={() => onNavigate({ page: "verify", id: credential.id })}><span className={`credential-mini ${credential.accent}`}><Award size={17} /></span><span><strong>{credential.title}</strong><small>{credential.id} / {credential.program}</small></span><span>{credential.recipient}</span><span>{formatDate(credential.issuedAt)}</span><span className={`status-pill ${statusClass(credential.status)}`}>{credential.status}</span><ChevronRight size={17} /></button>)}</div>{visible.length === 0 && <div className="empty-state"><Search size={24} /><h3>No credentials match that search.</h3><p>Try a different credential name, recipient, or ID.</p></div>}</section></section>;
}

function IssueCredential({ wallet, onCreate }: { wallet: ReturnType<typeof useWallet>; onCreate: (input: Pick<Credential, "title" | "program" | "recipient" | "expiresAt">) => void }) {
  const [title, setTitle] = useState("Certificate of Completion");
  const [program, setProgram] = useState("Stellar Smart Contract Foundations");
  const [recipient, setRecipient] = useState("A. Rivera");
  const [expiresAt, setExpiresAt] = useState("");
  const [issued, setIssued] = useState(false);
  function issue(event: FormEvent) { event.preventDefault(); setIssued(true); window.setTimeout(() => onCreate({ title, program, recipient, expiresAt: expiresAt || undefined }), 650); }
  return <section className="workspace"><div className="workspace-title"><div><p className="kicker">New credential</p><h1>Issue with <em>intention.</em></h1><p>Design a record that is clear for the recipient and easy for anyone to verify.</p></div><span className="mock-mode-badge"><Sparkles size={14} /> Demo issue flow</span></div><div className="issue-layout"><form className="panel issue-form" onSubmit={issue}><div className="panel-heading"><div><p className="kicker">Credential details</p><h2>What are you recognizing?</h2></div><span className="step-indicator">1 of 2</span></div><label>Credential title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label><label>Program or achievement<input value={program} onChange={(event) => setProgram(event.target.value)} required /></label><div className="field-grid"><label>Recipient name<input value={recipient} onChange={(event) => setRecipient(event.target.value)} required /></label><label>Expiration date <span className="optional">Optional</span><input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label></div><div className="template-row"><span>Credential type</span><button type="button" className="template active"><GraduationCap size={16} /> Completion</button><button type="button" className="template"><Sparkles size={16} /> Achievement</button><button type="button" className="template"><UsersRound size={16} /> Membership</button></div><div className="form-footer"><p><LockKeyhole size={15} /> A metadata hash would be anchored on Stellar in the live integration.</p><button className="button button-dark" disabled={issued} type="submit">{issued ? "Issuing demo credential..." : <><FilePlus2 size={17} /> Issue demo credential</>}</button></div></form><aside className="credential-preview"><p className="kicker">Live preview</p><article className="certificate-card preview-card"><div className="certificate-topline"><span>MERIDIAN ACADEMY</span><span className="seal"><Fingerprint size={15} /> PROOFED</span></div><div className="certificate-icon"><GraduationCap size={30} /></div><p className="certificate-label">{title.toUpperCase()}</p><h2>{program}</h2><p className="certificate-recipient">Awarded to <strong>{recipient || "Recipient name"}</strong></p><div className="certificate-bottom"><span>Pending issuance</span><span><Clock3 size={15} /> Draft</span></div></article><p className="preview-note">{wallet.connected ? `Connected as ${shortAddress(wallet.address ?? "")}.` : "Connect Freighter to preview the real issuer wallet flow."}</p></aside></div></section>;
}

function VerifyWorkspace({ credentials, onNavigate }: { credentials: Credential[]; onNavigate: (route: Route) => void }) { const [query, setQuery] = useState("PM-2026-000184"); function submit(event: FormEvent) { event.preventDefault(); if (query.trim()) onNavigate({ page: "verify", id: query.trim() }); } return <section className="workspace verify-workspace"><div className="workspace-title"><div><p className="kicker">Public verification</p><h1>Trust, <em>not guesswork.</em></h1><p>Search a credential ID exactly as a recipient, employer, or community partner would.</p></div></div><section className="verify-search-panel"><Fingerprint size={30} /><h2>Verify a ProofMint credential</h2><form onSubmit={submit}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="PM-2026-000184" /><button className="button button-dark" type="submit">Verify <ArrowRight size={17} /></button></form><p>Try <button type="button" onClick={() => setQuery(credentials[0].id)}>{credentials[0].id}</button> to explore the public verifier.</p></section></section>; }

function VerificationPage({ credential, onNavigate, wallet }: { credential?: Credential; onNavigate: (route: Route) => void; wallet: ReturnType<typeof useWallet> }) {
  const [copied, setCopied] = useState(false);
  if (!credential) return <main className="verification-page"><VerificationNav onNavigate={onNavigate} wallet={wallet} /><section className="not-found-card"><Search size={34} /><p className="kicker">No matching record</p><h1>This credential could not be found.</h1><p>Check the credential ID and try again. This prototype recognizes the included fictional demo records.</p><button className="button button-dark" type="button" onClick={() => onNavigate({ page: "app", tab: "verify" })}>Open verifier <ArrowRight size={17} /></button></section></main>;
  const active = credential.status === "Active";
  function copy() { void navigator.clipboard?.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  return <main className="verification-page"><VerificationNav onNavigate={onNavigate} wallet={wallet} /><section className="verification-hero"><div><p className="kicker">ProofMint public verifier</p><h1>Credential <em>verified.</em></h1><p>This public record shows the current status and immutable reference for the achievement below.</p></div><div className={`verification-status ${statusClass(credential.status)}`}>{active ? <CircleCheck size={22} /> : <Clock3 size={22} />}<div><strong>{credential.status}</strong><span>{active ? "Valid and in good standing" : "No longer valid for verification"}</span></div></div></section><section className="verification-layout"><article className="verified-certificate"><div className="verified-certificate-header"><span>MERIDIAN ACADEMY</span><span><Fingerprint size={15} /> PROOFMINT VERIFIED</span></div><div className={`verified-medallion ${credential.accent}`}><Award size={40} /></div><p className="certificate-label">{credential.title.toUpperCase()}</p><h2>{credential.program}</h2><p className="verified-recipient">Presented to <strong>{credential.recipient}</strong></p><div className="verified-certificate-footer"><span>{credential.id}</span><span>{formatDate(credential.issuedAt)}</span></div></article><aside className="verification-details"><div className="detail-heading"><div><p className="kicker">Verification record</p><h2>Credential details</h2></div><span className={`status-pill ${statusClass(credential.status)}`}>{credential.status}</span></div><p className="detail-description">{credential.description}</p><div className="detail-grid"><Detail label="Issued by" value={credential.issuer} icon={Building2} /><Detail label="Issued on" value={formatDate(credential.issuedAt)} icon={CalendarDays} /><Detail label="Credential ID" value={credential.id} icon={Fingerprint} /><Detail label="Metadata hash" value={credential.hash} icon={LockKeyhole} /></div><div className="skills"><span>Verified skills</span><div>{credential.skills.map((skill) => <i key={skill}>{skill}</i>)}</div></div>{credential.expiresAt && <div className="expiry-callout"><Clock3 size={17} /><span>Expires {formatDate(credential.expiresAt)}</span></div>}<div className="verification-actions"><button type="button" className="button button-quiet" onClick={copy}><Copy size={16} /> {copied ? "Copied" : "Copy verification link"}</button><button type="button" className="button button-quiet"><QrCode size={16} /> QR code</button></div><p className="verification-disclaimer"><ShieldCheck size={15} /> This prototype uses fictional data. Live ProofMint verification will query the Stellar credential registry.</p></aside></section><section className="verification-bottom"><div><QrCode size={22} /><span><strong>Shareable proof</strong><small>Send this verification link to an employer, partner, or community.</small></span></div><button className="text-button" type="button" onClick={() => onNavigate({ page: "app", tab: "issue" })}>Issue a credential <ArrowRight size={16} /></button></section></main>;
}

function VerificationNav({ onNavigate, wallet }: { onNavigate: (route: Route) => void; wallet: ReturnType<typeof useWallet> }) { return <header className="verification-nav"><button className="brand" type="button" onClick={() => onNavigate({ page: "landing" })}><span className="brand-mark"><Fingerprint size={21} /></span><span>ProofMint<small>Public verifier</small></span></button><div><button className="text-button" type="button" onClick={() => onNavigate({ page: "app", tab: "verify" })}>Verify another</button><WalletButton wallet={wallet} compact /></div></header>; }
function Detail({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Building2 }) { return <div className="detail"><Icon size={16} /><span>{label}<strong>{value}</strong></span></div>; }
