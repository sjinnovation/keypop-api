import mongoose, { Schema, Document } from "mongoose";
import { IAnswer, ISkippedQuestion, ISurveyStatistics, AnswerSchema, SkippedQuestionSchema, StatisticsSchema } from "./surveyTypes.model";

export interface IUserSurveyProgress extends Document {
  userId: mongoose.Types.ObjectId;
  surveyId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  skippedQuestions: ISkippedQuestion[];
  completionPercentage: number;
  statistics: ISurveyStatistics;
  updatedAt: Date;
  lastSection: string; // Track last section completed
}

const UserSurveyProgressSchema: Schema<IUserSurveyProgress> = new Schema(
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
      default: []
    },
    skippedQuestions: {
      type: [SkippedQuestionSchema],
      default: []
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastSection: {
      type: String,
      required: false
    },
    statistics: {
      type: StatisticsSchema,
      default: () => ({
        totalQuestions: 0,
        answered: 0,
        skipped: 0,
        unanswered: 0,
        lastUpdated: new Date()
      })
    }
  },
  { timestamps: true }
);

// Additional indexes for performance
UserSurveyProgressSchema.index({ userId: 1, surveyId: 1 },{ unique: true });
UserSurveyProgressSchema.index({ userId: 1 });
UserSurveyProgressSchema.index({ "answers.subCode": 1 });
UserSurveyProgressSchema.index({ "answers.keyPopulation": 1 });
UserSurveyProgressSchema.index({ "answers.skipped": 1 });
UserSurveyProgressSchema.index({ updatedAt: -1 });

// Virtual to get skip rate
UserSurveyProgressSchema.virtual('skipRate').get(function () {
  if (!this.statistics || this.statistics.totalQuestions === 0) return 0;
  return (this.statistics.skipped / this.statistics.totalQuestions) * 100;
});

// Method to update statistics
UserSurveyProgressSchema.methods.updateStatistics = function () {
  const totalAnswers = this.answers.length;
  const skippedAnswers = this.answers.filter((a: { skipped: any; }) => a.skipped).length;
  const answeredQuestions = this.answers.filter((a: { skipped: any; value: null; }) => !a.skipped && a.value !== null).length;
  const totalSkipped = skippedAnswers + this.skippedQuestions.length;

  this.statistics = {
    totalQuestions: totalAnswers + this.skippedQuestions.length,
    answered: answeredQuestions,
    skipped: totalSkipped,
    lastUpdated: new Date()
  };

  if (this.statistics.totalQuestions > 0) {
    this.completionPercentage = (answeredQuestions / this.statistics.totalQuestions) * 100;
  }
};

export default mongoose.model<IUserSurveyProgress>(
  "UserSurveyProgress",
  UserSurveyProgressSchema
);