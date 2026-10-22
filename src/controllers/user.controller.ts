import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, phone } = req.body ?? {};
  const user = await User.create({ fullName, email, phone });
  res.status(201).json({ success: true, data: user });
});

export const getUserSessions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, `Invalid id: ${id}`);

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');

  const [result] = await Session.aggregate([
    { $match: { userId: user._id } },
    { $lookup: { from: 'teachers', localField: 'teacherId', foreignField: '_id', as: 'teacher' } },
    { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
    {
      $facet: {
        upcomingSessions: [{ $match: { status: 'BOOKED' } }, { $sort: { startTime: 1 } }],
        completedSessions: [{ $match: { status: 'COMPLETED' } }, { $sort: { completedAt: -1 } }],
      },
    },
  ]);

  res.json({
    success: true,
    data: { upcomingSessions: result.upcomingSessions, completedSessions: result.completedSessions },
  });
});
