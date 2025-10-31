import { Response } from "express";

interface ResponseData<T> {
    statusCode: number;
    success: boolean;
    message?: string;
    data?: T;
}

const sendResponse = <T>(res: Response, responseData: ResponseData<T>) => {
    res.status(responseData.statusCode).json({
        success: responseData.success,
        message: responseData.message,
        data: responseData.data
    });
};

export default sendResponse;