import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";

import {
  createActivity,
  getActivities,
  updateActivity,
  deleteActivity,
} from "../../controllers/activity/index.js";

import {
  downloadActivityTemplate,
  bulkUploadActivitiesFromExcel,
} from "../../controllers/activity/excelUpload.js";


const router = express.Router();


// ================================================================
// EXCEL / CSV TEMPLATE & BULK UPLOAD
// ================================================================

router.get(
  "/template/excel",
  downloadActivityTemplate
);

router.get(
  "/template",
  downloadActivityTemplate
);

router.post(
  "/bulk-upload",
  authMiddleware,
  adminMiddleware,
  upload.single("file"),
  bulkUploadActivitiesFromExcel
);


// ================================================================
// CREATE
// ================================================================

router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createActivity
);


// ================================================================
// GET ALL / SINGLE
// ================================================================

router.get(
  "/get",
  getActivities
);

router.get(
  "/get/:id",
  (req, res, next) => {
    req.query.id = req.params.id;
    next();
  },
  getActivities
);

router.get(
  "/:id",
  (req, res, next) => {
    req.query.id = req.params.id;
    next();
  },
  getActivities
);


// ================================================================
// UPDATE
// ================================================================

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateActivity
);


// ================================================================
// DELETE
// ================================================================

router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteActivity
);


export default router;