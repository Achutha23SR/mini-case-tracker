import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { seedDemoData } from "./utils/seedData.js";

dotenv.config();

const port = process.env.PORT || 5000;

connectDb()
  .then(async () => {
    if (process.env.SEED_ON_START === "true") {
      const result = await seedDemoData({ reset: false });
      console.log(result.skipped ? "Seed skipped: demo users already exist" : "Seed complete");
    }

    app.listen(port, () => console.log(`API listening on port ${port}`));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
