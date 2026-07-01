import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

/** A rentable unit (room / flat) inside a property. */
const unitSchema = new Schema(
  {
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    label: { type: String, required: true, trim: true }, // e.g. "101", "A-2"
    floor: { type: Number, default: 0 },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    sizeSqft: { type: Number, default: 0 },
    rentAmount: { type: Number, required: true },
    depositAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['vacant', 'occupied', 'maintenance'],
      default: 'vacant',
      index: true,
    },
    /** The tenancy currently occupying this unit, if any. */
    currentTenancy: { type: Schema.Types.ObjectId, ref: 'Tenancy', default: null },
  },
  { timestamps: true }
)

export type UnitDoc = InferSchemaType<typeof unitSchema> & { _id: Types.ObjectId }

export const Unit = model('Unit', unitSchema)
