import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDb } from "./config/db.js";

dotenv.config();

const port = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(port, () => console.log(`API listening on port ${port}`));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
