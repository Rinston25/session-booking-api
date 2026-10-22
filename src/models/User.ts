import { Schema, model } from 'mongoose';

export interface IUser {
  fullName: string;
  email: string;
  phone: string;
}

const userSchema = new Schema<IUser>(
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
    phone: {
      type: String,
      required: [true, 'phone is required'],
      trim: true,
      match: [/^\+?[0-9\s-]{7,15}$/, 'phone is invalid'],
    },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
