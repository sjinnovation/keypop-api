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
exports.AnswerType = exports.KeyPopulation = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var KeyPopulation;
(function (KeyPopulation) {
    KeyPopulation["PLHIV"] = "People Living With HIV";
    KeyPopulation["SexWorker"] = "Sex Worker";
    KeyPopulation["PWUD"] = "People Who Use Drugs";
    KeyPopulation["Trans"] = "Transgender Community";
    KeyPopulation["Intersex"] = "Intersex";
    KeyPopulation["LGBTQIAPlus"] = "LGBTQIA+";
    KeyPopulation["General"] = "General";
    KeyPopulation["Skip"] = "Skip";
})(KeyPopulation || (exports.KeyPopulation = KeyPopulation = {}));
var AnswerType;
(function (AnswerType) {
    AnswerType["YesNo"] = "YesNo";
    AnswerType["Rating"] = "Rating";
    AnswerType["MCQ"] = "MCQ";
    AnswerType["Text"] = "Text";
})(AnswerType || (exports.AnswerType = AnswerType = {}));
const ShowIfConditionSchema = new mongoose_1.Schema({
    questionCode: { type: String, required: true },
    expectedAnswer: { type: mongoose_1.Schema.Types.Mixed, required: true },
}, { _id: false });
const QuestionSchema = new mongoose_1.Schema({
    code: { type: String, required: true }, // full hierarchical code
    categoryCode: { type: String, required: true }, // e.g. "1.1"
    text: { type: String, required: true },
    specificToKP: {
        type: [String],
        enum: Object.values(KeyPopulation),
        default: [],
    },
    answerType: {
        type: String,
        enum: Object.values(AnswerType),
        required: true,
    },
    ratingScale: { type: [Number], required: false },
    options: { type: [String], required: false },
    showIf: { type: ShowIfConditionSchema, required: false },
});
QuestionSchema.index({ categoryCode: 1 });
const CategorySchema = new mongoose_1.Schema({
    code: { type: String, required: true },
    title: { type: String, required: true },
});
const SurveySchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    country: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Country",
        required: true,
    },
    categories: { type: [CategorySchema], default: [] },
    questions: [QuestionSchema],
    isActive: { type: Boolean, default: true },
    isFinalized: { type: Boolean, default: false }, // Indicates if the survey is finalized
    hasResponses: { type: Boolean, default: false }, // Indicates if the survey has responses
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});
SurveySchema.index({ country: 1, isActive: 1 });
exports.default = mongoose_1.default.model("Survey", SurveySchema);
