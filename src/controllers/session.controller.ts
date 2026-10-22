import { Request, Response } from 'express';
import { Session } from '../models/Session';
import { Teacher } from '../models/Teacher';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

const parseDate = (value: unknown, field: string): Date => {
  if (value === undefined || value === null || value === '') {
    throw new ApiError(400, `${field} is required`);
  }
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) throw new ApiError(400, `${field} must be a valid date`);
  return date;
};

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const { teacherId, startTime, endTime } = req.body ?? {};
  if (!teacherId) throw new ApiError(400, 'teacherId is required');

  const start = parseDate(startTime, 'startTime');
  const end = parseDate(endTime, 'endTime');
  if (end <= start) throw new ApiError(400, 'endTime must be greater than startTime');

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw new ApiError(404, 'Teacher not found');

  const session = await Session.create({ teacherId, startTime: start, endTime: end });
  res.status(201).json({ success: true, data: session });
});

// Days are computed in UTC: [00:00:00.000Z, 23:59:59.999Z] of the day containing dateTimestamp.
export const getAvailableSessions = asyncHandler(async (req: Request, res: Response) => {
  const raw = req.query.dateTimestamp;
  if (typeof raw !== 'string' || raw.trim() === '' || !/^-?\d+$/.test(raw.trim())) {
    throw new ApiError(400, 'dateTimestamp is required and must be a Unix timestamp in milliseconds');
  }
  const ts = Number(raw);
  if (!Number.isSafeInteger(ts) || Number.isNaN(new Date(ts).getTime())) {
    throw new ApiError(400, 'dateTimestamp is not a valid timestamp');
  }

  const d = new Date(ts);
  const dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

  const sessions = await Session.aggregate([
    { $match: { status: 'AVAILABLE', startTime: { $gte: dayStart, $lte: dayEnd } } },
    { $lookup: { from: 'teachers', localField: 'teacherId', foreignField: '_id', as: 'teacher' } },
    { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
    { $sort: { startTime: 1 } },
  ]);

  res.json({ success: true, data: sessions });
});

export const bookSession = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body ?? {};
  if (!userId) throw new ApiError(400, 'userId is required');

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  // Atomic: only one concurrent request can flip AVAILABLE -> BOOKED.
  const booked = await Session.findOneAndUpdate(
    { _id: req.params.id, status: 'AVAILABLE' },
    { status: 'BOOKED', userId: user._id },
    { new: true }
  );

  if (!booked) {
    const exists = await Session.exists({ _id: req.params.id });
    if (!exists) throw new ApiError(404, 'Session not found');
    throw new ApiError(409, 'Session is not available');
  }

  res.json({ success: true, data: booked });
});

export const completeSession = asyncHandler(async (req: Request, res: Response) => {
  const completed = await Session.findOneAndUpdate(
    { _id: req.params.id, status: 'BOOKED' },
    { status: 'COMPLETED', completedAt: new Date() },
    { new: true }
  );

  if (!completed) {
    const exists = await Session.exists({ _id: req.params.id });
    if (!exists) throw new ApiError(404, 'Session not found');
    throw new ApiError(409, 'Only BOOKED sessions can be completed');
  }

  res.json({ success: true, data: completed });
});
