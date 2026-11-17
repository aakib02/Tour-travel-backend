import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";

import {
  createAttraction,
  getAttractions,
  updateAttraction,
  deleteAttraction,
} from "../../controllers/attraction/index.js";

import {
  downloadAttractionTemplate,
  bulkUploadAttractionsFromExcel,
} from "../../controllers/attraction/excelUpload.js";


const router = express.Router();


// ================================================================
// EXCEL / CSV TEMPLATE & BULK UPLOAD
// ================================================================

router.get(
  "/template/excel",
  downloadAttractionTemplate
);

router.get(
  "/template",
  downloadAttractionTemplate
);

router.post(
  "/bulk-upload",
  authMiddleware,
  adminMiddleware,
  upload.single("file"),
  bulkUploadAttractionsFromExcel
);


// ================================================================
// CREATE
// ================================================================

router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createAttraction
);


// ================================================================
// GET ALL / SINGLE
// ================================================================

router.get(
  "/get",
  getAttractions
);

router.get(
  "/get/:id",
  (req, res, next) => {
    req.query.id = req.params.id;
    next();
  },
  getAttractions
);

router.get(
  "/:id",
  (req, res, next) => {
    req.query.id = req.params.id;
    next();
  },
  getAttractions
);


// ================================================================
// UPDATE
// ================================================================

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateAttraction
);


// ================================================================
// DELETE
// ================================================================

router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteAttraction
);


export default router;