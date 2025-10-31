"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPass = exports.generateResetToken = exports.loginUser = exports.signupUser = void 0;
const user_model_1 = __importStar(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const ApiError_1 = __importDefault(require("../global/errors/ApiError"));
const Messages_1 = require("../Constants/Messages");
const http_status_1 = __importDefault(require("http-status"));
const signupUser = (name_1, email_1, password_1, ...args_1) => __awaiter(void 0, [name_1, email_1, password_1, ...args_1], void 0, function* (name, email, password, role = user_model_1.UserRole.USER, profileImage = "", gender, sexualOrientation, keyPopulation, age, country) {
    const expiresIn = "1d";
    const existingUser = yield user_model_1.default.findOne({ email });
    if (existingUser) {
        throw new ApiError_1.default(http_status_1.default.CONFLICT, Messages_1.ApiMessages.USER_ALREADY_EXISTS);
    }
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    const newUser = new user_model_1.default({
        name,
        email,
        password: hashedPassword,
        role: user_model_1.UserRole.USER,
        profileImage,
        gender,
        sexualOrientation,
        keyPopulation,
        age,
        country,
    });
    yield newUser.save();
    const token = jsonwebtoken_1.default.sign({ id: newUser._id, role: newUser.role }, env_1.envConfig.JWT_SECRET, { expiresIn });
    return { user: newUser, token };
});
exports.signupUser = signupUser;
const loginUser = (email, password, admin) => __awaiter(void 0, void 0, void 0, function* () {
    const expiresIn = "1d";
    const user = yield user_model_1.default.findOne({ email });
    if (!user)
        return null;
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        return null;
    if (admin) {
        if (![user_model_1.UserRole.ADMIN, user_model_1.UserRole.SUPERADMIN, user_model_1.UserRole.COMMUNITYADMIN].includes(user.role))
            return null;
    }
    else {
        if (![
            user_model_1.UserRole.USER,
            user_model_1.UserRole.ADMIN,
            user_model_1.UserRole.SUPERADMIN,
            user_model_1.UserRole.COMMUNITYADMIN,
        ].includes(user.role))
            return null;
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, env_1.envConfig.JWT_SECRET, {
        expiresIn: expiresIn,
    });
    return { user, token };
});
exports.loginUser = loginUser;
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_model_1.default.findOne({ email });
    }
    catch (err) {
        throw new ApiError_1.default(err.statusCode, err.message);
    }
});
const generateResetToken = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield findUserByEmail(email);
        if (!user)
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, Messages_1.ApiMessages.USER_NOT_FOUND);
        // const token = crypto.randomBytes(32).toString("hex");
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = otp;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiration
        yield user.save();
        return otp;
    }
    catch (err) {
        throw new ApiError_1.default(err.statusCode, err.message);
    }
});
exports.generateResetToken = generateResetToken;
const resetPass = (otp, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input
        if (!(otp === null || otp === void 0 ? void 0 : otp.trim())) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "OTP_REQUIRED", "OTP is required");
        }
        if (!(password === null || password === void 0 ? void 0 : password.trim())) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "PASSWORD_REQUIRED", "Password is required");
        }
        if (password.length < 6) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "PASSWORD_TOO_SHORT", "Password must be at least 6 characters");
        }
        // Validate OTP format (6 digits)
        if (!/^\d{6}$/.test(otp.trim())) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "INVALID_OTP", "Please enter a valid 6-digit OTP");
        }
        const user = yield user_model_1.default.findOne({
            resetPasswordToken: otp.trim(),
            resetPasswordExpires: { $gt: Date.now() },
        }).select('+resetPasswordToken +resetPasswordExpires');
        if (!user) {
            // Check if OTP exists but expired
            const expiredUser = yield user_model_1.default.findOne({
                resetPasswordToken: otp.trim(),
            }).select('+resetPasswordToken +resetPasswordExpires');
            if (expiredUser) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "OTP_EXPIRED", "OTP has expired. Please request a new one");
            }
            else {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "INVALID_OTP", "Invalid OTP. Please check and try again");
            }
        }
        // Hash new password
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Update user password and clear reset tokens
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        return {
            success: true,
            message: "Password reset successful",
            user: {
                email: user.email,
                name: user.name
            }
        };
    }
    catch (error) {
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "PASSWORD_RESET_FAILED", "Password reset failed. Please try again.");
    }
});
exports.resetPass = resetPass;
