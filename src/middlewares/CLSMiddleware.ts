import * as cls from 'cls-hooked';
import { v4 as uuid } from 'uuid';

import express from "express";

/**
* This middleware is used to create a namespace for cls-hooked and bind the request and response objects to it.
 * This is to ensure that the request and response objects are available in the cls-hooked namespace.
 * @class CommonCLSMiddleware
* */
class CommonCLSMiddleware {
	createNamespace(req: express.Request, res: express.Response, next: express.NextFunction){
		const appNamespace = cls.createNamespace('app');
		appNamespace.bindEmitter(req);
		appNamespace.bindEmitter(res);

		const requestId = uuid();

		appNamespace.run(() => {
			appNamespace.set('requestId', requestId);
			appNamespace.set('ipAddress', req.ip);
			appNamespace.set('path', req.path);
			appNamespace.set('method', req.method);
			next();
		});
	}
}

export default new CommonCLSMiddleware();
