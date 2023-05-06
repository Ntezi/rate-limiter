import { Request, Response, NextFunction } from 'express';
import RateLimiterService from "../services/RateLimiterService";
import {StatusCodes} from "http-status-codes";
import CustomResponse from "../utils/CustomResponse";

class RateLimiterMiddleware {
    private slidingWindowRateLimit: number;
    private apiQuotaLimit: number;
    private adaptiveRateLimitThreshold: number;
    private adaptiveRateLimitMultiplier: number;

    constructor() {
        this.slidingWindowRateLimit = 100; // Requests per minute
        this.apiQuotaLimit = 10000; // Requests per month
        this.adaptiveRateLimitThreshold = 5000; // Threshold for adaptive rate limiting
        this.adaptiveRateLimitMultiplier = 0.5; // Multiplier for adaptive rate limiting
    }

    public rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
        const clientId = req.ip; // Replace with an appropriate method to identify the client

        // Evaluate Rate Limit
        const rateLimitResult = await RateLimiterService.evaluateRateLimit(
            clientId,
            this.slidingWindowRateLimit,
            this.apiQuotaLimit,
            this.adaptiveRateLimitThreshold,
            this.adaptiveRateLimitMultiplier
        );

        const allowed = rateLimitResult.allowed;
        const throttleStatus = allowed ? 200 : 429;
        const remaining = rateLimitResult.remaining;
        const resetTime = rateLimitResult.resetTime;

        res.setHeader('X-RateLimit-Limit', this.slidingWindowRateLimit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', resetTime);

        if (throttleStatus === StatusCodes.TOO_MANY_REQUESTS) {
            CustomResponse.returnErrorResponse(res, StatusCodes.TOO_MANY_REQUESTS, "Too Many Requests");
        } else {
            next();
        }
    };
}


export default new RateLimiterMiddleware();
