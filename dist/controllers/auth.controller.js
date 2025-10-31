"use strict";
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
exports.resetPassword = exports.forgotPassword = exports.login = exports.signup = void 0;
const http_status_1 = __importDefault(require("http-status"));
const auth_service_1 = require("../services/auth.service");
const catchAsync_1 = __importDefault(require("../global/middlewares/catchAsync"));
const sendResponse_1 = __importDefault(require("../global/middlewares/sendResponse"));
const Messages_1 = require("../Constants/Messages");
const emailServices_1 = require("../Utils/emailServices");
const ApiError_1 = __importDefault(require("../global/errors/ApiError"));
exports.signup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role, profileImage, gender, sexualOrientation, keyPopulation, age, country } = req.body;
    const user = yield (0, auth_service_1.signupUser)(name, email, password, role, profileImage, gender, sexualOrientation, keyPopulation, age, country);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Failed to create user");
    }
    // Send welcome email asynchronously (don't block response)
    (0, emailServices_1.sendWelcomeEmail)(email, name).catch(emailError => {
        console.error('Failed to send welcome email:', emailError);
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: Messages_1.ApiMessages.USER_CREATED,
        data: user
    });
}));
exports.login = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, admin } = req.body;
    const user = yield (0, auth_service_1.loginUser)(email, password, admin);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid credentials");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.LOGIN_SUCCESS,
        data: user
    });
}));
exports.forgotPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const otp = yield (0, auth_service_1.generateResetToken)(email);
    // Send email asynchronously
    (0, emailServices_1.sendPasswordResetEmail)(email, otp).catch(emailError => {
        console.error('Failed to send password reset email:', emailError);
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.PASSWORD_RESET_EMAIL_SENT,
    });
}));
exports.resetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, password } = req.body;
    const result = yield (0, auth_service_1.resetPass)(otp, password);
    if (result.user) {
        (0, emailServices_1.sendPasswordResetSuccessEmail)(result.user.email, result.user.name).catch(emailError => {
            console.error('Failed to send password reset success email:', emailError);
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.PASSWORD_RESET_SUCCESS,
    });
}));
