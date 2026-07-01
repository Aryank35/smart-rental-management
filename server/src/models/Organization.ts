import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

/**
 * A landlord / property-management workspace. Every other record is scoped to
 * an organization so tenants of one landlord never see another landlord's data.
 * Created when an admin registers (see auth.controller.register).
 */
const organizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Org-wide defaults applied when creating tenancies / bills.
    settings: {
      currency: { type: String, default: 'INR' },
      dueDayOfMonth: { type: Number, default: 5 },
      penaltyPerDay: { type: Number, default: 100 },
      graceDays: { type: Number, default: 3 },
      supportEmail: { type: String, default: '' },
      supportPhone: { type: String, default: '' },
    },
  },
  { timestamps: true }
)

export type OrganizationDoc = InferSchemaType<typeof organizationSchema> & { _id: Types.ObjectId }

export const Organization = model('Organization', organizationSchema)

export function toPublicOrg(org: OrganizationDoc) {
  return {
    id: org._id.toString(),
    name: org.name,
    settings: {
      currency: org.settings?.currency ?? 'INR',
      dueDayOfMonth: org.settings?.dueDayOfMonth ?? 5,
      penaltyPerDay: org.settings?.penaltyPerDay ?? 100,
      graceDays: org.settings?.graceDays ?? 3,
      supportEmail: org.settings?.supportEmail ?? '',
      supportPhone: org.settings?.supportPhone ?? '',
    },
  }
}
