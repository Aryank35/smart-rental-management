import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

/** A building / site owned by an organization. Holds one or more units. */
const propertySchema = new Schema(
  {
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['apartment', 'independent-house', 'pg', 'commercial'],
      default: 'apartment',
    },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
)

export type PropertyDoc = InferSchemaType<typeof propertySchema> & { _id: Types.ObjectId }

export const Property = model('Property', propertySchema)
