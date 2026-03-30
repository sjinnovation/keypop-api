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
exports.getAdminSurveyResponseById = exports.listAdminSurveyResponses = exports.deleteOwnSurveyResponse = exports.deleteAdminSurveyResponse = exports.getAllUserSurveyResponses = exports.getUserSurveyResponse = exports.getUserCountrySurvey = exports.updateUserSurveyProgress = exports.getUserSurveyProgress = exports.submitSurveyResponse = exports.getSurveyByCountry = exports.updateSurvey = exports.deleteSurvey = exports.updateSurveyStatus = exports.getSurveyById = exports.getAllSurveys = exports.addSurvey = void 0;
const catchAsync_1 = __importDefault(require("../global/middlewares/catchAsync"));
const sendResponse_1 = __importDefault(require("../global/middlewares/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const Messages_1 = require("../Constants/Messages");
const survey_service_1 = require("../services/survey.service");
const validateSurveyQuestion_1 = require("../Utils/validateSurveyQuestion");
const ApiError_1 = __importDefault(require("../global/errors/ApiError"));
const emailServices_1 = require("../Utils/emailServices");
// Add a new survey
exports.addSurvey = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const surveyData = req.body;
    if (surveyData.questions)
        (0, validateSurveyQuestion_1.validateSurveyQuestions)(surveyData.questions);
    const survey = yield (0, survey_service_1.addSurveyService)(surveyData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: Messages_1.ApiMessages.SURVEY_ADDED,
        data: survey,
    });
}));
// Get all surveys
exports.getAllSurveys = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const surveys = yield (0, survey_service_1.getAllSurveysService)();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.SURVEYS_FETCHED,
        data: surveys,
    });
}));
// Get survey by ID
exports.getSurveyById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { user } = req; // Get user from auth middleware
    const survey = yield (0, survey_service_1.getSurveyByIdService)(id, user === null || user === void 0 ? void 0 : user.keyPopulation);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Survey fetched successfully",
        data: survey,
    });
}));
// Update survey status
exports.updateSurveyStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { isActive } = req.body;
    const updatedSurvey = yield (0, survey_service_1.updateSurveyStatusService)(id, isActive);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.SURVEY_STATUS_UPDATED,
        data: updatedSurvey,
    });
}));
// Delete survey
exports.deleteSurvey = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const survey = yield (0, survey_service_1.deleteSurveyService)(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.SURVEY_DELETED,
        data: survey,
    });
}));
// Update survey
exports.updateSurvey = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const surveyData = req.body;
    if (surveyData.questions)
        (0, validateSurveyQuestion_1.validateSurveyQuestions)(surveyData.questions);
    const updatedSurvey = yield (0, survey_service_1.updateSurveyService)(id, surveyData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.SURVEY_UPDATED,
        data: updatedSurvey,
    });
}));
// Get survey by country
exports.getSurveyByCountry = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { country } = req.params;
    const survey = yield (0, survey_service_1.getSurveyByCountryService)(country);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.SURVEY_FETCHED,
        data: survey,
    });
}));
// Submit survey response
exports.submitSurveyResponse = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req;
    const responseData = req.body;
    try {
        yield (0, emailServices_1.sendSurveyCompletionEmail)(user.email, user.name, responseData.title);
    }
    catch (emailError) {
        console.error('Failed to send survey completion email:', emailError);
    }
    const result = yield (0, survey_service_1.submitSurveyResponseService)(user.id, responseData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.SURVEY_SUBMITTED,
        data: result,
    });
}));
// Get user's survey progress
exports.getUserSurveyProgress = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req;
    const progress = yield (0, survey_service_1.getUserSurveyProgressService)(user.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.SURVEY_PROGRESS_FETCHED,
        data: progress,
    });
}));
// Update user's survey progress by section
exports.updateUserSurveyProgress = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req;
    const { surveyId, answers } = req.body;
    // Validate required fields
    if (!surveyId || !answers || !Array.isArray(answers)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "surveyId and answers array are required");
    }
    const fixedAnswers = answers.map(answer => {
        if (answer.categoryCode && answer.categoryCode.match(/^\d+\.\d{2,}$/)) {
            answer.categoryCode = answer.code.split('.').slice(0, 2).join('.');
        }
        return answer;
    });
    const result = yield (0, survey_service_1.updateUserSurveyProgressService)(user.id, {
        surveyId,
        answers: fixedAnswers
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Survey progress saved successfully",
        data: result,
    });
}));
// Get survey by user's country (from auth token)
exports.getUserCountrySurvey = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userCountry = (_a = req.user) === null || _a === void 0 ? void 0 : _a.country;
    if (!userCountry) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "User country not provided in token");
    }
    const { user } = req;
    const survey = yield (0, survey_service_1.getUserCountrySurveyService)(user.id, userCountry);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.SURVEY_FETCHED,
        data: survey,
    });
}));
// Get user's specific survey response
exports.getUserSurveyResponse = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req;
    const { surveyId } = req.params;
    const response = yield (0, survey_service_1.getUserSurveyResponseService)(user.id, surveyId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Survey response fetched successfully",
        data: response,
    });
}));
// Get all user's submitted survey responses
exports.getAllUserSurveyResponses = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req;
    const { page = 1, limit = 10, status } = req.query;
    const responses = yield (0, survey_service_1.getAllUserSurveyResponsesService)(user.id, {
        page: Number(page),
        limit: Number(limit),
        status: status
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Survey responses fetched successfully",
        data: responses,
    });
}));
exports.deleteAdminSurveyResponse = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { responseId } = req.params;
    const { user } = req;
    const data = yield (0, survey_service_1.deleteAdminSurveyResponseService)(responseId, user.role, user.country);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.SURVEY_RESPONSE_DELETED,
        data,
    });
}));
exports.deleteOwnSurveyResponse = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { surveyId } = req.params;
    const { user } = req;
    const data = yield (0, survey_service_1.deleteOwnSurveyResponseService)(user.id, surveyId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.SURVEY_RESPONSE_DELETED,
        data,
    });
}));
/** Superadmin & admin: all responses. Community admin: same `User.country` as respondents. */
exports.listAdminSurveyResponses = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req;
    const { page = 1, limit = 20, status, surveyId } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const rawLimit = Number(limit) || 20;
    const limitNum = Math.min(100, Math.max(1, rawLimit));
    const data = yield (0, survey_service_1.listAdminSurveyResponsesService)(user.role, user.country, {
        surveyId: typeof surveyId === "string" && surveyId.trim() ? surveyId.trim() : undefined,
        page: pageNum,
        limit: limitNum,
        status: typeof status === "string" ? status : undefined,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.SURVEY_RESPONSES_FETCHED,
        data,
    });
}));
/** Superadmin & admin: full readable response by Mongo id (community admin: scoped). */
exports.getAdminSurveyResponseById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { responseId } = req.params;
    const { user } = req;
    const data = yield (0, survey_service_1.getAdminSurveyResponseByIdService)(responseId, user.role, user.country);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: Messages_1.ApiMessages.ADMIN_SURVEY_RESPONSE_DETAIL,
        data,
    });
}));
