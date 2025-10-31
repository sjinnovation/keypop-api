import { Request, Response } from "express";
import catchAsync from "../global/middlewares/catchAsync";
import sendResponse from "../global/middlewares/sendResponse";
import httpStatus from "http-status";
import { ApiMessages } from "../Constants/Messages";
import { addContactRequestService, getContactRequestsService, updateContactRequestStatusService } from "../services/contactRequest.service";

export const addContactRequest = catchAsync(async (req: Request, res: Response) => {
  const { name, email, phoneNumber, message } = req.body;
  const newRequest = await addContactRequestService(name, email, phoneNumber, message);
  sendResponse(res, {
    statusCode: newRequest.isNewRequest ? httpStatus.CREATED : httpStatus.OK,
    success: true,
    message: newRequest.isNewRequest ? ApiMessages.CONTACT_REQUEST_ADDED : ApiMessages.CONTACT_REQUEST_EXISTS,
    data: newRequest
  });
});

export const getContactRequests = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, startDate, endDate } = req.query;
  
  const result = await getContactRequestsService({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    startDate: startDate as string,
    endDate: endDate as string
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.CONTACT_REQUEST_FETCHED,
    data: result
  });
});

export const updateContactRequestStatus = catchAsync(async(req: Request, res: Response)=>{
    const { id } = req.params;
    const { status } = req.body;
    await updateContactRequestStatusService(id, status);
    sendResponse(res,{
      statusCode: httpStatus.OK,
      success: true,
      message: ApiMessages.CONTACT_REQUEST_STATUS_UPDATED,
    })
})
