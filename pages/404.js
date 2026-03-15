
import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Mono', monospace",
      color: "#e8e8f0",
      textAlign: "center",
      padding: 20,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono&family=Syne:wght@800&display=swap');`}</style>
      <div style={{ fontSize: 80, lineHeight: 1 }}>🔗</div>
      <h1 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 48,
        fontWeight: 800,
        margin: "16px 0 8px",
        background: "linear-gradient(135deg,#e8e8f0,#a78bfa)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>404</h1>
      <p style={{ color: "#44445a", marginBottom: 28 }}>
        This short link doesn't exist or has been deleted.
      </p>
      <Link href="/" style={{
        background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
        color: "white",
        padding: "12px 24px",
        borderRadius: 10,
        textDecoration: "none",
        fontSize: 14,
      }}>
        ← Back to Snip Link
      </Link>
    </div>
  );
}
