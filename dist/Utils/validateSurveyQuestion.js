"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSurveyQuestions = void 0;
const ApiError_1 = __importDefault(require("../global/errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const survey_model_1 = require("../models/survey.model");
const validateSurveyQuestions = (questions) => {
    const seenCodes = new Set();
    for (const question of questions) {
        // Check for duplicate question codes
        if (seenCodes.has(question.code)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Duplicate question code: ${question.code}`);
        }
        seenCodes.add(question.code);
        // Required fields
        if (!question.code || !question.text || !question.answerType) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Each question must have 'code', 'text', and 'answerType'. Error in question: "${question.text || question.code}"`);
        }
        // Validate code format (e.g. 1.1.2.3)
        const codePattern = /^\d+(\.\d+)*$/;
        if (!codePattern.test(question.code)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Invalid code format for question "${question.text}". Expected a dotted number like "1.1.2.3"`);
        }
        // Answer type-specific validation
        switch (question.answerType) {
            case "YesNo":
                break;
            case "Text":
                break;
            case "Rating":
                if (!Array.isArray(question.ratingScale) || question.ratingScale.length === 0) {
                    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Rating question "${question.text}" must include a valid 'ratingScale' array`);
                }
                break;
            case "MCQ":
                if (!Array.isArray(question.options) || question.options.length < 2) {
                    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `MCQ question "${question.text}" must include at least 2 'options'`);
                }
                break;
            default:
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Invalid answerType "${question.answerType}" in question "${question.text}"`);
        }
        // Validate specificToKP if present
        if (question.specificToKP) {
            const validKPs = Object.values(survey_model_1.KeyPopulation);
            for (const kp of question.specificToKP) {
                if (!validKPs.includes(kp)) {
                    throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Invalid key population "${kp}" in question "${question.text}"`);
                }
            }
        }
        // Validate showIf structure
        if (question.showIf) {
            if (typeof question.showIf.questionCode !== "string" ||
                question.showIf.questionCode.trim() === "") {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Invalid 'showIf.questionCode' in question "${question.text}"`);
            }
            if (typeof question.showIf.expectedAnswer !== "string" && typeof question.showIf.expectedAnswer !== "number") {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Invalid 'showIf.expectedAnswer' in question "${question.text}"`);
            }
        }
        // Validate that showIf.questionCode exists in the question list
        if (question.showIf && !questions.find(q2 => q2.code === question.showIf.questionCode)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `showIf.questionCode "${question.showIf.questionCode}" not found in question list (in question "${question.code}")`);
        }
    }
};
exports.validateSurveyQuestions = validateSurveyQuestions;
