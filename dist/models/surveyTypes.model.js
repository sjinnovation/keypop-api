"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsSchema = exports.SkippedQuestionSchema = exports.AnswerSchema = void 0;
const survey_model_1 = require("./survey.model");
// Shared schemas
const mongoose_1 = require("mongoose");
exports.AnswerSchema = new mongoose_1.Schema({
    code: { type: String, required: true },
    categoryCode: { type: String, required: true },
    value: { type: mongoose_1.Schema.Types.Mixed, default: null },
    answerType: {
        type: String,
        enum: Object.values(survey_model_1.AnswerType),
        required: true
    },
    keyPopulation: {
        type: mongoose_1.Schema.Types.Mixed, // Can be string or array
        required: false
    },
    skipped: { type: Boolean, default: false },
    skippedReason: { type: String, required: false }
}, { _id: false });
exports.SkippedQuestionSchema = new mongoose_1.Schema({
    code: { type: String, required: true },
    categoryCode: { type: String, required: true },
    reason: { type: String, required: false },
    skippedAt: { type: Date, default: Date.now }
}, { _id: false });
exports.StatisticsSchema = new mongoose_1.Schema({
    totalQuestions: { type: Number, default: 0 },
    answered: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    unanswered: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
}, { _id: false });
