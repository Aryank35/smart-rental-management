import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

const noticeSchema = new Schema(
  {
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['maintenance', 'rent', 'community', 'emergency'],
      required: true,
    },
    date: { type: Date, required: true },
    excerpt: { type: String, required: true },
    body: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    /** Users who have read this notice (drives the unread dot). */
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

export type NoticeDoc = InferSchemaType<typeof noticeSchema> & { _id: Types.ObjectId }

export const Notice = model('Notice', noticeSchema)
