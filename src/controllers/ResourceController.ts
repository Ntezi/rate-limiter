import {BaseController} from "./BaseController";
import CustomResponse from "../utils/CustomResponse";
import express from "express";
import {StatusCodes} from "http-status-codes";

export class ResourceController extends BaseController {
    constructor() {
        super();
    }
    check = this.tryCatchWrapper(async (req: express.Request, res: express.Response) => {
        CustomResponse.returnSuccessResponse(res, "Rate limiters passed successfully", StatusCodes.OK);
    });
}
