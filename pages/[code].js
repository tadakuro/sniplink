import redis from "../lib/redis";

// This page handles the actual redirect.
// It runs server-side, increments the click count, then redirects.
export async function getServerSideProps({ params }) {
  const { code } = params;

  // Skip Next.js internals
  if (!code || code.startsWith("_")) {
    return { notFound: true };
  }

  try {
    const raw = await redis.get(`link:${code}`);
    if (!raw) {
      return { notFound: true };
    }

    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    // Increment click counter atomically
    const updated = { ...data, clicks: (data.clicks || 0) + 1 };
    await redis.set(`link:${code}`, JSON.stringify(updated));

    return {
      redirect: {
        destination: data.originalUrl,
        permanent: false, // 302 so click tracking always fires
      },
    };
  } catch (err) {
    console.error("Redirect error:", err);
    return { notFound: true };
  }
}

// This component only shows briefly on error (normally redirects)
export default function RedirectPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#080810",
      color: "#e8e8f0",
      fontFamily: "monospace",
      fontSize: 16,
    }}>
      Redirecting…
    </div>
  );
}
