import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDb } from "./config/db.js";
import { seedDemoData } from "./utils/seedData.js";

dotenv.config();

async function seed() {
  await connectDb();
  await seedDemoData({ reset: true });
  console.log("Seed complete");
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
