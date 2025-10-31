import { Request, Response } from "express";
import httpStatus from "http-status";
import { signupUser, loginUser, generateResetToken, resetPass } from "../services/auth.service";
import catchAsync from "../global/middlewares/catchAsync";
import sendResponse from "../global/middlewares/sendResponse";
import { ApiMessages } from "../Constants/Messages";
import { sendPasswordResetEmail, sendPasswordResetSuccessEmail, sendWelcomeEmail } from "../Utils/emailServices";
import ApiError from "../global/errors/ApiError";

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, role, profileImage, gender, sexualOrientation, keyPopulation, age, country } = req.body;
  
  const user = await signupUser(name, email, password, role, profileImage, gender, sexualOrientation, keyPopulation, age, country);
  
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create user");
  }

  // Send welcome email asynchronously (don't block response)
  sendWelcomeEmail(email, name).catch(emailError => {
    console.error('Failed to send welcome email:', emailError);
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: ApiMessages.USER_CREATED,
    data: user
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password, admin } = req.body;
  
  const user = await loginUser(email, password, admin);
  
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.LOGIN_SUCCESS,
    data: user
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  const otp = await generateResetToken(email);

  // Send email asynchronously
  sendPasswordResetEmail(email, otp).catch(emailError => {
    console.error('Failed to send password reset email:', emailError);
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.PASSWORD_RESET_EMAIL_SENT,
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { otp, password } = req.body;
  
  const result = await resetPass(otp, password);

  if (result.user) {
    sendPasswordResetSuccessEmail(result.user.email, result.user.name).catch(emailError => {
      console.error('Failed to send password reset success email:', emailError);
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.PASSWORD_RESET_SUCCESS,
  });
});