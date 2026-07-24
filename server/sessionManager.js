const Redis = require('ioredis');
const crypto = require('crypto');

// Use REDIS_URL if provided, else mock mode for local dev without Docker
const redisUrl = process.env.REDIS_URL;
let redis = null;

if (redisUrl) {
    redis = new Redis(redisUrl);
    redis.on('error', (err) => console.error('Redis Client Error', err));
} else {
    console.warn("[SessionManager] No REDIS_URL provided. Using in-memory mock session store for local dev.");
    // Simple polyfill for local non-docker development
    redis = {
        store: new Map(),
        get: async (k) => redis.store.get(k) || null,
        set: async (k, v, ex, ttl) => { redis.store.set(k, v); if(ttl) setTimeout(()=>redis.store.delete(k), ttl*1000); return "OK"; },
        del: async (k) => redis.store.delete(k),
        keys: async (pattern) => {
            const regex = new RegExp("^" + pattern.replace("*", ".*") + "$");
            return Array.from(redis.store.keys()).filter(k => regex.test(k));
        }
    };
}

const SESSION_PREFIX = 'session:';
const CLINICAL_TTL = 8 * 60 * 60; // 8 hours
const BILLING_TTL = 1 * 60 * 60; // 1 hour

async function createSession(userId, deviceId, moduleType = 'clinical') {
    // 1. Enforce Concurrent Device Limits (Max 3)
    const existingKeys = await redis.keys(`${SESSION_PREFIX}${userId}:*`);
    if (existingKeys.length >= 3) {
        // Find the oldest session and kill it (mocked by just deleting the first one found for simplicity)
        await redis.del(existingKeys[0]);
    }

    const token = crypto.randomUUID();
    const sessionKey = `${SESSION_PREFIX}${userId}:${deviceId}:${token}`;
    const ttl = moduleType === 'billing' ? BILLING_TTL : CLINICAL_TTL;

    const payload = JSON.stringify({
        userId,
        deviceId,
        moduleType,
        createdAt: Date.now()
    });

    await redis.set(sessionKey, payload, 'EX', ttl);
    return token;
}

async function validateSession(token) {
    // We scan or lookup. Since token is part of the key, we'll find by pattern.
    const keys = await redis.keys(`${SESSION_PREFIX}*:*:*${token}`);
    if (!keys || keys.length === 0) return null;
    
    const sessionData = await redis.get(keys[0]);
    if (!sessionData) return null;

    return JSON.parse(sessionData);
}

async function killSwitch(userId) {
    const keys = await redis.keys(`${SESSION_PREFIX}${userId}:*`);
    for (const key of keys) {
        await redis.del(key);
    }
    return keys.length; // return how many sessions were killed
}

module.exports = {
    createSession,
    validateSession,
    killSwitch,
    CLINICAL_TTL,
    BILLING_TTL
};
