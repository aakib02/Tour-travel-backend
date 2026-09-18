import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import adminMiddleware from "../../middleware/adminMiddleware.js";

import {
  getPageConfig,
  createPageConfig,
  updatePageSections,
} from "../../controllers/pageConfig/index.js";

const router = express.Router();


// Public
router.get("/get/:page", getPageConfig);


// Admin
router.use(authMiddleware, adminMiddleware);

router.post("/create", createPageConfig);

router.patch(
  "/update/:page/sections",
  updatePageSections
);

export default router;