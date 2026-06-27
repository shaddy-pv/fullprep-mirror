import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error("Please provide the email of the user to promote.");
  console.error("Usage: node makeAdmin.js your-email@example.com");
  process.exit(1);
}

async function promote() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );
    
    if (user) {
      console.log(`\n✅ Success! User ${email} has been promoted to ADMIN.`);
      console.log(`You can now log into the Admin Panel with this account.\n`);
    } else {
      console.log(`\n❌ Error: User with email ${email} not found in the database.`);
      console.log(`Make sure you have already registered this account on the main website.\n`);
    }
  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    process.exit();
  }
}

promote();
