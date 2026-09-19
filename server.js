import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import dotenv from "dotenv";
import helmet from "helmet";
import { Server } from "socket.io";
// import { Redis } from "ioredis";
import { dbConnection } from "./config/database.js";
// import project from './routes/project/index.js';
import bodyParser from "body-parser";
// import admin from "firebase-admin";

import adminAuthRoutes from "./routes/user/authRoutes.js";
import Country from "./routes/country/index.js";
import State from "./routes/state/index.js";
import City from "./routes/city/index.js";
import Attraction from "./routes/attraction/index.js";
import Activity from "./routes/activity/index.js";
import Vehicle from "./routes/vehicle/index.js";
import Hotel from "./routes/hotel/index.js";
import Enquiry from "./routes/enquiry/index.js";
import Package from "./routes/package/index.js";
import customizePackage from "./routes/customizePackage/index.js";
import Media from "./routes/media/index.js";
import Hero from "./routes/hero/index.js";
import AboutUs from "./routes/aboutUs/index.js";
import PageConfig from "./routes/pageConfig/index.js";


// Load environment variables
dotenv.config();

// 🔽 Express + HTTP server
const app = express();
const server = http.createServer(app);

// save


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://tour-travel-backend-uk0s.onrender.com",
  "https://admin-indiabycaranddriver-eight.vercel.app",
  "https://indiabycaranddriver-umber.vercel.app",
  "https://indiabycaranddriver.com",
  "https://www.indiabycaranddriver.com",
];

const isOriginAllowed = (origin) => {
  // Allow requests with no origin (e.g. mobile apps, curl, server-side fetch, direct browser navigation)
  if (!origin) return true;

  // Allow explicit whitelist
  if (allowedOrigins.includes(origin)) return true;

  // Allow all Vercel deployment preview and production URLs (*.vercel.app)
  if (origin.endsWith(".vercel.app")) return true;

  // Allow custom domain variations
  if (origin.includes("indiabycaranddriver")) return true;

  return false;
};

// 1. CORS Middleware (Must run before other middlewares and helmet)
app.use(
  cors({
    origin: function (origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "enabled",
      "X-Custom-Header",
      "Accept",
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// 2. Security Headers (Allow cross-origin resource sharing)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);




app.use(bodyParser.json({ limit: '500mb' }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

// 🔽 Socket.IO setup
export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
  },
});

// Make io global (for services like createEvent)
global.io = io;

// 🔽 Socket Events
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`User joined room: ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});



app.use("/api/user/auth",adminAuthRoutes);
app.use("/api/country",Country);
app.use("/api/state",State);
app.use("/api/city",City);
app.use("/api/attraction",Attraction);
app.use("/api/activity",Activity);
app.use("/api/vehicle",Vehicle);
app.use("/api/hotel",Hotel);
app.use("/api/enquiry",Enquiry);
app.use("/api/package",Package);
app.use("/api/customizePackage",customizePackage);
app.use("/api/media",Media);
app.use("/api/hero",Hero);
app.use("/api/about-us", AboutUs);
app.use("/api/page-config", PageConfig);


// Start server and connect to database
const PORT = process.env.PORT || 6500;
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  try {
    await dbConnection();
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
  }
});


// Server ready
