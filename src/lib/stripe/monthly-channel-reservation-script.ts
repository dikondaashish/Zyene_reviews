// Validate every channel before changing any counter; retries reuse one claim.
export const MONTHLY_CHANNEL_RESERVATION_SCRIPT = `
local channels = #KEYS - 1
local claimed = redis.call("GET", KEYS[channels + 1])
local used = {}
for i = 1, channels do
  local observed = tonumber(ARGV[(i - 1) * 2 + 1])
  local cap = tonumber(ARGV[(i - 1) * 2 + 2])
  used[i] = math.max(tonumber(redis.call("GET", KEYS[i])) or 0, observed)
  if cap ~= -1 and (used[i] > cap or (not claimed and used[i] >= cap)) then return 0 end
end
if claimed then return 1 end
local ttl = tonumber(ARGV[channels * 2 + 1])
for i = 1, channels do
  redis.call("SET", KEYS[i], used[i] + 1, "EX", ttl)
end
redis.call("SET", KEYS[channels + 1], "1", "EX", ttl)
return 1
`;
