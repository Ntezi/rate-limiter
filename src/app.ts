import express from 'express';
import path from "path";
import ServerInitializer from "./config/ServerInitializer";
import {HealthCheckRoute, RateLimiterRoute} from "./routes";

const app: express.Application = express();

ServerInitializer.initializeServer(
    app,
    path.join(__dirname, "/swagger/api.yaml"),
    [RateLimiterRoute, HealthCheckRoute],
    "Rate Limiter Server",
    Number(process.env.PORT) || 2305,
);
