import User, { UserRole } from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/env";
import ApiError from "../global/errors/ApiError";
import { ApiMessages } from "../Constants/Messages";
import httpStatus from "http-status";

export const signupUser = async (
  name: string,
  email: string,
  password: string,
  role: UserRole = UserRole.USER,
  profileImage: string = "",
  gender: string,
  sexualOrientation: string,
  keyPopulation: string[],
  age: number,
  country: string
) => {
  const expiresIn = "1d";

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, ApiMessages.USER_ALREADY_EXISTS);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role: UserRole.USER,
    profileImage,
    gender,
    sexualOrientation,
    keyPopulation,
    age,
    country,
  });
  await newUser.save();
  const token = jwt.sign({ id: newUser._id, role: newUser.role }, envConfig.JWT_SECRET, {expiresIn});

  return { user: newUser, token };
};

export const loginUser = async (
  email: string,
  password: string,
  admin: boolean
) => {
  const expiresIn = "1d";
  const user = await User.findOne({ email });

  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  if (admin) {
    if (
      ![UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COMMUNITYADMIN].includes(
        user.role
      )
    )
      return null;
  } else {
    if (
      ![
        UserRole.USER,
        UserRole.ADMIN,
        UserRole.SUPERADMIN,
        UserRole.COMMUNITYADMIN,
      ].includes(user.role)
    )
      return null;
  }

  const token = jwt.sign({ id: user._id, role: user.role }, envConfig.JWT_SECRET, {
    expiresIn: expiresIn,
  });
  return { user, token };
};


const findUserByEmail = async (email: string) => {
  try{
    return await User.findOne({ email });
  }catch(err: any){
    throw new ApiError(err.statusCode, err.message);
  }
};

export const generateResetToken = async (email: string) => {
  try{
    const user = await findUserByEmail(email);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, ApiMessages.USER_NOT_FOUND);
  
    // const token = crypto.randomBytes(32).toString("hex");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiration
    await user.save();
    return otp;
  }catch(err: any){
    throw new ApiError(err.statusCode, err.message);
  }
};

export const resetPass = async (otp: string, password: string) => {
  try {
    // Validate input
    if (!otp?.trim()) {
      throw new ApiError(httpStatus.BAD_REQUEST, "OTP_REQUIRED", "OTP is required");
    }
    if (!password?.trim()) {
      throw new ApiError(httpStatus.BAD_REQUEST, "PASSWORD_REQUIRED", "Password is required");
    }
    if (password.length < 6) {
      throw new ApiError(httpStatus.BAD_REQUEST, "PASSWORD_TOO_SHORT", "Password must be at least 6 characters");
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp.trim())) {
      throw new ApiError(httpStatus.BAD_REQUEST, "INVALID_OTP", "Please enter a valid 6-digit OTP");
    }

    const user = await User.findOne({
      resetPasswordToken: otp.trim(),
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      // Check if OTP exists but expired
      const expiredUser = await User.findOne({
        resetPasswordToken: otp.trim(),
      }).select('+resetPasswordToken +resetPasswordExpires');

      if (expiredUser) {
        throw new ApiError(httpStatus.BAD_REQUEST, "OTP_EXPIRED", "OTP has expired. Please request a new one");
      } else {
        throw new ApiError(httpStatus.BAD_REQUEST, "INVALID_OTP", "Invalid OTP. Please check and try again");
      }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password and clear reset tokens
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return {
      success: true,
      message: "Password reset successful",
      user: {
        email: user.email,
        name: user.name
      }
    };

  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "PASSWORD_RESET_FAILED", "Password reset failed. Please try again.");
  }
};
