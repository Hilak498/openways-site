/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Good enough for a single-instance deployment / serverless warm instances.
 * For production scale, swap the store for Redis/Upstash (same interface) -
 * see README.
 */

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 10_000;

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket);
    return { allowed: false, remaining: 0 };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  // Prevent unbounded memory growth
  if (buckets.size > MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey) buckets.delete(oldestKey);
  }

  return { allowed: true, remaining: limit - bucket.timestamps.length };
}
