import express from 'express';
import {HealthCheckBaseController} from "../controllers/HealthCheckBaseController";
export abstract class RouteConfig {
    app: express.Application;
    name: string;

    protected constructor(app: express.Application, name: string) {
        this.app = app;
        this.name = name;
        this.configureRoutes();
    }
    getName(): string {
        return this.name;
    }

    protected async configureHealthRoutes(controller: HealthCheckBaseController): Promise<express.Application> {
        this.app.route('/health/check').get(controller.healthCheck);
        this.app.route('/health/liveness').get(controller.liveness);
        this.app.route('/health/readiness').get(controller.readiness);
        return this.app;
    }

    abstract configureRoutes(): express.Application;
}
