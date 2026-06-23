import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

const noticeSchema = new Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['maintenance', 'rent', 'community', 'emergency'],
      required: true,
    },
    date: { type: Date, required: true },
    excerpt: { type: String, required: true },
    body: { type: String },
    /** Users who have read this notice (drives the unread dot). */
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

export type NoticeDoc = InferSchemaType<typeof noticeSchema> & { _id: Types.ObjectId }

export const Notice = model('Notice', noticeSchema)
