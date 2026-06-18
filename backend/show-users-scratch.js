import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://fullprep_admin:BNI3lXxFlJGvSuSK@fullprep-cluster.jxufhqt.mongodb.net/fullprep?appName=FullPrep-Cluster';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Define a simple user schema
    const UserSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', UserSchema, 'users');
    
    const users = await User.find({});
    console.log('--- ALL USERS ---');
    users.forEach(u => {
      console.log(`ID: ${u._id}, Name: "${u.name}", Email: "${u.email}", Username: "${u.username}", BackupEmail: "${u.backupEmail}"`);
    });
    console.log('-----------------');
  } catch (err) {
    console.error('Error connecting or querying:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
