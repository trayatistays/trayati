import { redis } from "@/lib/redis";
import { addDays, listDatesInRange } from "@/lib/booking/date";
import type { BookingLock } from "@/lib/booking/types";

const LOCK_TTL_SECONDS = 10 * 60;

function scopeKey(stayId: string, roomId?: string | null) {
  return `${stayId}:${roomId ?? "__stay__"}`;
}

function nightKey(stayId: string, roomId: string | null | undefined, date: string) {
  return `booking:lock:night:${scopeKey(stayId, roomId)}:${date}`;
}

function lockDataKey(lockId: string) {
  return `booking:lock:data:${lockId}`;
}

function lockIndexKey(stayId: string, roomId?: string | null) {
  return `booking:lock:index:${scopeKey(stayId, roomId)}`;
}

const acquireLockScript = `
local lockDataKey = KEYS[1]
local indexKey = KEYS[2]
for i = 3, #KEYS do
  if redis.call("EXISTS", KEYS[i]) == 1 then
    return 0
  end
end
for i = 3, #KEYS do
  redis.call("SET", KEYS[i], ARGV[1], "EX", ARGV[2])
end
redis.call("SET", lockDataKey, ARGV[3], "EX", ARGV[2])
redis.call("ZADD", indexKey, ARGV[4], ARGV[1])
redis.call("EXPIRE", indexKey, ARGV[2])
return 1
`;

const releaseLockScript = `
local lockId = ARGV[1]
local lockDataKey = KEYS[1]
local indexKey = KEYS[2]
for i = 3, #KEYS do
  local current = redis.call("GET", KEYS[i])
  if current == lockId then
    redis.call("DEL", KEYS[i])
  end
end
redis.call("DEL", lockDataKey)
redis.call("ZREM", indexKey, lockId)
return 1
`;

export function getLockTtlSeconds() {
  return LOCK_TTL_SECONDS;
}

export async function createRedisLock(input: Omit<BookingLock, "expiresAt">) {
  const expiresAt = new Date(Date.now() + LOCK_TTL_SECONDS * 1000).toISOString();
  const lock: BookingLock = {
    ...input,
    roomId: input.roomId ?? null,
    expiresAt,
  };

  const nights = listDatesInRange(lock.startDate, lock.endDate);
  const keys = [
    lockDataKey(lock.id),
    lockIndexKey(lock.stayId, lock.roomId),
    ...nights.map((date) => nightKey(lock.stayId, lock.roomId, date)),
  ];

  const result = await redis.eval(acquireLockScript, keys, [
    lock.id,
    String(LOCK_TTL_SECONDS),
    JSON.stringify(lock),
    String(new Date(expiresAt).getTime()),
  ]) as number;

  return result === 1 ? lock : null;
}

export async function releaseRedisLock(lock: Pick<BookingLock, "id" | "stayId" | "roomId" | "startDate" | "endDate">) {
  const nights = listDatesInRange(lock.startDate, lock.endDate);
  const keys = [
    lockDataKey(lock.id),
    lockIndexKey(lock.stayId, lock.roomId),
    ...nights.map((date) => nightKey(lock.stayId, lock.roomId, date)),
  ];

  await redis.eval(releaseLockScript, keys, [lock.id]);
}

export async function getRedisLock(lockId: string) {
  return redis.get<BookingLock>(lockDataKey(lockId));
}

export async function listActiveRedisLocks(input: { stayId: string; roomId?: string | null }) {
  const indexKey = lockIndexKey(input.stayId, input.roomId);
  const now = Date.now();

  await redis.zremrangebyscore(indexKey, 0, now);
  const ids = await redis.zrange<string[]>(indexKey, 0, -1);

  if (!ids || ids.length === 0) {
    return [];
  }

  const locks = await Promise.all(
    ids.map(async (id) => redis.get<BookingLock>(lockDataKey(id))),
  );

  return locks.filter((lock): lock is BookingLock => {
    if (!lock) {
      return false;
    }

    return new Date(lock.expiresAt).getTime() > now;
  });
}

export async function checkRedisRangeConflict(input: {
  stayId: string;
  roomId?: string | null;
  startDate: string;
  endDate: string;
  ignoreLockId?: string | null;
}) {
  const nights = listDatesInRange(input.startDate, input.endDate);

  for (const date of nights) {
    const lockId = await redis.get<string>(nightKey(input.stayId, input.roomId, date));
    if (lockId && lockId !== input.ignoreLockId) {
      return true;
    }
  }

  return false;
}

export function extendLockPreview(lock: Pick<BookingLock, "startDate" | "endDate">) {
  return {
    ...lock,
    releaseDate: addDays(lock.endDate, 0),
  };
}
