import mongoose, { Schema, Document } from "mongoose";
import { IAnswer, ISkippedQuestion, ISurveyStatistics, AnswerSchema, SkippedQuestionSchema, StatisticsSchema } from "./surveyTypes.model";

export interface ISurveyResponse extends Document {
  userId: mongoose.Types.ObjectId;
  surveyId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  skippedQuestions: ISkippedQuestion[];
  submittedAt: Date;
  isComplete: boolean;
  isPartialSubmission: boolean;
  completionPercentage: number;
  statistics: ISurveyStatistics;
}

const SurveyResponseSchema: Schema<ISurveyResponse> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    surveyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true
    },
    answers: { 
      type: [AnswerSchema], 
      required: true 
    },
    skippedQuestions: { 
      type: [SkippedQuestionSchema], 
      default: [] 
    },
    submittedAt: { 
      type: Date, 
      default: Date.now 
    },
    isComplete: { 
      type: Boolean, 
      default: false 
    },
    isPartialSubmission: { 
      type: Boolean, 
      default: false 
    },
    completionPercentage: { 
      type: Number, 
      min: 0, 
      max: 100,
      required: true 
    },
    statistics: {
      type: StatisticsSchema,
      required: false
    }
  },
  { timestamps: true }
);

// Indexes
SurveyResponseSchema.index({ surveyId: 1, userId: 1 });
SurveyResponseSchema.index({ userId: 1 });
SurveyResponseSchema.index({ "answers.code": 1 });
SurveyResponseSchema.index({ "answers.categoryCode": 1 });
SurveyResponseSchema.index({ "answers.keyPopulation": 1 });
SurveyResponseSchema.index({ "answers.skipped": 1 });
SurveyResponseSchema.index({ "skippedQuestions.code": 1 });

// Method to add a skipped question (not even attempted)
SurveyResponseSchema.methods.addSkippedQuestion = function(
  code: string, 
  categoryCode: string, 
  reason?: string
) {
  this.skippedQuestions.push({
    code,
    categoryCode,
    reason,
    skippedAt: new Date()
  });
};

export default mongoose.model<ISurveyResponse>(
  "SurveyResponse",
  SurveyResponseSchema
);