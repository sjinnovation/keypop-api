"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, responseData) => {
    res.status(responseData.statusCode).json({
        success: responseData.success,
        message: responseData.message,
        data: responseData.data
    });
};
exports.default = sendResponse;
