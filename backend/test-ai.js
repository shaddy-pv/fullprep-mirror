import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve("backend", ".env") });

// Assuming there's a user in the database, I need their ID and a session ID.
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
  const Session = mongoose.model("Session", new mongoose.Schema({}, { strict: false }));
  
  const user = await User.findOne();
  let session = await Session.findOne({ user: user._id });
  if (!session) {
      session = await Session.create({ user: user._id, device: "Test", ip: "127.0.0.1", lastActive: new Date() });
  }

  const token = jwt.sign(
    { id: user._id.toString(), sessionId: session._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d", issuer: "fullprep.io", audience: "fullprep-client" }
  );

  const res = await fetch("http://localhost:5000/api/ai/chat/general", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ text: "Hello" })
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
  process.exit(0);
}
run();
