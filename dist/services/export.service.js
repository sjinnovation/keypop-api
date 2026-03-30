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
exports.exportSurveySummaryService = exports.exportAllSurveyResponsesService = exports.exportSurveyResponseService = exports.exportDataService = void 0;
const exportServices_1 = require("../Utils/exportServices");
const ApiError_1 = __importDefault(require("../global/errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const survey_model_1 = __importStar(require("../models/survey.model"));
const surveyResponse_model_1 = __importDefault(require("../models/surveyResponse.model"));
const user_model_1 = __importStar(require("../models/user.model"));
const Messages_1 = require("../Constants/Messages");
const surveyExport_1 = require("../Utils/surveyExport");
const assertCommunityAdminHasCountry = (scope) => {
    if (scope.role !== user_model_1.UserRole.COMMUNITYADMIN)
        return;
    if (scope.adminCountry === undefined ||
        scope.adminCountry === null ||
        String(scope.adminCountry).trim() === "") {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, Messages_1.ApiMessages.COMMUNITY_ADMIN_COUNTRY_REQUIRED);
    }
};
/** For community admins, IDs of users in their country; otherwise null (no extra filter). */
const communityRespondentIds = (scope) => __awaiter(void 0, void 0, void 0, function* () {
    if (!scope || scope.role !== user_model_1.UserRole.COMMUNITYADMIN)
        return null;
    assertCommunityAdminHasCountry(scope);
    return user_model_1.default.find({ country: scope.adminCountry }).distinct("_id");
});
const exportDataService = (type, tableData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        let buffer;
        let fileName;
        switch (type.toLowerCase()) {
            case "pdf":
                buffer = yield (0, exportServices_1.generatePDF)(tableData);
                fileName = `contact-requests-${timestamp}.pdf`;
                break;
            case "csv":
                buffer = yield (0, exportServices_1.generateCSV)(tableData);
                fileName = `contact-requests-${timestamp}.csv`;
                break;
            default:
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Unsupported file type. Use 'pdf' or 'csv'.");
        }
        return { buffer, fileName };
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || "Failed to generate file.");
    }
});
exports.exportDataService = exportDataService;
// Export single user's survey response
const exportSurveyResponseService = (userId, surveyId, format, scope) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch survey response with populated data
        const response = yield surveyResponse_model_1.default.findOne({ userId, surveyId })
            .populate({ path: 'userId', select: 'name email country' })
            .populate({
            path: 'surveyId',
            select: 'title country categories questions',
            populate: { path: 'country', select: 'name' }
        });
        if (!response) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Survey response not found");
        }
        if ((scope === null || scope === void 0 ? void 0 : scope.role) === user_model_1.UserRole.COMMUNITYADMIN) {
            assertCommunityAdminHasCountry(scope);
            const subject = response.userId;
            const uCountry = (subject === null || subject === void 0 ? void 0 : subject.country) != null ? String(subject.country) : "";
            if (uCountry !== String(scope.adminCountry)) {
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only export responses from users in your community");
            }
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        let buffer;
        let fileName;
        // Prepare data for export
        const exportData = prepareResponseData(response);
        switch (format) {
            case 'pdf':
                buffer = yield (0, surveyExport_1.generateSurveyResponsePDF)(exportData);
                fileName = `survey-response-${exportData.surveyTitle}-${exportData.userName}-${timestamp}.pdf`;
                break;
            case 'csv':
                buffer = yield (0, surveyExport_1.generateSurveyResponseCSV)(exportData);
                fileName = `survey-response-${exportData.surveyTitle}-${exportData.userName}-${timestamp}.csv`;
                break;
        }
        return { buffer, fileName };
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || "Failed to export survey response");
    }
});
exports.exportSurveyResponseService = exportSurveyResponseService;
// Export all responses for a survey
const exportAllSurveyResponsesService = (surveyId, format, scope) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const survey = yield survey_model_1.default.findById(surveyId)
            .populate('country', 'name')
            .populate('categories');
        if (!survey) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Survey not found");
        }
        const responseQuery = { surveyId };
        const scopedIds = yield communityRespondentIds(scope);
        if (scopedIds !== null) {
            responseQuery.userId = { $in: scopedIds };
        }
        const responses = yield surveyResponse_model_1.default.find(responseQuery)
            .populate('userId', 'name email country')
            .sort({ submittedAt: -1 });
        if (responses.length === 0) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, (scope === null || scope === void 0 ? void 0 : scope.role) === user_model_1.UserRole.COMMUNITYADMIN
                ? "No responses found for this survey in your community"
                : "No responses found for this survey");
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        let buffer;
        let fileName;
        // Create maps for efficient lookup
        const questionMap = new Map();
        const categoryMap = new Map();
        // Map questions by code
        if (survey.questions && Array.isArray(survey.questions)) {
            survey.questions.forEach(question => {
                questionMap.set(question.code, question);
            });
        }
        // Map categories by code
        if (survey.categories && Array.isArray(survey.categories)) {
            survey.categories.forEach(category => {
                categoryMap.set(category.code, category);
            });
        }
        // Prepare the export data with proper structure
        const exportData = {
            survey: {
                title: survey.title,
                country: ((_a = survey.country) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                questions: survey.questions,
                categories: survey.categories
            },
            responses: responses.map(response => {
                // Type guard for populated userId
                const user = response.userId;
                const userName = (user === null || user === void 0 ? void 0 : user.name) || 'Unknown';
                const userEmail = (user === null || user === void 0 ? void 0 : user.email) || 'Unknown';
                return {
                    userName,
                    userEmail,
                    submittedAt: response.submittedAt,
                    isComplete: response.isComplete,
                    answers: response.answers.map(answer => {
                        const question = questionMap.get(answer.code);
                        const category = categoryMap.get(answer.categoryCode);
                        return {
                            code: answer.code,
                            questionText: (question === null || question === void 0 ? void 0 : question.text) || 'Unknown Question',
                            categoryCode: answer.categoryCode,
                            categoryTitle: (category === null || category === void 0 ? void 0 : category.title) || 'Unknown Category',
                            answerType: answer.answerType,
                            value: answer.value,
                            // formattedValue: formatAnswerValue(answer.value, answer.answerType),
                            keyPopulation: answer.keyPopulation || [],
                            // keyPopulationDisplay: formatKeyPopulation(answer.keyPopulation)
                        };
                    })
                };
            }),
            totalResponses: responses.length,
            completeResponses: responses.filter(r => r.isComplete).length,
            incompleteResponses: responses.filter(r => !r.isComplete).length,
            responsesByDate: responses.reduce((acc, response) => {
                const date = new Date(response.submittedAt).toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {})
        };
        switch (format) {
            case 'pdf':
                buffer = yield (0, surveyExport_1.generateAllResponsesPDF)(exportData);
                fileName = `all-responses-${survey.title.replace(/[^a-z0-9]/gi, '-')}-${timestamp}.pdf`;
                break;
            case 'csv':
                buffer = yield (0, surveyExport_1.generateAllResponsesCSV)(exportData);
                fileName = `all-responses-${survey.title.replace(/[^a-z0-9]/gi, '-')}-${timestamp}.csv`;
                break;
            default:
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid format");
        }
        return { buffer, fileName };
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || "Failed to export survey responses");
    }
});
exports.exportAllSurveyResponsesService = exportAllSurveyResponsesService;
// Export survey summary/analytics
const exportSurveySummaryService = (surveyId, format, scope) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_model_1.default.findById(surveyId)
            .populate('country', 'name');
        if (!survey) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Survey not found");
        }
        const responseQuery = { surveyId };
        const scopedIds = yield communityRespondentIds(scope);
        if (scopedIds !== null) {
            responseQuery.userId = { $in: scopedIds };
        }
        const responses = yield surveyResponse_model_1.default.find(responseQuery);
        if ((scope === null || scope === void 0 ? void 0 : scope.role) === user_model_1.UserRole.COMMUNITYADMIN && responses.length === 0) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No responses found for this survey in your community");
        }
        // Calculate analytics
        const analytics = calculateSurveyAnalytics(survey, responses);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        let buffer;
        let fileName;
        switch (format) {
            case 'pdf':
                buffer = yield (0, surveyExport_1.generateSurveySummaryPDF)(survey, analytics);
                fileName = `survey-summary-${survey.title}-${timestamp}.pdf`;
                break;
            case 'csv':
                buffer = yield (0, surveyExport_1.generateSurveySummaryCSV)(survey, analytics);
                fileName = `survey-summary-${survey.title}-${timestamp}.csv`;
                break;
        }
        return { buffer, fileName };
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || "Failed to export survey summary");
    }
});
exports.exportSurveySummaryService = exportSurveySummaryService;
// Helper functions
const prepareResponseData = (response) => {
    var _a;
    const survey = response.surveyId;
    const user = response.userId;
    return {
        surveyTitle: survey.title,
        surveyCountry: ((_a = survey.country) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
        userName: (user === null || user === void 0 ? void 0 : user.name) || 'Anonymous',
        userEmail: (user === null || user === void 0 ? void 0 : user.email) || 'N/A',
        submittedAt: response.submittedAt,
        categories: survey.categories,
        questions: survey.questions,
        answers: response.answers.map((answer) => {
            const question = survey.questions.find((q) => q.code === answer.code);
            const category = survey.categories.find((c) => c.code === answer.categoryCode);
            return Object.assign(Object.assign({}, answer.toObject()), { questionText: (question === null || question === void 0 ? void 0 : question.text) || 'Unknown Question', categoryTitle: (category === null || category === void 0 ? void 0 : category.title) || 'Unknown Category', formattedValue: formatAnswerValue(answer.value, answer.answerType) });
        })
    };
};
// Helper function to format answer values based on type
const formatAnswerValue = (value, answerType) => {
    if (value === null || value === undefined || value === '') {
        return 'N/A';
    }
    switch (answerType) {
        case survey_model_1.AnswerType.YesNo:
            if (typeof value === 'boolean') {
                return value ? 'Yes' : 'No';
            }
            return value === 'true' || value === 'Yes' ? 'Yes' : 'No';
        case survey_model_1.AnswerType.Rating:
            return `${value}/5`;
        case survey_model_1.AnswerType.MCQ:
            // MCQ values might be stored as comma-separated strings or arrays
            if (Array.isArray(value)) {
                return value.join(', ');
            }
            return String(value);
        default:
            return String(value);
    }
};
// Helper function to format key population array for display
const formatKeyPopulation = (keyPopulation) => {
    if (!keyPopulation || keyPopulation.length === 0) {
        return 'General Population';
    }
    return keyPopulation.join(', ');
};
const calculateSurveyAnalytics = (survey, responses) => {
    const totalResponses = responses.length;
    const questionStats = {};
    survey.questions.forEach((question) => {
        const answers = responses.flatMap(r => r.answers.filter((a) => a.code === question.code));
        questionStats[question.code] = {
            questionText: question.text,
            answerType: question.answerType,
            totalAnswers: answers.length,
            stats: calculateQuestionStats(answers, question.answerType)
        };
    });
    return {
        totalResponses,
        completionRate: (responses.length / survey.questions.length) * 100,
        questionStats,
        responsesByDate: groupResponsesByDate(responses)
    };
};
const calculateQuestionStats = (answers, answerType) => {
    switch (answerType) {
        case 'YesNo':
            const yesCount = answers.filter(a => a.value === true).length;
            return {
                yes: yesCount,
                no: answers.length - yesCount,
                yesPercentage: (yesCount / answers.length) * 100
            };
        case 'Rating':
            const ratings = answers.map(a => a.value);
            return {
                average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
                distribution: [1, 2, 3, 4, 5].map(rating => ({
                    rating,
                    count: ratings.filter(r => r === rating).length
                }))
            };
        case 'MCQ':
            const optionCounts = {};
            answers.forEach(answer => {
                const values = Array.isArray(answer.value) ? answer.value : [answer.value];
                values.forEach((v) => {
                    optionCounts[v] = (optionCounts[v] || 0) + 1;
                });
            });
            return { optionCounts };
        default:
            return {};
    }
};
const groupResponsesByDate = (responses) => {
    const grouped = {};
    responses.forEach(response => {
        const date = new Date(response.submittedAt).toISOString().split('T')[0];
        grouped[date] = (grouped[date] || 0) + 1;
    });
    return grouped;
};
