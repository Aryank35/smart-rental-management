import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

const tenancySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', index: true },
    unit: { type: Schema.Types.ObjectId, ref: 'Unit', index: true },
    // Denormalized for tenant-facing display (kept in sync when unit is assigned).
    propertyName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    floor: { type: Number, required: true },
    occupancy: {
      type: String,
      enum: ['active', 'notice-period', 'vacated'],
      default: 'active',
    },
    movedInAt: { type: Date, required: true },
    agreementEndsAt: { type: Date, required: true },

    // Rent configuration
    monthlyRent: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    dueDayOfMonth: { type: Number, default: 5 },
    penaltyPerDay: { type: Number, default: 100 },
    graceDays: { type: Number, default: 3 },
  },
  { timestamps: true }
)

export type TenancyDoc = InferSchemaType<typeof tenancySchema> & { _id: Types.ObjectId }

export const Tenancy = model('Tenancy', tenancySchema)
