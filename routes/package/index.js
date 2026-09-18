import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createPackage,
  getPackages,
  updatePackage,
  updatePackageStatus,
  deletePackage,
  hardDeletePackage,
} from "../../controllers/package/index.js";


const router = express.Router();


// ================================================================
// CREATE
// ================================================================

router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createPackage
);


// ================================================================
// GET ALL / SINGLE
// ================================================================

router.get(
  "/get",
  getPackages
);

router.get(
  "/get/:id",
  (req, res, next) => {
    req.query.id = req.params.id;
    next();
  },
  getPackages
);

router.get(
  "/:id",
  (req, res, next) => {
    req.query.id = req.params.id;
    next();
  },
  getPackages
);


// ================================================================
// UPDATE
// ================================================================

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updatePackage
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updatePackage
);


// ================================================================
// UPDATE STATUS (ACTIVE / INACTIVE & STATUS)
// ================================================================

router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updatePackageStatus
);

router.patch(
  "/status/:id",
  authMiddleware,
  adminMiddleware,
  updatePackageStatus
);


// ================================================================
// DELETE — SOFT DELETE
// ================================================================

router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deletePackage
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deletePackage
);


// ================================================================
// DELETE — HARD DELETE (PERMANENT)
// ================================================================

router.delete(
  "/hard-delete/:id",
  authMiddleware,
  adminMiddleware,
  hardDeletePackage
);

router.delete(
  "/:id/hard-delete",
  authMiddleware,
  adminMiddleware,
  hardDeletePackage
);


export default router;