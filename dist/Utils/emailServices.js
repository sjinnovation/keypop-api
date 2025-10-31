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
exports.sendSurveyCompletionEmail = exports.sendAccountDeletionEmail = exports.sendPasswordResetSuccessEmail = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendEmail = void 0;
const resend_1 = require("resend");
const env_1 = require("../config/env");
const ApiError_1 = __importDefault(require("../global/errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const Messages_1 = require("../Constants/Messages");
const emailTemplates_1 = require("../templates/emailTemplates");
const resend = new resend_1.Resend(env_1.envConfig.RESEND_API_KEY);
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { to, subject, html, from } = options;
        const emailOptions = {
            from: from || env_1.envConfig.EMAIL_FROM || 'APCOM <noreply@apcom.org>',
            to: Array.isArray(to) ? to : [to],
            subject,
        };
        if (html) {
            emailOptions.html = html;
        }
        else {
            throw new Error('Either html or text content is required');
        }
        const { data, error } = yield resend.emails.send(emailOptions);
        if (error) {
            console.error('Resend error:', error);
            throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, Messages_1.ApiMessages.EMAIL_SEND_FAILED);
        }
        return data;
    }
    catch (error) {
        console.error('Email sending error:', error);
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, Messages_1.ApiMessages.EMAIL_SEND_FAILED);
    }
});
exports.sendEmail = sendEmail;
const sendWelcomeEmail = (email, name) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.sendEmail)({
        to: email,
        subject: 'Welcome to APCOM',
        html: (0, emailTemplates_1.welcomeEmailTemplate)(name),
    });
});
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.sendEmail)({
        to: email,
        subject: 'Password Reset OTP - APCOM',
        html: (0, emailTemplates_1.passwordResetOTPTemplate)(otp),
    });
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendPasswordResetSuccessEmail = (email, name) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.sendEmail)({
        to: email,
        subject: 'Password Reset Successful - APCOM',
        html: (0, emailTemplates_1.passwordResetSuccessTemplate)(name),
    });
});
exports.sendPasswordResetSuccessEmail = sendPasswordResetSuccessEmail;
const sendAccountDeletionEmail = (email, name) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.sendEmail)({
        to: email,
        subject: 'Account Deleted - APCOM',
        html: (0, emailTemplates_1.accountDeletionTemplate)(name),
    });
});
exports.sendAccountDeletionEmail = sendAccountDeletionEmail;
const sendSurveyCompletionEmail = (email, name, surveyTitle) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.sendEmail)({
        to: email,
        subject: 'Thank You for Completing the Survey',
        html: (0, emailTemplates_1.surveyCompletionTemplate)(name, surveyTitle),
    });
});
exports.sendSurveyCompletionEmail = sendSurveyCompletionEmail;
