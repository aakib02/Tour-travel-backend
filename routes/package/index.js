import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createPackage,
  getPackages,
  updatePackage,
  deletePackage,
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


export default router;