import { redis } from "../config/redis";

const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])

local current = tonumber(redis.call('GET', key) or '0')
if current >= limit then
  return 0
end

local newCount = redis.call('INCR', key)
if newCount == 1 then
  redis.call('EXPIRE', key, ttl)
end
return 1
`;

export function getHourWindow(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  return `${y}-${m}-${d}-${h}`;
}

export function getRateLimitKey(senderId: string, date: Date = new Date()): string {
  return `email-rate:${senderId}:${getHourWindow(date)}`;
}

export async function checkAndIncrementRateLimit(senderId: string): Promise<boolean> {
  const limit = Number(process.env.MAX_EMAILS_PER_HOUR) || 50;
  const key = getRateLimitKey(senderId);
  const ttl = 3600;

  const result = (await redis.eval(RATE_LIMIT_SCRIPT, 1, key, String(limit), String(ttl))) as number;
  return result === 1;
}

export function getNextWindowDelay(): number {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  return nextHour.getTime() - now.getTime();
}
