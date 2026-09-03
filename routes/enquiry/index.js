import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  createEnquiry,
  getEnquiries,
  updateEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
} from "../../controllers/enquiry/index.js";


const router = express.Router();


// ================================================================
// PUBLIC — CUSTOMER CREATES ENQUIRY
// ================================================================

router.post(
  "/create",
  createEnquiry
);


// ================================================================
// ADMIN — GET ALL / SINGLE
// ================================================================

router.get(
  "/get",
  authMiddleware,
  adminMiddleware,
  getEnquiries
);


// ================================================================
// ADMIN — UPDATE
// ================================================================

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateEnquiry
);


// ================================================================
// ADMIN — STATUS ONLY
// ================================================================

router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  updateEnquiryStatus
);


// ================================================================
// ADMIN — SOFT DELETE
// ================================================================

router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteEnquiry
);


export default router;