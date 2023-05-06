import express from "express";
import {RouteConfig} from "../config/RouteConfig";
import HealthCheckController from "../controllers/HealthCheckController";

export class HealthCheckRoute extends RouteConfig {
	constructor(app: express.Application) {
		super(app, 'HealthCheckRoute');
	}

	configureRoutes(): express.Application {
		this.app.route('/health/check').get(HealthCheckController.healthCheck);
		this.app.route('/health/liveness').get(HealthCheckController.liveness);
		this.app.route('/health/readiness').get(HealthCheckController.readiness);
		return this.app;
	}
}
