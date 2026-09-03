import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const options = {
  serverSelectionTimeoutMS: 50000,
  socketTimeoutMS: 100000,
  maxPoolSize: 10,
  readPreference: "primaryPreferred",
};


// ================================================================
// DATABASE CONNECTION
// ================================================================

export const dbConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2) {
      return mongoose.connection.asPromise();
    }

    const connection = await mongoose.connect(
      process.env.MONGODB_URI,
      options
    );

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );

    return connection.connection;

  } catch (error) {
    console.error(
      "MongoDB connection error:",
      error.message
    );

    throw error;
  }
};


// ================================================================
// CLOSE DATABASE CONNECTION
// ================================================================

export const closeDbConnection = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    }
  } catch (error) {
    console.error(
      "MongoDB close connection error:",
      error.message
    );
  }
};