import mongoose from "mongoose";
import { config } from "../../../config";
import { ensureIndexes } from "../initIndexes";

mongoose.set("strictQuery", false);

const dbUrl = config.MONGODB_URL

export const ConnectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Database successfully connected");

    // Ensure required indexes are present and clean up any legacy index artifacts.
    await ensureIndexes();
  } catch (error: any) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};