import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createCustomizePackage,
  getCustomizePackages,
  updateCustomizePackage,
  updateCustomizePackageStatus,
  deleteCustomizePackage,
} from "../../controllers/customizePackage/index.js";


const router = express.Router();


// ================================================================
// CUSTOMER
// ================================================================

// Customer can submit customization request
router.post(
  "/create",
  createCustomizePackage
);


// ================================================================
// ADMIN
// ================================================================

// Get all / single customization requests
router.get(
  "/get",
  authMiddleware,
  adminMiddleware,
  getCustomizePackages
);


// Update complete customization request
router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateCustomizePackage
);


// Update only status
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateCustomizePackageStatus
);


// Soft delete
router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteCustomizePackage
);


export default router;