import mongoose, { Schema, Document } from "mongoose";

export interface ICountry extends Document {
    name: string;
    code: string;
    isActive: boolean;
    surveyAvailable: boolean;
}

const CountrySchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    surveyAvailable: { type: Boolean, default: false },
});

export default mongoose.model<ICountry>("Country", CountrySchema);