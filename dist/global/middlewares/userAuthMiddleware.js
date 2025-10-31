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
exports.authMiddleware = exports.validateUserData = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importStar(require("../../models/user.model"));
const env_1 = require("../../config/env");
const survey_model_1 = require("../../models/survey.model");
const validateUserData = (req, res, next) => {
    const { name, email, password, role, gender, sexualOrientation, keyPopulation, age } = req.body;
    const errors = [];
    if (!name || typeof name !== 'string') {
        errors.push('Name is required and must be a string');
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push('Valid email is required');
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    if (role && !Object.values(user_model_1.UserRole).includes(role)) {
        errors.push('Invalid role');
    }
    if (gender && !Object.values(user_model_1.Gender).includes(gender)) {
        errors.push('Invalid gender');
    }
    if (sexualOrientation && !Object.values(user_model_1.SexualOrientation).includes(sexualOrientation)) {
        errors.push('Invalid sexual orientation');
    }
    if (keyPopulation) {
        if (!Array.isArray(keyPopulation)) {
            errors.push('Key population must be an array');
        }
        else if (!keyPopulation.every(item => Object.values(survey_model_1.KeyPopulation).includes(item))) {
            errors.push('Invalid key population');
        }
    }
    if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 120)) {
        errors.push('Age must be between 0 and 120');
    }
    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    next();
};
exports.validateUserData = validateUserData;
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                error: "Access denied. No token provided",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.envConfig.JWT_SECRET);
        const user = yield user_model_1.default.findById(decoded.id).select("-password");
        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: "Invalid token",
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: "Token expired",
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: "Server error during authentication",
        });
    }
});
exports.authMiddleware = authMiddleware;
