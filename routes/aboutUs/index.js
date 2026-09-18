import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createAboutUs,
  getAboutUs,
  updateAboutUs,
  deleteAboutUs,
  restoreAboutUs
} from "../../controllers/aboutUs/index.js";


const router = express.Router();


// ======================================================
// ADMIN AUTHENTICATION
// ======================================================

router.use(
  authMiddleware,
  adminMiddleware
);


// ======================================================
// CREATE
// ======================================================

router.post(
  "/create",
  createAboutUs
);


// ======================================================
// GET
//
// All:
// GET /api/about-us/get
//
// Single:
// GET /api/about-us/get?id=ABOUT_US_ID
// ======================================================

router.get(
  "/get",
  getAboutUs
);


// ======================================================
// UPDATE
// ======================================================

router.put(
  "/:id",
  updateAboutUs
);


// ======================================================
// SOFT DELETE
// ======================================================

router.delete(
  "/:id",
  deleteAboutUs
);


// ======================================================
// RESTORE
// ======================================================

router.patch(
  "/:id/restore",
  restoreAboutUs
);


export default router;