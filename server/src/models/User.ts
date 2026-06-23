import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

const emergencyContactSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relation: { type: String },
  },
  { _id: false }
)

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['tenant', 'admin'], default: 'tenant' },
    avatarUrl: { type: String },
    occupation: { type: String },
    emergencyContact: { type: emergencyContactSchema },
    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId }

export const User = model('User', userSchema)

/** Shape returned to clients — never includes the password hash. */
export function toPublicUser(user: UserDoc) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl ?? undefined,
    occupation: user.occupation ?? undefined,
    emergencyContact: user.emergencyContact ?? undefined,
    profileComplete: user.profileComplete,
  }
}
