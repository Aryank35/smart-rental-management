import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

/**
 * A single charge against a tenant — rent, a utility bill, or a penalty.
 * Unifies the data behind the dashboard summary, upcoming/recent payments,
 * and the rent payment history.
 */
const billSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['rent', 'electricity', 'water', 'penalty'],
      required: true,
    },
    /** Human label for the billing period, e.g. "June 2026". */
    period: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paidOn: { type: Date, default: null },
    method: {
      type: String,
      enum: ['UPI', 'Card', 'Net Banking', 'Cash', null],
      default: null,
    },
    /** Stored status; "overdue" is also derived at read time from dueDate. */
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending',
    },
    receiptNo: { type: String, required: true },
  },
  { timestamps: true }
)

export type BillDoc = InferSchemaType<typeof billSchema> & { _id: Types.ObjectId }

export const Bill = model('Bill', billSchema)

/** Effective status: an unpaid bill past its due date reads as overdue. */
export function effectiveStatus(bill: Pick<BillDoc, 'status' | 'paidOn' | 'dueDate'>) {
  if (bill.paidOn || bill.status === 'paid') return 'paid' as const
  return bill.dueDate.getTime() < Date.now() ? ('overdue' as const) : ('pending' as const)
}
