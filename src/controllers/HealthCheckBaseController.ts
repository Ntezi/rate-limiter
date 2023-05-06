import CustomResponse from "../utils/CustomResponse";
import express from "express";
import {StatusCodes} from "http-status-codes";
import {BaseController} from "./BaseController";
import RedisClient from "../utils/external_clients/RedisClient";

export class HealthCheckBaseController extends BaseController {

	constructor() {
		super();
	}

	healthCheck = this.tryCatchWrapper(async (_req: express.Request, res: express.Response) => {
		CustomResponse.returnSuccessResponse(res, 'Server is healthy', StatusCodes.OK);
	});

	liveness = this.tryCatchWrapper(async (_req: express.Request, res: express.Response) => {
		let livenessStatus = true;
		if (!RedisClient.isInitialized) {
			livenessStatus = false;
		}

		if (livenessStatus) {
			CustomResponse.returnSuccessResponse(res, 'Liveness check passed', StatusCodes.OK);
		} else {
			CustomResponse.returnErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Liveness check failed');
		}

	});

	readiness = this.tryCatchWrapper(async (_req: express.Request, res: express.Response) => {
		let readinessStatus = true;
		if (!RedisClient.isInitialized) {
			readinessStatus = false;
		}

		if (readinessStatus) {
			CustomResponse.returnSuccessResponse(res, 'Readiness check passed', StatusCodes.OK);
		} else {
			CustomResponse.returnErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Readiness check failed');

		}
	});
}
