import redis from "../../lib/redis";

export async function getServerSideProps({ params }) {
  const { code } = params;

  try {
    const raw = await redis.get(`link:${code}`);
    if (!raw) return { notFound: true };

    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    // Increment click counter
    const updated = { ...data, clicks: (data.clicks || 0) + 1 };
    await redis.set(`link:${code}`, JSON.stringify(updated));

    return {
      redirect: {
        destination: data.originalUrl,
        permanent: false,
      },
    };
  } catch (err) {
    console.error("Redirect error:", err);
    return { notFound: true };
  }
}

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
