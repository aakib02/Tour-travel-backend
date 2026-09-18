import express from "express";

import {
  createCountry,
  getCountries,
  updateCountry,
  deleteCountry,
} from "../../controllers/country/index.js";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

const router = express.Router();


// ================================================================
// ADMIN COUNTRY ROUTES
// ================================================================

// Create
router.post("/create",authMiddleware,adminMiddleware,createCountry);

// Get all (Public)
router.get(
  "/get",
  getCountries
);


// Update
router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateCountry
);

// Soft delete
router.delete(
  "delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteCountry
);

export default router;