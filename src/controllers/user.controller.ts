import { Request, Response } from 'express';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, phone } = req.body ?? {};
  const user = await User.create({ fullName, email, phone });
  res.status(201).json({ success: true, data: user });
});
