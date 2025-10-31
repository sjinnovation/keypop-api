import { NextFunction, Request, Response } from "express";
import { envConfig } from "../../config/env";


const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        stack: envConfig.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

export default globalErrorHandler;