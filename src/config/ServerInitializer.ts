import dotenv from 'dotenv';

const dotenvResult = dotenv.config();
if (dotenvResult.error) {
	Logger.error(dotenvResult.error.toString())
	throw dotenvResult.error;
}

import express from 'express';
import http from "http";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as OpenApiValidator from "express-openapi-validator";
import swagger from "swagger-ui-dist";
import LoggerMiddleware from "../middlewares/LoggerMiddleware";
import * as path from "path";
import CLSMiddleware from "../middlewares/CLSMiddleware";
import Logger from "../utils/Logger";
import {isExists} from "../utils";
import fs from "fs";
import morgan from "morgan";
import RedisClient from "../utils/external_clients/RedisClient";
import CustomResponse from "../utils/CustomResponse";
import {RouteConfig} from "./RouteConfig";

class ServerInitializer {

	async createServer(app: express.Application = express(), apiSpec: string): Promise<http.Server> {

		const allowedOrigins = ['http://127.0.0.1:3000', 'http://localhost:3000'];

		const corsOptions = {
			// @ts-ignore
			origin: (origin, callback) => {
				if (allowedOrigins.indexOf(origin) !== -1 || !isExists(origin)) {
					callback(null, true)
				} else {
					callback(new Error('Not allowed by CORS'));
				}
			},
			optionsSuccessStatus: 200
		}

		const credentials = (req: express.Request, res: express.Response, next: express.NextFunction) => {
			const origin = req.headers.origin;
			// @ts-ignore
			if (allowedOrigins.includes(origin)) {
				// @ts-ignore
				res.header('Access-Control-Allow-Credentials', true);
			}
			next();
		}

		app.use(credentials);

		app.use(cookieParser());
		app.use(CLSMiddleware.createNamespace)
		app.use(bodyParser.json());
		app.use(cors(corsOptions));
		app.use(helmet());
		app.use(LoggerMiddleware)
		app.use(express.json());
		app.use(express.text());
		app.use(express.urlencoded({extended: false}));

		// create a stream (in append mode)
		const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

		// setup the logger
		app.use(morgan('combined', {stream: accessLogStream}));


		app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
			res.set({"Content-Security-Policy": "default-src 'self' 'unsafe-inline';"})
			next();
		});

		const swaggerFolder = apiSpec.split(path.sep).slice(0, -1).join(path.sep);

		app.use(`/`, express.static(swaggerFolder));
		app.use(`/dist`, express.static(swagger.getAbsoluteFSPath()));
		app.use(OpenApiValidator.middleware({
				apiSpec,
				validateApiSpec: false,
				validateRequests: true,
				validateResponses: false
			})
		);

		app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
			CustomResponse.returnErrorResponse(res, error.status, error.message)
		});

		return http.createServer(app)
	}

	async initializeServer(
		app: express.Application,
		apiSpec: string,
		routeClasses: Array<new (app: express.Application) => RouteConfig>,
		serverName: string,
		port: number,
	) {
		const server = await this.createServer(app, apiSpec);

		const routes = routeClasses.map((RouteClass) => new RouteClass(app));

		server.listen(port, async () => {
			Logger.info(`${serverName} is up and running at http://localhost:${port}`);
			routes.forEach((route: RouteConfig) => {
				Logger.debug(`${serverName} Routes configured for ${route.getName()}`);
			});
		});

		await RedisClient.init()
			.then(() => {
				Logger.info(`Redis Client has been initialized in ${serverName}!`);
			})
			.catch((error: any) => {
				Logger.error(
					`Error during Redis Client initialization in ${serverName}: ${error}`
				);
			});
	}
}

export default new ServerInitializer();
