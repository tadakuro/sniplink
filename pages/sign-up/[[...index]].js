import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "monospace",
      padding: 20,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap');`}</style>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 32,
          fontWeight: 800,
          background: "linear-gradient(135deg,#e8e8f0,#a78bfa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}>🔗 Trimly</h1>
        <p style={{ color: "#44445a", fontSize: 14 }}>Create an account to start trimming</p>
      </div>
      <SignUp routing="path" path="/sign-up" afterSignUpUrl="/" />
    </div>
  );
}
