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
exports.listAdminSurveyResponsesService = exports.getAllUserSurveyResponsesService = exports.getUserSurveyResponseService = exports.getUserCountrySurveyService = exports.updateUserSurveyProgressService = exports.getUserSurveyProgressService = exports.submitSurveyResponseService = exports.getSurveyByCountryService = exports.deleteSurveyService = exports.updateSurveyStatusService = exports.updateSurveyService = exports.getSurveyByIdService = exports.getAllSurveysService = exports.addSurveyService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const survey_model_1 = __importDefault(require("../models/survey.model"));
const country_model_1 = __importDefault(require("../models/country.model"));
const surveyResponse_model_1 = __importDefault(require("../models/surveyResponse.model"));
const userSurveyProgress_model_1 = __importDefault(require("../models/userSurveyProgress.model"));
const user_model_1 = __importStar(require("../models/user.model"));
const Messages_1 = require("../Constants/Messages");
const ApiError_1 = __importDefault(require("../global/errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const validateSurveyQuestion_1 = require("../Utils/validateSurveyQuestion");
const submitSurveyValidation_1 = require("../Utils/submitSurveyValidation");
const saveSurveyResponse_1 = require("../Utils/saveSurveyResponse");
// Create survey
const addSurveyService = (surveyData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (Array.isArray(surveyData.questions)) {
            (0, validateSurveyQuestion_1.validateSurveyQuestions)(surveyData.questions);
        }
        const survey = new survey_model_1.default(surveyData);
        yield survey.save();
        // If a country is specified, update its survey availability
        if (surveyData.country) {
            yield country_model_1.default.findByIdAndUpdate(surveyData.country, { surveyAvailable: true }, { new: true });
        }
        return survey;
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Error adding survey");
    }
});
exports.addSurveyService = addSurveyService;
// Fetch all surveys
const getAllSurveysService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield survey_model_1.default.find({ isActive: true });
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Error fetching surveys");
    }
});
exports.getAllSurveysService = getAllSurveysService;
// Fetch by ID with key population filtering
const getSurveyByIdService = (id, userKeyPopulations) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_model_1.default.findById(id);
        if (!survey) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Survey not found");
        }
        // If no user key populations provided, return all questions
        if (!userKeyPopulations || userKeyPopulations.length === 0) {
            return survey;
        }
        // Filter questions based on user's key populations
        const filteredQuestions = survey.questions.filter(question => {
            // If question has no specific key population requirement, include it
            if (!question.specificToKP || question.specificToKP.length === 0) {
                return true;
            }
            // If question is specific to key populations, check if user belongs to any of them
            return question.specificToKP.some(kp => userKeyPopulations.includes(kp));
        });
        // Return survey with filtered questions
        return Object.assign(Object.assign({}, survey.toObject()), { questions: filteredQuestions, totalQuestions: filteredQuestions.length, originalTotalQuestions: survey.questions.length });
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Error fetching survey details");
    }
});
exports.getSurveyByIdService = getSurveyByIdService;
// Update survey
const updateSurveyService = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate questions if present in the updateData
        if (Array.isArray(updateData.questions)) {
            (0, validateSurveyQuestion_1.validateSurveyQuestions)(updateData.questions);
        }
        // Retrieve the existing survey
        const existingSurvey = yield survey_model_1.default.findById(id);
        if (!existingSurvey) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Survey not found");
        }
        // Prevent updates if finalized (example flag: isFinalized or hasResponses)
        if (existingSurvey.isFinalized || existingSurvey.hasResponses) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot update a finalized or answered survey");
        }
        if (Array.isArray(updateData.questions)) {
            (0, validateSurveyQuestion_1.validateSurveyQuestions)(updateData.questions);
        }
        // Capture the old country and the new country (if changed)
        const oldCountryId = existingSurvey.country.toString();
        const newCountryId = updateData.country ? updateData.country.toString() : oldCountryId;
        // Update the survey with the new data
        const updatedSurvey = yield survey_model_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updatedSurvey) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Survey not found");
        }
        // If the country has changed, update both countries accordingly
        if (newCountryId !== oldCountryId) {
            // Update the new country to mark that a survey is available
            yield country_model_1.default.findByIdAndUpdate(newCountryId, { $set: { surveyAvailable: true } });
            // Check if there are any surveys remaining for the old country
            const remainingSurveys = yield survey_model_1.default.countDocuments({ country: oldCountryId });
            // If no surveys remain for the old country, mark surveyAvailable as false
            if (remainingSurveys === 0) {
                yield country_model_1.default.findByIdAndUpdate(oldCountryId, { $set: { surveyAvailable: false } });
            }
        }
        return updatedSurvey;
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Error updating survey");
    }
});
exports.updateSurveyService = updateSurveyService;
// Update only status
const updateSurveyStatusService = (id, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.updateSurveyService)(id, { isActive });
});
exports.updateSurveyStatusService = updateSurveyStatusService;
// Delete survey
const deleteSurveyService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_model_1.default.findById(id);
        if (!survey) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Survey not found");
        }
        yield survey.deleteOne();
        return survey;
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Error deleting survey");
    }
});
exports.deleteSurveyService = deleteSurveyService;
// By country
const getSurveyByCountryService = (country) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const survey = yield survey_model_1.default
            .find({ country, isActive: true })
            .select('_id title')
            .lean();
        if (!survey) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Survey not found for this country");
        }
        return survey;
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Error fetching country survey");
    }
});
exports.getSurveyByCountryService = getSurveyByCountryService;
// Submit survey response
const submitSurveyResponseService = (userId, responseData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { surveyId, answers, skippedQuestions = [] } = responseData;
        const existing = yield surveyResponse_model_1.default.findOne({ userId, surveyId });
        if (existing) {
            throw new ApiError_1.default(http_status_1.default.CONFLICT, "Survey already submitted.");
        }
        const survey = yield survey_model_1.default.findById(surveyId);
        if (!survey) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Survey not found.");
        }
        if (survey.isFinalized) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot submit responses to a finalized survey.");
        }
        const allQuestions = survey.questions;
        if (!Array.isArray(answers)) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Answers must be an array.");
        }
        // Process answers to handle skipped ones
        const processedAnswers = answers.map((answer) => ({
            code: answer.code,
            categoryCode: answer.categoryCode,
            value: answer.value,
            answerType: answer.answerType,
            keyPopulation: answer.keyPopulation,
            skipped: answer.skipped || (answer.value === null || answer.value === undefined),
            skippedReason: answer.skippedReason
        }));
        // Separate answered and skipped
        const answeredQuestions = processedAnswers.filter((a) => !a.skipped);
        const skippedAnswers = processedAnswers.filter((a) => a.skipped);
        // Create answer map for conditional logic (only non-skipped answers)
        const answerMap = Object.fromEntries(answeredQuestions.map((a) => [a.code, a.value]));
        // Check which questions should be shown based on conditional logic
        const visibleQuestions = allQuestions.filter(question => !question.showIf || (0, submitSurveyValidation_1.isConditionMet)(question.showIf, answerMap));
        // Get codes of visible questions
        const visibleQuestionCodes = new Set(visibleQuestions.map(q => q.code));
        // Filter answered questions to only include those that should be visible
        const validAnsweredQuestions = answeredQuestions.filter((a) => visibleQuestionCodes.has(a.code));
        // Validate non-skipped answers
        for (const answer of validAnsweredQuestions) {
            const question = allQuestions.find(q => q.code === answer.code);
            if (question && !(0, submitSurveyValidation_1.isValidAnswer)(question, answer.value)) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Invalid answer for question ${answer.code}`);
            }
        }
        // Calculate statistics based on VISIBLE questions only
        const totalVisible = visibleQuestions.length;
        const totalAnswered = validAnsweredQuestions.length;
        const totalSkipped = skippedAnswers.filter(a => visibleQuestionCodes.has(a.code)).length +
            skippedQuestions.filter((sq) => visibleQuestionCodes.has(sq.code)).length;
        // IMPORTANT: Both answered and skipped count as completed
        const totalCompleted = totalAnswered + totalSkipped;
        // Calculate completion percentage based on completed (answered + skipped)
        let completionPercentage = 0;
        if (totalVisible > 0) {
            completionPercentage = Math.min(100, Math.max(0, (totalCompleted / totalVisible) * 100));
        }
        // Round to 2 decimal places
        completionPercentage = Math.round(completionPercentage * 100) / 100;
        // Check if fully complete based on completed count
        const isFullyComplete = totalCompleted >= totalVisible && completionPercentage >= 99.99;
        const isPartiallyComplete = totalCompleted > 0;
        if (!isPartiallyComplete) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Cannot submit survey with no answers.");
        }
        // Create the response with completion status
        const response = new surveyResponse_model_1.default({
            userId,
            surveyId,
            answers: processedAnswers,
            skippedQuestions: skippedQuestions.map((sq) => ({
                code: sq.code,
                categoryCode: sq.categoryCode,
                reason: sq.reason || 'User skipped',
                skippedAt: sq.skippedAt || new Date()
            })),
            submittedAt: new Date(),
            isComplete: isFullyComplete,
            isPartialSubmission: !isFullyComplete,
            completionPercentage: completionPercentage,
            statistics: {
                totalQuestions: totalVisible,
                answered: totalAnswered,
                skipped: totalSkipped,
                unanswered: totalVisible - totalCompleted
            }
        });
        yield response.save();
        // Mark survey as having responses
        if (!survey.hasResponses) {
            survey.hasResponses = true;
            yield survey.save();
        }
        // Remove any saved progress for this survey
        yield userSurveyProgress_model_1.default.deleteMany({ userId, surveyId });
        return {
            response,
            summary: {
                totalQuestions: totalVisible,
                answered: totalAnswered,
                skipped: totalSkipped,
                unanswered: totalVisible - totalCompleted,
                completionPercentage: completionPercentage.toFixed(2),
                isComplete: isFullyComplete,
                isPartialSubmission: !isFullyComplete,
                message: isFullyComplete
                    ? "Survey submitted successfully!"
                    : `Survey partially submitted with ${completionPercentage.toFixed(1)}% completion.`
            }
        };
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            console.error('Validation Error:', error);
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Validation Error: ${error.message}`);
        }
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Error submitting survey response");
    }
});
exports.submitSurveyResponseService = submitSurveyResponseService;
// Get user survey progress with detailed information
const getUserSurveyProgressService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all progress records for the user
        const progressRecords = yield userSurveyProgress_model_1.default.find({ userId })
            .populate({
            path: 'surveyId',
            select: 'title description categories questions country',
            populate: {
                path: 'country',
                select: 'name code'
            }
        })
            .lean();
        // If no progress found
        if (!progressRecords || progressRecords.length === 0) {
            return {
                surveys: [],
                summary: {
                    totalSurveysStarted: 0,
                    totalSurveysCompleted: 0,
                    overallProgress: 0
                }
            };
        }
        // Process each progress record
        const surveysWithProgress = progressRecords.map(progress => {
            var _a, _b, _c;
            const survey = progress.surveyId;
            const totalQuestions = ((_a = survey === null || survey === void 0 ? void 0 : survey.questions) === null || _a === void 0 ? void 0 : _a.length) || 0;
            // Calculate completed count (answered + skipped)
            const answeredCount = progress.answers.filter(a => !a.skipped && a.value !== null).length;
            const skippedCount = progress.answers.filter(a => a.skipped).length;
            const completedCount = answeredCount + skippedCount;
            // Recalculate completion percentage to ensure consistency
            const completionPercentage = totalQuestions > 0
                ? Math.round((completedCount / totalQuestions) * 100 * 100) / 100
                : 0;
            // Get section-wise progress
            const sectionsProgress = (survey === null || survey === void 0 ? void 0 : survey.categories) ?
                (0, saveSurveyResponse_1.getSectionsSummary)(progress.answers, survey.categories) : {};
            // Find next unanswered question
            const answeredCodes = new Set(progress.answers.map(a => a.code));
            const nextQuestion = (_b = survey === null || survey === void 0 ? void 0 : survey.questions) === null || _b === void 0 ? void 0 : _b.find((q) => !answeredCodes.has(q.code));
            return {
                surveyId: progress.surveyId._id || progress.surveyId,
                surveyTitle: (survey === null || survey === void 0 ? void 0 : survey.title) || 'Unknown Survey',
                surveyDescription: (survey === null || survey === void 0 ? void 0 : survey.description) || '',
                country: (survey === null || survey === void 0 ? void 0 : survey.country) || null,
                progress: {
                    totalQuestions,
                    totalAnswered: answeredCount,
                    totalSkipped: skippedCount,
                    totalCompleted: completedCount,
                    totalUnanswered: totalQuestions - completedCount,
                    completionPercentage: completionPercentage,
                    completionPercentageText: `${completionPercentage}%`,
                    lastSection: progress.lastSection || null,
                    lastUpdated: ((_c = progress.statistics) === null || _c === void 0 ? void 0 : _c.lastUpdated) || progress.updatedAt,
                    isComplete: completionPercentage >= 100
                },
                sectionsProgress,
                nextQuestion: nextQuestion ? {
                    code: nextQuestion.code,
                    categoryCode: nextQuestion.categoryCode,
                    text: nextQuestion.text,
                    answerType: nextQuestion.answerType
                } : null,
                canSubmit: completionPercentage >= 100,
                lastActivity: progress.updatedAt
            };
        });
        // Calculate overall summary
        const totalSurveysStarted = surveysWithProgress.length;
        const totalSurveysCompleted = surveysWithProgress.filter(s => s.progress.isComplete).length;
        const overallProgress = totalSurveysStarted > 0
            ? surveysWithProgress.reduce((sum, s) => sum + s.progress.completionPercentage, 0) / totalSurveysStarted
            : 0;
        return {
            surveys: surveysWithProgress,
            summary: {
                totalSurveysStarted,
                totalSurveysCompleted,
                totalSurveysInProgress: totalSurveysStarted - totalSurveysCompleted,
                overallProgress: Math.round(overallProgress * 100) / 100,
                overallProgressText: `${Math.round(overallProgress * 100) / 100}%`
            }
        };
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || "Error fetching survey progress");
    }
});
exports.getUserSurveyProgressService = getUserSurveyProgressService;
// Update user survey progress
const updateUserSurveyProgressService = (userId, progressData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { surveyId, answers } = progressData;
        // Validate survey exists
        const survey = yield survey_model_1.default.findById(surveyId);
        if (!survey) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Survey not found");
        }
        // Get existing progress
        let existingProgress = yield userSurveyProgress_model_1.default.findOne({
            userId,
            surveyId
        });
        // Initialize if no existing progress
        if (!existingProgress) {
            existingProgress = new userSurveyProgress_model_1.default({
                userId,
                surveyId,
                answers: [],
                skippedQuestions: [],
                completionPercentage: 0,
                statistics: {
                    totalQuestions: survey.questions.length,
                    answered: 0,
                    skipped: 0,
                    unanswered: survey.questions.length,
                    lastUpdated: new Date()
                }
            });
        }
        // Create a map of existing answers for quick lookup
        const existingAnswersMap = new Map(existingProgress.answers.map(a => [a.code, a]));
        // Process new answers
        answers.forEach(newAnswer => {
            // Fix incorrect categoryCode values (2.40 -> 2.4, etc.)
            if (newAnswer.categoryCode && newAnswer.categoryCode.match(/^\d+\.\d{2,}$/)) {
                newAnswer.categoryCode = newAnswer.code.split('.').slice(0, 2).join('.');
            }
            // Update or add the answer
            existingAnswersMap.set(newAnswer.code, newAnswer);
        });
        // Convert map back to array
        const updatedAnswers = Array.from(existingAnswersMap.values());
        // Sort answers by code to maintain order
        updatedAnswers.sort((a, b) => {
            const aParts = a.code.split('.').map(Number);
            const bParts = b.code.split('.').map(Number);
            for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                if (aParts[i] !== bParts[i]) {
                    return (aParts[i] || 0) - (bParts[i] || 0);
                }
            }
            return 0;
        });
        // Calculate statistics
        const answeredCount = updatedAnswers.filter(a => !a.skipped && a.value !== null).length;
        const skippedCount = updatedAnswers.filter(a => a.skipped).length;
        const totalQuestions = survey.questions.length;
        const completedCount = answeredCount + skippedCount;
        const unansweredCount = totalQuestions - updatedAnswers.length;
        const completionPercentage = totalQuestions > 0
            ? Math.round((completedCount / totalQuestions) * 100 * 100) / 100
            : 0;
        // Determine the last answered section
        const lastAnsweredCode = ((_a = updatedAnswers[updatedAnswers.length - 1]) === null || _a === void 0 ? void 0 : _a.code) || '';
        const lastSection = lastAnsweredCode.split('.').slice(0, 2).join('.');
        // Update progress
        existingProgress.answers = updatedAnswers;
        existingProgress.completionPercentage = completionPercentage;
        existingProgress.lastSection = lastSection;
        existingProgress.statistics = {
            totalQuestions,
            answered: answeredCount,
            skipped: skippedCount,
            unanswered: unansweredCount,
            lastUpdated: new Date()
        };
        yield existingProgress.save();
        // Get sections summary
        const sectionsSummary = (0, saveSurveyResponse_1.getSectionsSummary)(updatedAnswers, survey.categories);
        return {
            progress: existingProgress,
            summary: {
                totalQuestions,
                totalAnswered: answeredCount,
                totalSkipped: skippedCount,
                totalCompleted: completedCount,
                totalUnanswered: unansweredCount,
                completionPercentage: `${completionPercentage}%`,
                lastAnsweredQuestion: lastAnsweredCode,
                lastSection,
                sectionsProgress: sectionsSummary,
                canProceedToSection: (0, saveSurveyResponse_1.getNextSection)(lastSection, survey.categories),
                lastSaved: new Date()
            }
        };
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || "Error updating survey progress");
    }
});
exports.updateUserSurveyProgressService = updateUserSurveyProgressService;
// Get survey by user's country (from auth token)
const getUserCountrySurveyService = (userId, countryCode) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First, try to get country-specific surveys
        let surveysWithCountry = yield survey_model_1.default.aggregate([
            {
                $lookup: {
                    from: 'countries',
                    localField: 'country',
                    foreignField: '_id',
                    as: 'countryData'
                }
            },
            {
                $unwind: '$countryData'
            },
            {
                $match: {
                    'countryData.code': countryCode,
                    isActive: true
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    categories: 1,
                    questions: 1,
                    country: {
                        _id: '$countryData._id',
                        name: '$countryData.name',
                        code: '$countryData.code'
                    }
                }
            }
        ]);
        // If no country-specific surveys found, try to get global surveys
        if (!surveysWithCountry || surveysWithCountry.length === 0) {
            surveysWithCountry = yield survey_model_1.default.aggregate([
                {
                    $lookup: {
                        from: 'countries',
                        localField: 'country',
                        foreignField: '_id',
                        as: 'countryData'
                    }
                },
                {
                    $unwind: '$countryData'
                },
                {
                    $match: {
                        'countryData.code': 'GL', // Global survey code
                        isActive: true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        description: 1,
                        categories: 1,
                        questions: 1,
                        country: {
                            _id: '$countryData._id',
                            name: '$countryData.name',
                            code: '$countryData.code'
                        },
                        isGlobalSurvey: { $literal: true } // Mark as global survey
                    }
                }
            ]);
            // If still no surveys found, throw error
            if (!surveysWithCountry || surveysWithCountry.length === 0) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No surveys found for your country or globally");
            }
        }
        // Check if user has already completed any surveys
        const userResponses = yield surveyResponse_model_1.default.find({
            userId,
            surveyId: { $in: surveysWithCountry.map(s => s._id) }
        }).select('surveyId isComplete');
        // Check user progress for incomplete surveys
        const userProgress = yield userSurveyProgress_model_1.default.find({
            userId,
            surveyId: { $in: surveysWithCountry.map(s => s._id) }
        }).select('surveyId completionPercentage statistics');
        // Add completion status and progress to each survey
        const surveysWithStatus = surveysWithCountry.map(survey => {
            const response = userResponses.find(r => r.surveyId.toString() === survey._id.toString());
            const progress = userProgress.find(p => p.surveyId.toString() === survey._id.toString());
            return Object.assign(Object.assign({}, survey), { userStatus: {
                    hasStarted: !!response || !!progress,
                    isComplete: (response === null || response === void 0 ? void 0 : response.isComplete) || false,
                    completionPercentage: (progress === null || progress === void 0 ? void 0 : progress.completionPercentage) || 0,
                    statistics: (progress === null || progress === void 0 ? void 0 : progress.statistics) || null
                }, surveyType: survey.isGlobalSurvey ? 'global' : 'country-specific', userCountry: countryCode // Include user's actual country for reference
             });
        });
        return surveysWithStatus;
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || "Error fetching country surveys");
    }
});
exports.getUserCountrySurveyService = getUserCountrySurveyService;
// Get specific survey response or progress
const getUserSurveyResponseService = (userId, surveyId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Single query to check both collections
        const [response, progress] = yield Promise.all([
            surveyResponse_model_1.default.findOne({ userId, surveyId }).populate({
                path: 'surveyId',
                select: 'title description categories questions country',
                populate: { path: 'country', select: 'name code' }
            }).lean(),
            userSurveyProgress_model_1.default.findOne({ userId, surveyId }).populate({
                path: 'surveyId',
                select: 'title description categories questions country',
                populate: { path: 'country', select: 'name code' }
            }).lean()
        ]);
        // Use response if exists, otherwise use progress
        const data = response || progress;
        if (!data) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No survey data found");
        }
        const survey = data.surveyId;
        const isFromProgress = !response; // true if using progress data
        return {
            responseId: data._id,
            survey: {
                id: survey._id,
                title: survey.title,
                description: survey.description,
                country: survey.country
            },
            submittedAt: (response === null || response === void 0 ? void 0 : response.submittedAt) || null,
            lastUpdated: 'updatedAt' in data ? data.updatedAt : null,
            isComplete: 'isComplete' in data ? data.isComplete || false : false,
            isPartialSubmission: 'isPartialSubmission' in data ? data.isPartialSubmission : true,
            completionPercentage: data.completionPercentage || 0,
            isFromProgress,
            status: isFromProgress ? 'in-progress' : ('isComplete' in data && data.isComplete ? 'completed' : 'partially-submitted'),
            statistics: data.statistics || {},
            answers: data.answers || [],
            skippedQuestions: data.skippedQuestions || []
        };
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || "Error fetching survey data");
    }
});
exports.getUserSurveyResponseService = getUserSurveyResponseService;
// Get all survey responses with pagination
const getAllUserSurveyResponsesService = (userId, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, status } = options;
        const skip = (page - 1) * limit;
        // Build query
        const query = { userId };
        if (status === 'complete') {
            query.isComplete = true;
        }
        else if (status === 'partial') {
            query.isPartialSubmission = true;
        }
        // Get total count
        const total = yield surveyResponse_model_1.default.countDocuments(query);
        // Get responses
        const responses = yield surveyResponse_model_1.default.find(query)
            .populate({
            path: 'surveyId',
            select: 'title description country',
            populate: {
                path: 'country',
                select: 'name code'
            }
        })
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        // Process each response
        const processedResponses = responses.map(response => {
            const survey = response.surveyId;
            return {
                responseId: response._id,
                survey: {
                    id: survey._id,
                    title: survey.title,
                    country: survey.country
                },
                submittedAt: response.submittedAt,
                isComplete: response.isComplete,
                completionPercentage: response.completionPercentage,
                statistics: response.statistics,
                totalAnswers: response.answers.length,
                totalSkipped: response.skippedQuestions.length
            };
        });
        return {
            responses: processedResponses,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        };
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || "Error fetching survey responses");
    }
});
exports.getAllUserSurveyResponsesService = getAllUserSurveyResponsesService;
/** Superadmin & admin: all responses. Community admin: responses from users in the same `User.country`. */
const listAdminSurveyResponsesService = (adminRole, adminCountry, options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, status, surveyId } = options;
        if (adminRole === user_model_1.UserRole.COMMUNITYADMIN) {
            if (adminCountry === undefined ||
                adminCountry === null ||
                String(adminCountry).trim() === "") {
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, Messages_1.ApiMessages.COMMUNITY_ADMIN_COUNTRY_REQUIRED);
            }
        }
        const skip = (page - 1) * limit;
        const query = {};
        if (surveyId) {
            if (!mongoose_1.default.Types.ObjectId.isValid(surveyId)) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid survey ID");
            }
            query.surveyId = new mongoose_1.default.Types.ObjectId(surveyId);
        }
        if (status === "complete") {
            query.isComplete = true;
        }
        else if (status === "partial") {
            query.isPartialSubmission = true;
        }
        if (adminRole === user_model_1.UserRole.COMMUNITYADMIN) {
            const userIds = yield user_model_1.default.find({ country: adminCountry }).distinct("_id");
            if (!userIds.length) {
                return {
                    responses: [],
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        totalPages: 0,
                        hasNextPage: false,
                        hasPrevPage: page > 1,
                    },
                };
            }
            query.userId = { $in: userIds };
        }
        const total = yield surveyResponse_model_1.default.countDocuments(query);
        const responses = yield surveyResponse_model_1.default.find(query)
            .populate({
            path: "surveyId",
            select: "title description country",
            populate: { path: "country", select: "name code" },
        })
            .populate({ path: "userId", select: "name email country" })
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const processedResponses = responses.map((response) => {
            var _a, _b, _c, _d;
            const survey = response.surveyId;
            const u = response.userId;
            return {
                responseId: response._id,
                surveyId: survey === null || survey === void 0 ? void 0 : survey._id,
                user: u
                    ? {
                        id: u._id,
                        name: u.name,
                        email: u.email,
                        country: u.country,
                    }
                    : null,
                survey: survey
                    ? {
                        id: survey._id,
                        title: survey.title,
                        description: survey.description,
                        country: survey.country,
                    }
                    : null,
                submittedAt: response.submittedAt,
                isComplete: response.isComplete,
                isPartialSubmission: response.isPartialSubmission,
                completionPercentage: response.completionPercentage,
                statistics: response.statistics,
                totalAnswers: (_b = (_a = response.answers) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0,
                totalSkipped: (_d = (_c = response.skippedQuestions) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0,
            };
        });
        const totalPages = Math.ceil(total / limit) || 0;
        return {
            responses: processedResponses,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
    catch (error) {
        if (error instanceof ApiError_1.default)
            throw error;
        throw new ApiError_1.default(error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR, error.message || "Error fetching survey responses");
    }
});
exports.listAdminSurveyResponsesService = listAdminSurveyResponsesService;
