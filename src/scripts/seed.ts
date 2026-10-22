import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Teacher } from '../models/Teacher';

const teachers = [
  { fullName: 'Asha Verma', email: 'asha.verma@example.com', specialization: 'Mathematics', experience: 8 },
  { fullName: 'Rohan Mehta', email: 'rohan.mehta@example.com', specialization: 'Physics', experience: 5 },
  { fullName: 'Priya Nair', email: 'priya.nair@example.com', specialization: 'English', experience: 10 },
];

const seed = async (): Promise<void> => {
  await connectDB();
  for (const t of teachers) {
    await Teacher.updateOne({ email: t.email }, { $setOnInsert: t }, { upsert: true });
  }
  const all = await Teacher.find().lean();
  console.log('Teachers available:');
  all.forEach((t) => console.log(`${t._id}  ${t.fullName} (${t.specialization})`));
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
