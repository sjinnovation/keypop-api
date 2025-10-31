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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmailExistsService = exports.getAdminRoleCountsService = exports.getAllAdminUsersService = exports.getUserById = exports.updateUser = exports.deleteUser = exports.getAdminUsersService = exports.getUsers = exports.createUserService = void 0;
const ApiError_1 = __importDefault(require("../global/errors/ApiError"));
const user_model_1 = __importStar(require("../models/user.model"));
const http_status_1 = __importDefault(require("http-status"));
const Messages_1 = require("../Constants/Messages");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createUserService = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = userData, otherData = __rest(userData, ["email", "password"]);
        const isEmailExists = yield user_model_1.default.findOne({ email });
        if (isEmailExists) {
            throw new ApiError_1.default(http_status_1.default.CONFLICT, Messages_1.ApiMessages.USER_ALREADY_EXISTS);
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield user_model_1.default.create(Object.assign({ email, password: hashedPassword }, otherData));
        return newUser;
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message);
    }
});
exports.createUserService = createUserService;
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_model_1.default.find();
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode, error.message);
    }
});
exports.getUsers = getUsers;
const getAdminUsersService = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const total = yield user_model_1.default.countDocuments({
            role: { $in: [user_model_1.UserRole.ADMIN, user_model_1.UserRole.COMMUNITYADMIN] }
        });
        const users = yield user_model_1.default.find({
            role: { $in: [user_model_1.UserRole.ADMIN, user_model_1.UserRole.COMMUNITYADMIN] }
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
        };
        return { users, pagination };
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode, error.message);
    }
});
exports.getAdminUsersService = getAdminUsersService;
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedUser = yield user_model_1.default.findByIdAndDelete(id, {
            returnDocument: 'before'
        });
        if (!deletedUser) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found or already deleted");
        }
        return deletedUser;
    }
    catch (error) {
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        console.error('Database error in deleteUser:', error);
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, `Failed to delete user: ${error.message}`);
    }
});
exports.deleteUser = deleteUser;
const updateUser = (id, userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_model_1.default.findByIdAndUpdate(id, userData, { new: true }).select('-password');
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode, error.message);
    }
});
exports.updateUser = updateUser;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_model_1.default.findById(id).select('-password');
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode, error.message);
    }
});
exports.getUserById = getUserById;
const getAllAdminUsersService = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    try {
        const query = {};
        if (filters.startDate) {
            query.createdAt = { $gte: new Date(filters.startDate) };
        }
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            query.createdAt = Object.assign(Object.assign({}, query.createdAt), { $lte: end });
        }
        // Fetch data
        const contactRequests = yield user_model_1.default.find(query).select('-password');
        const total = contactRequests.length;
        return { contactRequests, totalDocs: total };
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode, error.message);
    }
});
exports.getAllAdminUsersService = getAllAdminUsersService;
const getAdminRoleCountsService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const counts = yield user_model_1.default.aggregate([
            {
                $match: {
                    role: { $in: [user_model_1.UserRole.SUPERADMIN, user_model_1.UserRole.ADMIN, user_model_1.UserRole.COMMUNITYADMIN] }
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
        counts.forEach((item) => {
            if (item.role === user_model_1.UserRole.SUPERADMIN) {
                result.superAdmin = item.count;
            }
            else if (item.role === user_model_1.UserRole.ADMIN) {
                result.admin = item.count;
            }
            else if (item.role === user_model_1.UserRole.COMMUNITYADMIN) {
                result.communityAdmin = item.count;
            }
        });
        return result;
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, Messages_1.ApiMessages.FAILED_TO_FETCH_ADMIN_COUNTS);
    }
});
exports.getAdminRoleCountsService = getAdminRoleCountsService;
const checkEmailExistsService = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid email format");
        }
        const existingUser = yield user_model_1.default.findOne({ email });
        return {
            exists: !!existingUser
        };
    }
    catch (error) {
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message);
    }
});
exports.checkEmailExistsService = checkEmailExistsService;
