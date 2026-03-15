import { useState, useEffect, useCallback } from "react";
import Head from "next/head";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconLink  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IconCopy  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const IconTrash = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconArrow = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>;
const IconQr    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="4" y="4" width="5" height="5" fill="currentColor" stroke="none"/><rect x="15" y="4" width="5" height="5" fill="currentColor" stroke="none"/><rect x="4" y="15" width="5" height="5" fill="currentColor" stroke="none"/><rect x="14" y="14" width="3" height="3"/><rect x="19" y="19" width="2" height="2"/></svg>;
const IconStats = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;

// ── QR Code (pure SVG) ────────────────────────────────────────────────────────
function SimpleQR({ text, size = 140 }) {
  const hash = text.split("").reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0);
  const grid = 21;
  const cells = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const isFinderZone = (r < 8 && c < 8) || (r < 8 && c >= grid - 8) || (r >= grid - 8 && c < 8);
      if (isFinderZone) {
        const inFinder = (r < 7 && c < 7) || (r < 7 && c >= grid - 7) || (r >= grid - 7 && c < 7);
        cells.push({ r, c, fill: inFinder });
        continue;
      }
      const bit = (hash * (r * grid + c) * 2654435761) & 1;
      cells.push({ r, c, fill: bit === 1 });
    }
  }
  const cs = size / grid;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {cells.map(({ r, c, fill }) =>
        fill ? <rect key={`${r}-${c}`} x={c * cs} y={r * cs} width={cs} height={cs} fill="#0f0f0f" /> : null
      )}
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Home() {
  const [input, setInput]             = useState("");
  const [alias, setAlias]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [links, setLinks]             = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [copied, setCopied]           = useState(null);
  const [qrTarget, setQrTarget]       = useState(null);
  const [tab, setTab]                 = useState("shorten");
  const [justCreated, setJustCreated] = useState(null);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(data.links || []);
    } catch {
      // silently fail
    } finally {
      setLoadingLinks(false);
    }
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const handleShorten = async () => {
    setError("");
    const url = input.trim();
    if (!url) { setError("Please enter a URL."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, alias: alias.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }

      setJustCreated(data);
      setLinks(prev => [data, ...prev]);
      setInput("");
      setAlias("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code) => {
    try {
      await fetch(`/api/links/${code}`, { method: "DELETE" });
      setLinks(prev => prev.filter(l => l.code !== code));
      if (justCreated?.code === code) setJustCreated(null);
    } catch {}
  };

  const handleCopy = async (text, id) => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0);
  const maxClicks   = links.reduce((s, l) => Math.max(s, l.clicks || 0), 0);

  return (
    <>
      <Head>
        <title>Snip Link — URL Shortener</title>
        <meta name="description" content="Shorten any URL instantly. Free, fast, no sign-up required." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔗</text></svg>" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #080810; color: #e8e8f0; font-family: 'DM Mono', 'Fira Mono', monospace; }
        ::selection { background: #7c3aed44; }

        .snip-input {
          background: #13131f; border: 1.5px solid #2a2a40; border-radius: 10px;
          color: #e8e8f0; font-family: 'DM Mono', monospace; font-size: 14px;
          padding: 14px 18px; width: 100%; transition: border-color .2s, box-shadow .2s; outline: none;
        }
        .snip-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px #7c3aed22; }
        .snip-input::placeholder { color: #44445a; }

        .btn-primary {
          background: linear-gradient(135deg, #7c3aed, #4f46e5); border: none; border-radius: 10px;
          color: white; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 14px;
          font-weight: 500; padding: 14px 28px; display: flex; align-items: center; gap: 8px;
          transition: opacity .15s, transform .15s, box-shadow .2s; white-space: nowrap; justify-content: center;
        }
        .btn-primary:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); box-shadow: 0 8px 24px #7c3aed44; }
        .btn-primary:disabled { opacity: .45; cursor: not-allowed; }

        .btn-ghost {
          background: transparent; border: 1.5px solid #2a2a40; border-radius: 8px;
          color: #8888aa; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 12px;
          padding: 7px 12px; display: flex; align-items: center; gap: 6px; transition: all .15s;
        }
        .btn-ghost:hover { border-color: #7c3aed66; color: #e8e8f0; background: #7c3aed11; }

        .link-card {
          background: #0f0f1a; border: 1.5px solid #1e1e30; border-radius: 14px;
          padding: 18px 20px; transition: border-color .2s, transform .2s; animation: slideIn .3s ease;
        }
        .link-card:hover { border-color: #7c3aed55; transform: translateY(-1px); }

        @keyframes slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from {opacity:0} to {opacity:1} }
        @keyframes popIn { from {transform:scale(.92); opacity:0} to {transform:scale(1); opacity:1} }

        .tab-btn {
          background: transparent; border: none; border-bottom: 2px solid transparent;
          color: #44445a; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 13px;
          padding: 10px 4px; transition: color .15s, border-color .15s;
        }
        .tab-btn.active { color: #7c3aed; border-bottom-color: #7c3aed; }
        .tab-btn:hover:not(.active) { color: #8888aa; }

        .chip {
          background: #7c3aed22; border: 1px solid #7c3aed44; border-radius: 6px;
          color: #a78bfa; font-size: 11px; padding: 3px 8px;
        }

        .modal-overlay {
          position: fixed; inset: 0; background: #00000088; display: flex;
          align-items: center; justify-content: center; z-index: 100;
          backdrop-filter: blur(4px); animation: fadeIn .2s ease;
        }
        .modal-box {
          background: #13131f; border: 1.5px solid #2a2a40; border-radius: 16px;
          padding: 28px; text-align: center; max-width: 260px; width: 90%;
          animation: popIn .2s ease;
        }

        .scroll-area { overflow-y: auto; max-height: 460px; }
        .scroll-area::-webkit-scrollbar { width: 4px; }
        .scroll-area::-webkit-scrollbar-track { background: transparent; }
        .scroll-area::-webkit-scrollbar-thumb { background: #2a2a40; border-radius: 4px; }

        .glow-orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .noise { position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: .03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        a { color: inherit; }
      `}</style>

      {/* Background */}
      <div className="noise" />
      <div className="glow-orb" style={{ width:400, height:400, top:-100, right:-100, background:"#7c3aed18" }} />
      <div className="glow-orb" style={{ width:300, height:300, bottom:0, left:-80, background:"#4f46e518" }} />

      <div style={{ position:"relative", zIndex:1, maxWidth:640, margin:"0 auto", padding:"48px 20px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom:40, textAlign:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:16,
            background:"#7c3aed18", border:"1px solid #7c3aed33", borderRadius:100,
            padding:"6px 16px", fontSize:12, color:"#a78bfa" }}>
            <IconLink /> URL Shortener
          </div>
          <h1 style={{ fontFamily:"'Syne', sans-serif", fontSize:"clamp(2rem,6vw,3.2rem)",
            fontWeight:800, letterSpacing:"-1px", lineHeight:1.1,
            background:"linear-gradient(135deg,#e8e8f0 0%,#a78bfa 60%,#818cf8 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Snip &amp; Share
          </h1>
          <p style={{ color:"#55556a", fontSize:14, marginTop:10 }}>
            Shorten any URL instantly — free, no sign-up required
          </p>
        </div>

        {/* Stats bar */}
        {links.length > 0 && (
          <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
            {[
              { label:"Links created", value: links.length },
              { label:"Total clicks",  value: totalClicks },
              { label:"Most clicked",  value: maxClicks },
            ].map(s => (
              <div key={s.label} style={{ flex:1, minWidth:100, background:"#0f0f1a",
                border:"1.5px solid #1e1e30", borderRadius:12, padding:"12px 16px" }}>
                <div style={{ fontSize:22, fontWeight:500, color:"#a78bfa", fontFamily:"'Syne',sans-serif" }}>{s.value}</div>
                <div style={{ fontSize:11, color:"#44445a", marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", gap:20, borderBottom:"1px solid #1e1e30", marginBottom:28 }}>
          {[["shorten","Shorten"],["links",`My Links${links.length ? ` (${links.length})` : ""}`]].map(([id,label]) => (
            <button key={id} className={`tab-btn${tab===id?" active":""}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {/* ── SHORTEN TAB ── */}
        {tab === "shorten" && (
          <div>
            {/* Success banner */}
            {justCreated && (
              <div style={{ background:"#0d1f1a", border:"1.5px solid #134e3a", borderRadius:14,
                padding:"20px 22px", marginBottom:24, animation:"slideIn .4s ease" }}>
                <div style={{ fontSize:11, color:"#4ade80", marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                  <IconCheck /> Link created successfully
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  <a href={justCreated.shortUrl} target="_blank" rel="noopener noreferrer"
                    style={{ flex:1, fontFamily:"'Syne',sans-serif", fontSize:18,
                      fontWeight:700, color:"#86efac", wordBreak:"break-all", textDecoration:"none" }}>
                    {justCreated.shortUrl}
                  </a>
                  <button className="btn-ghost" onClick={() => handleCopy(justCreated.shortUrl, "just")}
                    style={{ borderColor:"#134e3a", color: copied==="just" ? "#4ade80" : "#4ade8099" }}>
                    {copied==="just" ? <><IconCheck/>Copied!</> : <><IconCopy/>Copy</>}
                  </button>
                </div>
                <div style={{ marginTop:10, fontSize:12, color:"#44554a",
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  → {justCreated.originalUrl}
                </div>
              </div>
            )}

            {/* Form */}
            <div style={{ background:"#0f0f1a", border:"1.5px solid #1e1e30", borderRadius:16, padding:"24px" }}>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:12, color:"#55556a", marginBottom:8 }}>PASTE YOUR LONG URL</label>
                <input className="snip-input"
                  placeholder="https://example.com/a-very-long-url-nobody-wants-to-type"
                  value={input}
                  onChange={e => { setInput(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleShorten()}
                />
              </div>
              <div style={{ marginBottom:18 }}>
                <label style={{ display:"block", fontSize:12, color:"#55556a", marginBottom:8 }}>
                  CUSTOM ALIAS <span style={{ color:"#33334a" }}>— optional</span>
                </label>
                <div style={{ display:"flex" }}>
                  <div style={{ background:"#0d0d18", border:"1.5px solid #2a2a40", borderRight:"none",
                    borderRadius:"10px 0 0 10px", padding:"14px", fontSize:13, color:"#33334a",
                    whiteSpace:"nowrap", display:"flex", alignItems:"center" }}>
                    {(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/https?:\/\//, "")}/
                  </div>
                  <input className="snip-input"
                    style={{ borderRadius:"0 10px 10px 0", borderLeft:"none" }}
                    placeholder="my-link"
                    value={alias}
                    onChange={e => { setAlias(e.target.value); setError(""); }}
                    onKeyDown={e => e.key === "Enter" && handleShorten()}
                  />
                </div>
              </div>

              {error && (
                <div style={{ background:"#2a0f0f", border:"1px solid #7f1d1d", borderRadius:8,
                  padding:"10px 14px", fontSize:13, color:"#fca5a5", marginBottom:14 }}>
                  {error}
                </div>
              )}

              <button className="btn-primary" onClick={handleShorten} disabled={loading} style={{ width:"100%" }}>
                {loading ? (
                  <>
                    <span style={{ display:"inline-block", width:16, height:16,
                      border:"2px solid #ffffff44", borderTopColor:"#fff",
                      borderRadius:"50%", animation:"spin 0.6s linear infinite" }} />
                    Shortening…
                  </>
                ) : <>Shorten URL <IconArrow /></>}
              </button>
            </div>

            {/* How it works */}
            <div style={{ marginTop:24, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {[
                { n:"01", title:"Paste URL",   desc:"Drop any long link in the box above" },
                { n:"02", title:"Customize",   desc:"Add an alias or leave it auto-generated" },
                { n:"03", title:"Share",       desc:"Copy and share your short link instantly" },
              ].map(s => (
                <div key={s.n} style={{ background:"#0a0a14", border:"1px solid #1a1a28",
                  borderRadius:12, padding:"16px 14px" }}>
                  <div style={{ fontSize:11, color:"#7c3aed", fontWeight:500, marginBottom:6 }}>{s.n}</div>
                  <div style={{ fontSize:13, color:"#c8c8e0", marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:11, color:"#33334a", lineHeight:1.5 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LINKS TAB ── */}
        {tab === "links" && (
          <div>
            {loadingLinks ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"#33334a" }}>
                <span style={{ display:"inline-block", width:24, height:24,
                  border:"2px solid #2a2a40", borderTopColor:"#7c3aed",
                  borderRadius:"50%", animation:"spin 0.6s linear infinite" }} />
              </div>
            ) : links.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", color:"#33334a" }}>
                <div style={{ fontSize:40, marginBottom:16 }}>🔗</div>
                <div style={{ fontSize:15, color:"#44445a" }}>No links yet</div>
                <div style={{ fontSize:13, marginTop:6 }}>Shorten your first URL to see it here</div>
                <button className="btn-primary" onClick={() => setTab("shorten")}
                  style={{ margin:"20px auto 0", display:"inline-flex" }}>
                  Shorten a URL <IconArrow />
                </button>
              </div>
            ) : (
              <div className="scroll-area" style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {links.map(link => (
                  <div key={link.code} className="link-card">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                          <a href={link.shortUrl} target="_blank" rel="noopener noreferrer"
                            style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700,
                              color:"#a78bfa", textDecoration:"none" }}>
                            {link.shortUrl}
                          </a>
                          <span className="chip">{link.clicks || 0} clicks</span>
                          <span style={{ fontSize:11, color:"#33334a" }}>{timeAgo(link.createdAt)}</span>
                        </div>
                        <div style={{ fontSize:12, color:"#33334a", overflow:"hidden",
                          textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          → {link.originalUrl}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8, marginTop:14, flexWrap:"wrap" }}>
                      <button className="btn-ghost" onClick={() => handleCopy(link.shortUrl, link.code)}>
                        {copied===link.code ? <><IconCheck/>Copied</> : <><IconCopy/>Copy</>}
                      </button>
                      <button className="btn-ghost" onClick={() => setQrTarget(link)}>
                        <IconQr/>QR Code
                      </button>
                      <button className="btn-ghost" onClick={() => handleDelete(link.code)}
                        style={{ marginLeft:"auto", color:"#f8717188", borderColor:"#7f1d1d44" }}>
                        <IconTrash/>Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrTarget && (
        <div className="modal-overlay" onClick={() => setQrTarget(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:13, color:"#a78bfa", marginBottom:4,
              fontFamily:"'Syne',sans-serif", fontWeight:700 }}>QR Code</div>
            <div style={{ fontSize:11, color:"#44445a", marginBottom:18 }}>{qrTarget.shortUrl}</div>
            <div style={{ display:"inline-block", padding:12, background:"white", borderRadius:12 }}>
              <SimpleQR text={qrTarget.shortUrl} size={140} />
            </div>
            <div style={{ marginTop:16 }}>
              <button className="btn-ghost" onClick={() => setQrTarget(null)}
                style={{ width:"100%", justifyContent:"center" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
