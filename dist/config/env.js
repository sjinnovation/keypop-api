"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.envConfig = {
    PORT: process.env.PORT || 8000,
    JWT_SECRET: process.env.JWT_SECRET || "your_secret_key",
    MONGO_URI: process.env.MONGO_URI || "",
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
    /** Admin SPA origin (e.g. https://admin.keypopapp.org). Used for email image assets by default. */
    FRONTEND_URL: process.env.FRONTEND_URL || "",
    /** Participant web app origin (e.g. https://app.keypopapp.org). Used for login / reset / dashboard links in emails. */
    FRONTEND_URL_WEB: process.env.FRONTEND_URL_WEB || "",
    NODE_ENV: process.env.NODE_ENV || "development",
    EXPIRE_TIME: process.env.EXPIRE_TIME,
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@apcom.org',
    LOGO_URL: `${process.env.FRONTEND_URL}/static/images/keypopapplogo.png`,
    FOOTER_LOGO_URL: `${process.env.FRONTEND_URL}/static/images/sponsoredLogo.png`
};
