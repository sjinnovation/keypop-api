import mongoose, { Schema, Document } from "mongoose";
import { KeyPopulation } from "./survey.model";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  SUPERADMIN = "superadmin",
  COMMUNITYADMIN = "communityadmin",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  NON_BINARY = "non-binary",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer not to say"
}

export enum SexualOrientation {
  HETEROSEXUAL = "heterosexual",
  HOMOSEXUAL = "homosexual",
  BISEXUAL = "bisexual",
  PANSEXUAL = "pansexual",
  ASEXUAL = "asexual",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer not to say"
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profileImage: string;
  resetPasswordToken: string | undefined;
  resetPasswordExpires: Date | undefined;
  gender: Gender;
  sexualOrientation: SexualOrientation;
  keyPopulation: KeyPopulation[];
  age: number;
  country: string;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    profileImage: { type: String, default: "" },
    resetPasswordToken: { type: String, default: undefined },
    resetPasswordExpires: { type: Date, default: undefined },
    gender: {
      type: String,
      enum: Object.values(Gender),
      required: false
    },
    sexualOrientation: {
      type: String,
      enum: Object.values(SexualOrientation),
      required: false
    },
    keyPopulation: [{
      type: String,
      enum: Object.values(KeyPopulation),
      required: false
    }],
    age: {
      type: Number,
      required: false
    },
    country: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);