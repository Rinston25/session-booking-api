import { Request, Response } from 'express';
import { Teacher } from '../models/Teacher';
import { asyncHandler } from '../utils/asyncHandler';

export const createTeacher = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, specialization, experience } = req.body ?? {};
  const teacher = await Teacher.create({ fullName, email, specialization, experience });
  res.status(201).json({ success: true, data: teacher });
});
