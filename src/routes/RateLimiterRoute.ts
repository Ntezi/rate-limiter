import express from 'express';
import RateLimiterController from "../controllers/RateLimiterController";
import {RouteConfig} from "../config/RouteConfig";
import RateLimiterMiddleware from "../middlewares/RateLimiterMiddleware";

export class RateLimiterRoute extends RouteConfig {
	constructor(app: express.Application) {
		super(app, 'RateLimiterRoute');
	}

	configureRoutes(): express.Application {
		this.app
			.route(`/rate-limiter`)
			.get(
				RateLimiterMiddleware.rateLimiter,
				RateLimiterController.check
			);

		return this.app;
	}
}
