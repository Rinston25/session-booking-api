import { Schema, model } from 'mongoose';

export interface ITeacher {
  fullName: string;
  email: string;
  specialization: string;
  experience: number;
}

const teacherSchema = new Schema<ITeacher>(
  {
    fullName: { type: String, required: [true, 'fullName is required'], trim: true },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'email is invalid'],
    },
    specialization: { type: String, required: [true, 'specialization is required'], trim: true },
    experience: { type: Number, required: [true, 'experience is required'], min: [0, 'experience must be >= 0'] },
  },
  { timestamps: true }
);

export const Teacher = model<ITeacher>('Teacher', teacherSchema);
