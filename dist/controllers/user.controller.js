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
exports.checkEmailExists = exports.getAdminRoleCounts = exports.getAllAdminUsers = exports.getUserInfo = exports.editUser = exports.removeUser = exports.getAdminUsers = exports.createUser = exports.getAllUsers = void 0;
const user_service_1 = require("../services/user.service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const Messages_1 = require("../Constants/Messages");
const catchAsync_1 = __importDefault(require("../global/middlewares/catchAsync"));
const sendResponse_1 = __importDefault(require("../global/middlewares/sendResponse"));
const emailServices_1 = require("../Utils/emailServices");
const ApiError_1 = __importDefault(require("../global/errors/ApiError"));
const user_model_1 = __importDefault(require("../models/user.model"));
exports.getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield (0, user_service_1.getUsers)();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.USER_FETCHED,
        data: users
    });
}));
exports.createUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = req.body;
    if (!userData.email || !userData.name) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Email and name are required");
    }
    const user = yield (0, user_service_1.createUserService)(userData);
    if (user.email && user.name) {
        (0, emailServices_1.sendWelcomeEmail)(user.email, user.name).catch(emailError => {
            console.error('Failed to send welcome email:', emailError);
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: Messages_1.ApiMessages.USER_CREATED,
        data: user,
    });
}));
exports.getAdminUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid pagination parameters");
    }
    const users = yield (0, user_service_1.getAdminUsersService)(pageNum, limitNum);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.USER_FETCHED,
        data: users
    });
}));
exports.removeUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid user ID format");
    }
    const user = yield user_model_1.default.findById(id);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, Messages_1.ApiMessages.USER_NOT_FOUND);
    }
    const userData = {
        email: user.email,
        name: user.name,
        _id: user._id
    };
    const deletedUser = yield (0, user_service_1.deleteUser)(id);
    if (!deletedUser) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to delete user from database");
    }
    if (userData.email && userData.name) {
        (0, emailServices_1.sendAccountDeletionEmail)(userData.email, userData.name).catch(emailError => {
            console.error(`Failed to send account deletion email to ${userData.email}:`, emailError);
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.USER_DELETED,
        data: {
            deletedUserId: userData._id
        }
    });
}));
exports.editUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email, role, password, gender, sexualOrientation, keyPopulation, age } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid user ID format");
    }
    const existingUser = yield (0, user_service_1.getUserById)(id);
    if (!existingUser) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, Messages_1.ApiMessages.USER_NOT_FOUND);
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid email format");
    }
    if (email && email !== existingUser.email) {
        const emailExists = yield user_model_1.default.findOne({ email, _id: { $ne: id } });
        if (emailExists) {
            throw new ApiError_1.default(http_status_1.default.CONFLICT, Messages_1.ApiMessages.USER_ALREADY_EXISTS);
        }
    }
    let userData = { name, email, role, gender, sexualOrientation, keyPopulation, age };
    // ✅ Improved password handling
    if (password) {
        if (password.length < 8) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Password must be at least 8 characters long");
        }
        userData.password = yield bcryptjs_1.default.hash(password, 12); // ✅ Increased salt rounds for better security
    }
    const user = yield (0, user_service_1.updateUser)(id, userData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.USER_UPDATED,
        data: user
    });
}));
exports.getUserInfo = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "User not authenticated");
    }
    const user = yield (0, user_service_1.getUserById)(userId);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, Messages_1.ApiMessages.USER_NOT_FOUND);
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.USER_FETCHED,
        data: user
    });
}));
exports.getAllAdminUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate } = req.query;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid date format");
        }
        if (start > end) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Start date cannot be after end date");
        }
    }
    const users = yield (0, user_service_1.getAllAdminUsersService)({ startDate, endDate });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.USER_FETCHED,
        data: users
    });
}));
exports.getAdminRoleCounts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const counts = yield (0, user_service_1.getAdminRoleCountsService)();
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: Messages_1.ApiMessages.ADMIN_COUNTS_FETCHED,
            data: counts
        });
    }
    catch (error) {
        console.error('Error fetching admin role counts:', error);
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, Messages_1.ApiMessages.FAILED_TO_FETCH_ADMIN_COUNTS);
    }
}));
exports.checkEmailExists = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Email is required");
    }
    const result = yield (0, user_service_1.checkEmailExistsService)(email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.exists ? "Email already exists" : "Email is available",
        data: result
    });
}));
