import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "../models/user/index.js";
import { dbConnection } from "../config/database.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // ============================================================
    // DATABASE CONNECTION
    // ============================================================

    await dbConnection();

    console.log("MongoDB connected");


    // ============================================================
    // ADMIN CREDENTIALS
    // ============================================================

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD are required in .env"
      );
    }


    // ============================================================
    // CHECK EXISTING ADMIN
    // ============================================================

    const existingAdmin = await User.findOne({
      email: adminEmail.toLowerCase(),
      role: "admin",
    });

    if (existingAdmin) {
      console.log("Admin already exists");

      await mongoose.connection.close();

      process.exit(0);
    }


    // ============================================================
    // PASSWORD HASH
    // ============================================================

    const hashedPassword = await bcrypt.hash(
      adminPassword,
      12
    );


    // ============================================================
    // CREATE ADMIN
    // ============================================================

    const admin = await User.create({
      name: process.env.ADMIN_NAME || "Administrator",

      email: adminEmail.toLowerCase(),

      password: hashedPassword,

      role: "admin",

      isActive: true,
    });


    // ============================================================
    // SUCCESS
    // ============================================================

    console.log("========================================");
    console.log("Admin created successfully");
    console.log("========================================");
    console.log(`Admin ID : ${admin._id}`);
    console.log(`Email    : ${admin.email}`);
    console.log("Role     : admin");
    console.log("========================================");


    await mongoose.connection.close();

    process.exit(0);

  } catch (error) {
    console.error("Admin seed failed:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};


// ================================================================
// RUN SEED
// ================================================================

seedAdmin();