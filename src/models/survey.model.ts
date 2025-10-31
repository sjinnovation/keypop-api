import mongoose, { Schema, Document } from "mongoose";
import { ICountry } from "./country.model";

export enum KeyPopulation {
  PLHIV = "People Living With HIV",
  SexWorker = "Sex Worker",
  PWUD = "People Who Use Drugs",
  Trans = "Transgender Community",
  Intersex = "Intersex",
  LGBTQIAPlus = "LGBTQIA+",
  General = "General",
  Skip = "Skip",
}

export enum AnswerType {
  YesNo = "YesNo",
  Rating = "Rating",
  MCQ = "MCQ",
  Text = "Text",
}
export interface IShowIfCondition {
  questionCode: string;               // e.g. "1.1.2"
  expectedAnswer: string | number;    // e.g. "Yes" or 3
}

//Rating scale labels
export interface IRatingScaleLabels {
  minLabel: string;                   // e.g. "Strongly disagree", "Never", "Very poor"
  maxLabel: string;                   // e.g. "Strongly agree", "Always", "Very good"
  hasNAOption?: boolean;              // Optional N/A option for some scales
}

export interface IQuestion {
  code: string;                       // e.g. "1.1.2.1"
  categoryCode: string;               // e.g. "1.1"
  text: string;
  specificToKP?: KeyPopulation[];     // Applies to which key populations
  answerType: AnswerType;
  ratingScale?: number[];             // Required if answerType === "Rating"
  options?: string[];                 // Required if answerType === "MCQ"
  showIf?: IShowIfCondition;          // Conditional display logic
  ratingScaleLabels?: IRatingScaleLabels; // Custom labels for rating scales
}

export interface ICategory {
  code: string;                       // e.g. "1.1"
  title: string;                      // e.g. "Pre-arrival: Social determinants of health"
  questions: IQuestion[];              // Questions under this category
}

export interface ISurvey extends Document {
  title: string;
  country: ICountry["_id"];
  categories: ICategory[];
  questions: IQuestion[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isFinalized: boolean; // Indicates if the survey is finalized and cannot be modified
  hasResponses: boolean; // Indicates if the survey has any responses submitted
}

const ShowIfConditionSchema: Schema<IShowIfCondition> = new Schema({
  questionCode: { type: String, required: true },
  expectedAnswer: { type: Schema.Types.Mixed, required: true },
}, { _id: false });

// Rating scale labels
const RatingScaleLabelsSchema: Schema<IRatingScaleLabels> = new Schema({
  minLabel: { type: String, required: true },
  maxLabel: { type: String, required: true },
  hasNAOption: { type: Boolean, default: false },
}, { _id: false });

const QuestionSchema: Schema<IQuestion> = new Schema({
  code: { type: String, required: true },             // full hierarchical code
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
  ratingScaleLabels: { type: RatingScaleLabelsSchema, required: false },
});

QuestionSchema.index({ categoryCode: 1 });

const CategorySchema: Schema<ICategory> = new Schema({
  code: { type: String, required: true },
  title: { type: String, required: true },
});

const SurveySchema: Schema<ISurvey> = new Schema(
  {
    title: { type: String, required: true },
    country: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

SurveySchema.index({ country: 1, isActive: 1 });

export default mongoose.model<ISurvey>("Survey", SurveySchema);
