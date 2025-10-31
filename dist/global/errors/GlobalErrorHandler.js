"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../../config/env");
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        stack: env_1.envConfig.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.default = globalErrorHandler;
