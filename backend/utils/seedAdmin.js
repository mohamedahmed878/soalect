// Run with: npm run seed:admin
// Creates the admin account from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD
// in .env, or promotes it to role "admin" if that email is already
// registered as a regular customer. This is how you get the "لوحة
// التحكم" link to show up for that account and let it log into the
// admin dashboard.

import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

async function run() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("❌ Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.");
    process.exit(1);
  }

  await connectDB();

  let user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (user) {
    user.role = "admin";
    await user.save();
    console.log(`✅ Promoted existing user ${user.email} to admin.`);
  } else {
    user = await User.create({
      name: ADMIN_NAME || "Admin",
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`✅ Created admin account: ${user.email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
