import { Request, Response } from "express";
import { 
  createUserService, 
  getUsers, 
  deleteUser, 
  updateUser, 
  getAdminUsersService, 
  getUserById, 
  getAllAdminUsersService, 
  getAdminRoleCountsService,
  checkEmailExistsService 
} from "../services/user.service";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { ApiMessages } from "../Constants/Messages";
import catchAsync from "../global/middlewares/catchAsync";
import sendResponse from "../global/middlewares/sendResponse";
import { sendAccountDeletionEmail, sendWelcomeEmail } from "../Utils/emailServices";
import ApiError from "../global/errors/ApiError";
import User from "../models/user.model";

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await getUsers();
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.USER_FETCHED,
    data: users
  });
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const userData = req.body;
  
  if (!userData.email || !userData.name) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email and name are required");
  }

  const user = await createUserService(userData);
  
  if (user.email && user.name) {
    sendWelcomeEmail(user.email, user.name).catch(emailError => {
      console.error('Failed to send welcome email:', emailError);
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: ApiMessages.USER_CREATED,
    data: user,
  });
});

export const getAdminUsers = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  
  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid pagination parameters");
  }

  const users = await getAdminUsersService(pageNum, limitNum);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.USER_FETCHED,
    data: users
  });
});

export const removeUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { forceDelete } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user ID format");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, ApiMessages.USER_NOT_FOUND);
  }

  const userData = {
    email: user.email,
    name: user.name,
    _id: user._id
  };

  const shouldForceDelete = forceDelete === 'true' || forceDelete === '1';
  const deletionResult = await deleteUser(id, shouldForceDelete);

  if (!deletionResult) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to delete user from database");
  }

  if (userData.email && userData.name) {
    sendAccountDeletionEmail(userData.email, userData.name).catch(emailError => {
      console.error(`Failed to send account deletion email to ${userData.email}:`, emailError);
    });
  }

  const hasSurveyData = deletionResult.deletedSurveyData.total > 0;

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: hasSurveyData ? ApiMessages.USER_DELETED_WITH_DATA : ApiMessages.USER_DELETED,
    data: {
      deletedUserId: userData._id,
      deletedSurveyData: deletionResult.deletedSurveyData
    }
  });
});

export const editUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, role, password, gender, sexualOrientation, keyPopulation, age } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user ID format");
  }

  const existingUser = await getUserById(id);
  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, ApiMessages.USER_NOT_FOUND);
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid email format");
  }

  if (email && email !== existingUser.email) {
    const emailExists = await User.findOne({ email, _id: { $ne: id } });
    if (emailExists) {
      throw new ApiError(httpStatus.CONFLICT, ApiMessages.USER_ALREADY_EXISTS);
    }
  }

  let userData: any = { name, email, role, gender, sexualOrientation, keyPopulation, age };

  // ✅ Improved password handling
  if (password) {
    if (password.length < 8) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password must be at least 8 characters long");
    }
    userData.password = await bcrypt.hash(password, 12); // ✅ Increased salt rounds for better security
  }

  const user = await updateUser(id, userData);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.USER_UPDATED,
    data: user
  });
});

export const getUserInfo = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const user = await getUserById(userId);
  
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, ApiMessages.USER_NOT_FOUND);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.USER_FETCHED,
    data: user
  });
});

export const getAllAdminUsers = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && endDate) {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
    }
    
    if (start > end) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Start date cannot be after end date");
    }
  }

  const users = await getAllAdminUsersService({ startDate, endDate } as any);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.USER_FETCHED,
    data: users
  });
});

export const getAdminRoleCounts = catchAsync(async (req: Request, res: Response) => {
  try {
    const counts = await getAdminRoleCountsService();
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: ApiMessages.ADMIN_COUNTS_FETCHED,
      data: counts
    });
  } catch (error: any) {
    console.error('Error fetching admin role counts:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR, 
      ApiMessages.FAILED_TO_FETCH_ADMIN_COUNTS
    );
  }
});

export const checkEmailExists = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is required");
  }

  const result = await checkEmailExistsService(email);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.exists ? "Email already exists" : "Email is available",
    data: result
  });
});