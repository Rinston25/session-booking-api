import { Schema, Types, model } from 'mongoose';

export const SESSION_STATUS = ['AVAILABLE', 'BOOKED', 'COMPLETED'] as const;
export type SessionStatus = (typeof SESSION_STATUS)[number];

export interface ISession {
  teacherId: Types.ObjectId;
  userId: Types.ObjectId | null;
  startTime: Date;
  endTime: Date;
  status: SessionStatus;
  completedAt: Date | null;
}

const sessionSchema = new Schema<ISession>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: [true, 'teacherId is required'] },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    startTime: { type: Date, required: [true, 'startTime is required'] },
    endTime: { type: Date, required: [true, 'endTime is required'] },
    status: { type: String, enum: SESSION_STATUS, default: 'AVAILABLE' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

sessionSchema.index({ status: 1, startTime: 1 });
sessionSchema.index({ userId: 1, status: 1 });

export const Session = model<ISession>('Session', sessionSchema);
