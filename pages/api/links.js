
import redis from "../../lib/redis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get all codes from the list (most recent first, up to 100)
    const codes = await redis.lrange("links:all", 0, 99);
    if (!codes || codes.length === 0) {
      return res.status(200).json({ links: [] });
    }

    // Fetch each link's data
    const pipeline = redis.pipeline();
    codes.forEach((code) => pipeline.get(`link:${code}`));
    const results = await pipeline.exec();

    const links = results
      .map((r) => {
        if (!r) return null;
        try {
          const data = typeof r === "string" ? JSON.parse(r) : r;
          return {
            ...data,
            shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${data.code}`,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return res.status(200).json({ links });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch links." });
  }
}
