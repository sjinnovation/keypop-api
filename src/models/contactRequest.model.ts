import mongoose, { Schema, Document} from "mongoose";
import { IUser } from "./user.model";

export enum ContactRequestStatus {
    ACKNOWLEDGED = "ACKNOWLEDGED",
    PENDING = "PENDING",
    CLOSED = "CLOSED"
}

export interface IContactRequest extends Document {
    name: string;
    email: string;
    phoneNumber: string;  
    message: string;
    status: ContactRequestStatus;
    user: IUser['_id'];
    isNewRequest?: boolean;
}

const ContactRequestSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: ContactRequestStatus.PENDING, enum: Object.values(ContactRequestStatus)  },
    isNewRequest: { type: Boolean, default: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false }, 
  },{
    timestamps: true,
  });

  export default mongoose.model("ContactRequest", ContactRequestSchema);