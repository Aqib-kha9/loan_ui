import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivity extends Document {
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  entityName?: string;
  amount?: number;
  action?: string;
  meta?: any;
}

const ActivitySchema = new Schema<IActivity>(
  {
    type: { type: String, required: true }, // Loan, Payment, System
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    user: { type: String, required: true }, // Username or ID
    entityName: { type: String }, // e.g. Customer Name
    amount: { type: Number },
    action: { type: String }, // Disbursed, Received, Created
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Prevent compiling model if already exists (Next.js hot reload fix)
const Activity: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;
