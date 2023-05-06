import { Request } from 'express';
import RedisClient from "../utils/external_clients/RedisClient";
import {isExists} from "../utils";

class RateLimiterService {

    constructor() {}

    async evaluateRateLimit(
        clientId: string,
        slidingWindowRateLimit: number,
        apiQuotaLimit: number,
        adaptiveRateLimitThreshold: number,
        adaptiveRateLimitMultiplier: number
    ) {
        // Check Sliding Window
        const slidingWindowResult = await this.checkSlidingWindow(clientId, slidingWindowRateLimit);

        // Check API Quotas
        const apiQuotasResult = await this.checkApiQuotas(clientId, apiQuotaLimit);

        // Apply Adaptive Rate Limiting
        const adaptiveRateLimitResult = await this.adaptiveRateLimiting(
            clientId,
            slidingWindowRateLimit,
            adaptiveRateLimitThreshold,
            adaptiveRateLimitMultiplier
        );

        const allowed =
            slidingWindowResult.allowed && apiQuotasResult.allowed && adaptiveRateLimitResult.allowed;
        const throttleStatus = !allowed
            ? slidingWindowResult.throttleStatus ||
            apiQuotasResult.throttleStatus ||
            adaptiveRateLimitResult.throttleStatus
            : 200;
        const remaining = Math.min(
            slidingWindowResult.remaining,
            apiQuotasResult.remaining,
            adaptiveRateLimitResult.remaining
        );
        const resetTime = Math.max(
            slidingWindowResult.resetTime,
            apiQuotasResult.resetTime,
            adaptiveRateLimitResult.resetTime
        );
        const retryAfter = !allowed ? Math.ceil((resetTime - Date.now()) / 1000) : 0;

        return {
            allowed,
            throttleStatus,
            remaining,
            resetTime,
            retryAfter,
        };
    }

    private async checkSlidingWindow(clientId: string, rateLimit: number) {
        const now = Date.now();
        const windowSize = 60 * 1000; // 1 minute in milliseconds
        const key = `sliding_window:${clientId}`;

        // Clean up old request timestamps
        await RedisClient.zremrangebyscore(key, '-inf', now - windowSize);

        // Add current request timestamp
        await RedisClient.zadd(key, now, now.toString());

        // Count requests within the current window
        const requestCount = await RedisClient.zcount(key, now - windowSize + 1, '+inf');

        // Set TTL for the key if not already set
        if (!(await RedisClient.exists(key))) {
            await RedisClient.expire(key, Math.ceil(windowSize / 1000));
        }

        const allowed = requestCount <= rateLimit;
        const remaining = allowed ? rateLimit - requestCount : 0;
        const resetTime = now + windowSize;
        const throttleStatus = !allowed ? 429 : 200;

        return { allowed, remaining, resetTime, throttleStatus };
    }


    private async checkApiQuotas(clientId: string, quotaLimit: number) {
        const key = `api_quota:${clientId}`;
        const now = Date.now();
        const startOfMonth = new Date(now).setDate(1);
        const endOfMonth = new Date(new Date(now).getFullYear(), new Date(now).getMonth() + 1, 0).valueOf();

        // Increment request count for the current month
        await RedisClient.hincrby(key, 'request_count', 1);

        // Set/reset the TTL if not already set
        if (!(await RedisClient.exists(key))) {
            await RedisClient.expireat(key, Math.ceil(endOfMonth / 1000));
        }

        // Get the current request count
        const requestCount = await RedisClient.hget(key, 'request_count');

        const allowed = requestCount.length <= quotaLimit;
        const remaining = allowed ? quotaLimit - requestCount.length : 0;
        const resetTime = endOfMonth;
        const throttleStatus = !allowed ? 429 : 200;

        return { allowed, remaining, resetTime, throttleStatus };
    }


    private async adaptiveRateLimiting(clientId: string, rateLimit: number, threshold: number, multiplier: number) {
        const globalKey = 'global_request_count';
        const clientKey = `adaptive_rate_limit:${clientId}`;

        // Increment global request count
        await RedisClient.incr(globalKey);

        // Get global request count
        const globalRequestCount = await RedisClient.get(globalKey);

        // Check if the global request count has exceeded the threshold
        if (globalRequestCount > threshold) {
            // Calculate the new rate limit based on the multiplier
            const newRateLimit = Math.ceil(rateLimit * multiplier);

            // Update the client's rate limit
            await RedisClient.set(clientKey, String(newRateLimit));

            // Set/reset the TTL for 1 hour
            await RedisClient.expire(clientKey, 3600);

            rateLimit = newRateLimit;
        }

        const allowed = globalRequestCount <= threshold;
        const throttleStatus = !allowed ? 429 : 200;

        // Calculate the remaining requests
        const remaining = rateLimit - +globalRequestCount;

        // Calculate the reset time
        const resetTime = await RedisClient.ttl(clientKey);

        return { allowed, throttleStatus, rateLimit, remaining, resetTime: resetTime };
    }

}

export default new RateLimiterService();
