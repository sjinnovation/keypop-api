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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SexualOrientation = exports.Gender = exports.UserRole = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const survey_model_1 = require("./survey.model");
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
    UserRole["SUPERADMIN"] = "superadmin";
    UserRole["COMMUNITYADMIN"] = "communityadmin";
})(UserRole || (exports.UserRole = UserRole = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
    Gender["NON_BINARY"] = "non-binary";
    Gender["OTHER"] = "other";
    Gender["PREFER_NOT_TO_SAY"] = "prefer not to say";
})(Gender || (exports.Gender = Gender = {}));
var SexualOrientation;
(function (SexualOrientation) {
    SexualOrientation["HETEROSEXUAL"] = "heterosexual";
    SexualOrientation["HOMOSEXUAL"] = "homosexual";
    SexualOrientation["BISEXUAL"] = "bisexual";
    SexualOrientation["PANSEXUAL"] = "pansexual";
    SexualOrientation["ASEXUAL"] = "asexual";
    SexualOrientation["OTHER"] = "other";
    SexualOrientation["PREFER_NOT_TO_SAY"] = "prefer not to say";
})(SexualOrientation || (exports.SexualOrientation = SexualOrientation = {}));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.USER,
    },
    profileImage: { type: String, default: "" },
    resetPasswordToken: { type: String, default: undefined },
    resetPasswordExpires: { type: Date, default: undefined },
    gender: {
        type: String,
        enum: Object.values(Gender),
        required: false
    },
    sexualOrientation: {
        type: String,
        enum: Object.values(SexualOrientation),
        required: false
    },
    keyPopulation: [{
            type: String,
            enum: Object.values(survey_model_1.KeyPopulation),
            required: false
        }],
    age: {
        type: Number,
        required: false
    },
    country: { type: String, required: false },
}, { timestamps: true });
exports.default = mongoose_1.default.model("User", UserSchema);
