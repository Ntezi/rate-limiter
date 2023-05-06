import express from "express";
import CustomResponse from "../utils/CustomResponse";
import {StatusCodes} from "http-status-codes";

export class BaseController {
	protected tryCatchWrapper = (fn: Function) => {
		return async (req: express.Request, res: express.Response, next?: express.NextFunction) => {
			try {
				await fn(req, res, next);
			} catch (error: any) {
				CustomResponse.returnErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, error);
			}
		};
	};
}
