import { nanoid } from "nanoid";
import redis from "../../lib/redis";
import { isValidUrl, sanitizeAlias } from "../../lib/utils";

// Reserved slugs that can't be used as aliases
const RESERVED = new Set(["api", "shorten", "_next", "favicon.ico", "robots.txt"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, alias } = req.body || {};

  // Validate URL
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL is required." });
  }
  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL. Make sure it starts with https://" });
  }

  // Determine code
  let code;
  if (alias) {
    code = sanitizeAlias(alias);
    if (!code || code.length < 2) {
      return res.status(400).json({ error: "Alias must be at least 2 characters." });
    }
    if (RESERVED.has(code)) {
      return res.status(400).json({ error: "That alias is reserved. Try another." });
    }
    // Check if already taken
    const existing = await redis.get(`link:${code}`);
    if (existing) {
      return res.status(409).json({ error: "That alias is already taken." });
    }
  } else {
    // Auto-generate unique code
    let attempts = 0;
    do {
      code = nanoid(6);
      const exists = await redis.get(`link:${code}`);
      if (!exists) break;
      attempts++;
    } while (attempts < 5);
  }

  const payload = {
    originalUrl: url,
    code,
    createdAt: Date.now(),
    clicks: 0,
  };

  // Store in Redis — key: link:<code>, value: JSON
  // Also push to a list so we can retrieve all links (sorted by creation)
  await redis.set(`link:${code}`, JSON.stringify(payload));
  await redis.lpush("links:all", code);

  return res.status(201).json({
    code,
    shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${code}`,
    originalUrl: url,
    createdAt: payload.createdAt,
    clicks: 0,
  });
}
