import dotenv from "dotenv";
dotenv.config();

import connectDB from "../src/config/db.js";
import mongoose from "mongoose";
import { fetchAcceptedConnections } from "../src/services/request.service.js";

const run = async () => {
  try {
    await connectDB();
    const userId = new mongoose.Types.ObjectId("68eea2c4f160589c17c12e53");
    const result = await fetchAcceptedConnections(userId);
    console.log("Result:", JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Test error:", err);
    process.exit(1);
  }
};

run();
