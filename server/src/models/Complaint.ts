import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

const complaintSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['maintenance', 'plumbing', 'electrical', 'cleaning', 'security', 'other'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    description: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    referenceNo: { type: String, required: true, unique: true },
    raisedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
    assignedTo: { type: String, default: null },
    /** Admin's note when resolving / updating the complaint. */
    resolutionNote: { type: String, default: null },
  },
  { timestamps: true }
)

export type ComplaintDoc = InferSchemaType<typeof complaintSchema> & { _id: Types.ObjectId }

export const Complaint = model('Complaint', complaintSchema)
