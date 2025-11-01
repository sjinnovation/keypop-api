import ApiError from "../global/errors/ApiError";
import User, { Gender, IUser, SexualOrientation, UserRole } from "../models/user.model";
import httpStatus from "http-status";
import { ApiMessages } from "../Constants/Messages";
import { KeyPopulation } from "../models/survey.model";
import bcrypt from "bcryptjs";
import SurveyResponse from "../models/surveyResponse.model";
import UserSurveyProgress from "../models/userSurveyProgress.model";
import mongoose from "mongoose";
interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  gender?: Gender;
  sexualOrientation?: SexualOrientation;
  keyPopulation?: KeyPopulation[];
  age?: number;
}

export const createUserService = async (userData: CreateUserData): Promise<IUser> => {
  try {
    const { email, password, ...otherData } = userData;

    const isEmailExists = await User.findOne({ email });
    if (isEmailExists) {
      throw new ApiError(httpStatus.CONFLICT, ApiMessages.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      ...otherData
    });

    return newUser;
  } catch (error: any) {
    throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const getUsers = async () => {
  try {
    return await User.find();
  } catch (error: any) {
    throw new ApiError(error.statusCode, error.message);
  }
};

export const getAdminUsersService = async (page: number = 1, limit: number = 10) => {
  try {
    const skip = (page - 1) * limit;
    const total = await User.countDocuments({
      role: { $in: [UserRole.ADMIN, UserRole.COMMUNITYADMIN] }
    });

    const users = await User.find({
      role: { $in: [UserRole.ADMIN, UserRole.COMMUNITYADMIN] }
    })
      .skip(skip)
      .limit(limit)
      .select('-password');
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      totalPages
    }
    return { users, pagination };
  } catch (error: any) {
    throw new ApiError(error.statusCode, error.message);
  }
};

export const deleteUser = async (id: string, forceDelete: boolean = false): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(id).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      throw new ApiError(httpStatus.NOT_FOUND, "User not found or already deleted");
    }

    const surveyResponseCount = await SurveyResponse.countDocuments({ userId: id }).session(session);
    const surveyProgressCount = await UserSurveyProgress.countDocuments({ userId: id }).session(session);
    const totalSurveyData = surveyResponseCount + surveyProgressCount;

    if (!forceDelete && totalSurveyData > 0) {
      await session.abortTransaction();
      session.endSession();
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `User has ${surveyResponseCount} survey response(s) and ${surveyProgressCount} in-progress survey(s). Set forceDelete to true to proceed with deletion.`
      );
    }

    await SurveyResponse.deleteMany({ userId: id }).session(session);
    await UserSurveyProgress.deleteMany({ userId: id }).session(session);

    const deletedUser = await User.findByIdAndDelete(id, {
      session,
      returnDocument: 'before'
    });

    await session.commitTransaction();
    session.endSession();

    console.log(`User deleted successfully. Cleaned up ${surveyResponseCount} survey responses and ${surveyProgressCount} progress records.`);

    return {
      user: deletedUser,
      deletedSurveyData: {
        surveyResponses: surveyResponseCount,
        surveyProgress: surveyProgressCount,
        total: totalSurveyData
      }
    };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    if (error instanceof ApiError) {
      throw error;
    }

    console.error('Database error in deleteUser:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to delete user: ${error.message}`
    );
  }
};

export const updateUser = async (id: string, userData: any) => {
  try {
    return await User.findByIdAndUpdate(id, userData, { new: true }).select('-password');
  } catch (error: any) {
    throw new ApiError(error.statusCode, error.message);
  }
};

export const getUserById = async (id: string) => {
  try {
    return await User.findById(id).select('-password');
  } catch (error: any) {
    throw new ApiError(error.statusCode, error.message);
  }
};

export const getAllAdminUsersService = async (filters: { startDate?: string; endDate?: string } = {}) => {
  try {
    const query: any = {};
    if (filters.startDate) {
      query.createdAt = { $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { ...query.createdAt, $lte: end };
    }

    // Fetch data
    const contactRequests = await User.find(query).select('-password');
    const total = contactRequests.length;

    return { contactRequests, totalDocs: total };
  } catch (error: any) {
    throw new ApiError(error.statusCode, error.message);
  }
}

export const getAdminRoleCountsService = async () => {
  try {
    const counts = await User.aggregate([
      {
        $match: {
          role: { $in: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.COMMUNITYADMIN] }
        }
      },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          role: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    const result = {
      superAdmin: 0,
      admin: 0,
      communityAdmin: 0
    };

    counts.forEach((item: { role: string, count: number }) => {
      if (item.role === UserRole.SUPERADMIN) {
        result.superAdmin = item.count;
      } else if (item.role === UserRole.ADMIN) {
        result.admin = item.count;
      } else if (item.role === UserRole.COMMUNITYADMIN) {
        result.communityAdmin = item.count;
      }
    });

    return result;
  } catch (error: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, ApiMessages.FAILED_TO_FETCH_ADMIN_COUNTS);
  }
};

export const checkEmailExistsService = async (email: string): Promise<{ exists: boolean }> => {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid email format");
    }

    const existingUser = await User.findOne({ email });
    
    return {
      exists: !!existingUser
    };
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};