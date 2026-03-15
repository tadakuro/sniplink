
import redis from "../../../lib/redis";

export default async function handler(req, res) {
  const { code } = req.query;

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!code) return res.status(400).json({ error: "Code is required." });

  await redis.del(`link:${code}`);
  await redis.lrem("links:all", 0, code);

  return res.status(200).json({ success: true });
}
