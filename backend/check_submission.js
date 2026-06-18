import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const Submission = (await import('./src/models/Submission.js')).default;
  const sub = await Submission.findOne().sort({ createdAt: -1 }).lean();
  console.log(JSON.stringify(sub, null, 2));
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
