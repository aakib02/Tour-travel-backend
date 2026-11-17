import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";
import upload from "../../middleware/uploadMiddleware.js";

import {
  createHotel,
  getHotels,
  updateHotel,
  deleteHotel,
} from "../../controllers/hotel/index.js";

import {
  downloadHotelTemplate,
  bulkUploadHotelsFromExcel,
} from "../../controllers/hotel/excelUpload.js";


const router = express.Router();


// ================================================================
// EXCEL / CSV TEMPLATE & BULK UPLOAD
// ================================================================

router.get(
  "/template/excel",
  downloadHotelTemplate
);

router.get(
  "/template",
  downloadHotelTemplate
);

router.post(
  "/bulk-upload",
  authMiddleware,
  adminMiddleware,
  upload.single("file"),
  bulkUploadHotelsFromExcel
);


// CREATE
router.post(
  "/create",
  authMiddleware,
  adminMiddleware,
  createHotel
);


// GET ALL / SINGLE
router.get(
  "/get",
  getHotels
);

router.get(
  "/get/:id",
  getHotels
);

router.get(
  "/:id",
  getHotels
);


// UPDATE
router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateHotel
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateHotel
);


// DELETE
router.delete(
  "/delete/:id",
  authMiddleware,
  adminMiddleware,
  deleteHotel
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteHotel
);


export default router;