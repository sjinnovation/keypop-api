import { AnswerType, KeyPopulation } from "./survey.model";

// Shared answer interface used by both Progress and Response
export interface IAnswer {
  code: string; // Question code e.g., "1.1.2.3"
  categoryCode: string; // Section code e.g., "1.1"
  value: string | number | boolean | null; // null for skipped
  answerType: AnswerType;
  keyPopulation?: KeyPopulation | KeyPopulation[]; // Can be single or array
  skipped?: boolean;
  skippedReason?: string; // Why it was skipped
}

// Shared skipped question interface
export interface ISkippedQuestion {
  code: string;
  categoryCode: string;
  reason?: string;
  skippedAt: Date;
}

// Statistics interface used by Progress
export interface ISurveyStatistics {
  totalQuestions: number;
  answered: number;
  skipped: number;
  unanswered?: number;
  lastUpdated: Date;
}

// Shared schemas
import mongoose, { Schema } from "mongoose";

export const AnswerSchema: Schema<IAnswer> = new Schema({
  code: { type: String, required: true },
  categoryCode: { type: String, required: true },
  value: { type: Schema.Types.Mixed, default: null },
  answerType: {
    type: String,
    enum: Object.values(AnswerType),
    required: true
  },
  keyPopulation: {
    type: Schema.Types.Mixed, // Can be string or array
    required: false
  },
  skipped: { type: Boolean, default: false },
  skippedReason: { type: String, required: false }
}, { _id: false });

export const SkippedQuestionSchema: Schema<ISkippedQuestion> = new Schema({
  code: { type: String, required: true },
  categoryCode: { type: String, required: true },
  reason: { type: String, required: false },
  skippedAt: { type: Date, default: Date.now }
}, { _id: false });

export const StatisticsSchema: Schema<ISurveyStatistics> = new Schema({
  totalQuestions: { type: Number, default: 0 },
  answered: { type: Number, default: 0 },
  skipped: { type: Number, default: 0 },
  unanswered: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });