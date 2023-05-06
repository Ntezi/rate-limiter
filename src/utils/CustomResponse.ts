import express from 'express';
import {getReasonPhrase} from 'http-status-codes';
import Logger from "./Logger";
import {getNamespace} from "cls-hooked";
import {isExists} from "./index";

class CustomResponse {

	getRequestInfo() {
		const appNamespace = getNamespace('app');
		const requestId = appNamespace?.get('requestId') || 'GLOBAL';
		const path = appNamespace?.get('path') || '';
		const method = appNamespace?.get('method') || '';
		return {
			request_id: requestId,
			path: path,
			method: method
		};
	}

	getResponseObject(httpStatusCode: number, data: any = null, error: any = null) {
		const { request_id, path, method } = this.getRequestInfo();
		return {
			request_id,
			path,
			method,
			status_code: httpStatusCode,
			message: getReasonPhrase(httpStatusCode),
			data : data || undefined,
			error: isExists(error)
				? JSON.stringify(error)
					? isExists(error.message)
						? error.message
						: JSON.stringify(error)
					: JSON.stringify(error)
				: undefined
		};
	}

	returnSuccessResponse(res: express.Response, data: any = null, httpStatusCode: number) {
		const responseObject = this.getResponseObject(httpStatusCode, data);
		res.status(httpStatusCode).json(responseObject);
	}

	returnErrorResponse(res: express.Response, httpStatusCode: number, error: any = null) {
		const responseObject = this.getResponseObject(httpStatusCode, null, error);
		Logger.error(`[${httpStatusCode}: ${getReasonPhrase(httpStatusCode)} - ${JSON.stringify(error)}]`, );
		res.status(httpStatusCode).json(responseObject);
	}
}


export default new CustomResponse();
