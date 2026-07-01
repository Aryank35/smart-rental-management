import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

/**
 * A file shared by the admin — an agreement, receipt, ID proof, etc.
 * Stored inline as a base64 data URL (the JSON body limit is 5mb), which keeps
 * the mock build dependency-free. Swap for object storage in a real deployment.
 */
const documentSchema = new Schema(
  {
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['agreement', 'receipt', 'id-proof', 'notice', 'other'],
      default: 'other',
    },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    /** base64 data URL of the file contents. */
    dataUrl: { type: String, required: true, select: false },
    sizeBytes: { type: Number, default: 0 },
    /** 'all' = every tenant in the org; 'tenant' = a single tenant. */
    audience: { type: String, enum: ['all', 'tenant'], default: 'all' },
    tenant: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

export type DocumentDoc = InferSchemaType<typeof documentSchema> & { _id: Types.ObjectId }

export const DocumentModel = model('Document', documentSchema)
