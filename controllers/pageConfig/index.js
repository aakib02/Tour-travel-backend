import PageConfig from "../../models/pageConfig/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";

import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";


// --------------------------------------------------
// Validation Helper
// --------------------------------------------------

const validateSections = (sections) => {

  if (!Array.isArray(sections) || sections.length === 0) {
    return RESPONSE_MESSAGES.PAGE_CONFIG.INVALID_SECTION;
  }

  // Check section structure
  for (const section of sections) {

    if (!section?.key || typeof section.key !== "string") {
      return RESPONSE_MESSAGES.PAGE_CONFIG.INVALID_SECTION;
    }

    if (
      !Number.isInteger(section.order) ||
      section.order < 1
    ) {
      return RESPONSE_MESSAGES.PAGE_CONFIG.INVALID_ORDER;
    }

    if (
      section.isActive !== undefined &&
      typeof section.isActive !== "boolean"
    ) {
      return RESPONSE_MESSAGES.PAGE_CONFIG.INVALID_SECTION;
    }
  }

  // Duplicate section key check
  const keys = sections.map((section) => section.key);

  const uniqueKeys = new Set(keys);

  if (uniqueKeys.size !== keys.length) {
    return RESPONSE_MESSAGES.PAGE_CONFIG.DUPLICATE_SECTION;
  }

  // Duplicate order check
  const orders = sections.map((section) => section.order);

  const uniqueOrders = new Set(orders);

  if (uniqueOrders.size !== orders.length) {
    return RESPONSE_MESSAGES.PAGE_CONFIG.INVALID_ORDER;
  }

  // Order must be sequential
  const sortedOrders = [...orders].sort((a, b) => a - b);

  for (let index = 0; index < sortedOrders.length; index++) {

    if (sortedOrders[index] !== index + 1) {
      return RESPONSE_MESSAGES.PAGE_CONFIG.INVALID_ORDER;
    }
  }

  return null;
};


// --------------------------------------------------
// Get Page Configuration
// --------------------------------------------------

export const getPageConfig = async (req, res) => {

  try {

    const page = req.params.page?.trim().toLowerCase();

    if (!page) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.PAGE_CONFIG.INVALID_PAGE
      );
    }

    const pageConfig = await PageConfig.findOne({
      page,
      isActive: true,
    }).lean();

    if (!pageConfig) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.PAGE_CONFIG.NOT_FOUND
      );
    }

    pageConfig.sections.sort(
      (a, b) => a.order - b.order
    );

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.PAGE_CONFIG.FETCHED,
      pageConfig
    );

  } catch (error) {

    console.error("getPageConfig error:", error);

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Failed to fetch page configuration"
    );
  }
};


// --------------------------------------------------
// Create Page Configuration
// --------------------------------------------------

export const createPageConfig = async (req, res) => {

  try {

    const page = req.body.page?.trim().toLowerCase();
    const { sections } = req.body;

    if (!page) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.PAGE_CONFIG.INVALID_PAGE
      );
    }

    const validationError = validateSections(sections);

    if (validationError) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        validationError
      );
    }

    const existingConfig = await PageConfig.findOne({
      page,
    });

    if (existingConfig) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.PAGE_CONFIG.CREATED
      );
    }

    const pageConfig = await PageConfig.create({
      page,
      sections,
      createdBy: req.user?.id || null,
      updatedBy: req.user?.id || null,
    });

    return sendResponse(
      res,
      HTTP_STATUS_CODES.CREATED,
      RESPONSE_MESSAGES.PAGE_CONFIG.CREATED,
      pageConfig
    );

  } catch (error) {

    console.error("createPageConfig error:", error);

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Failed to create page configuration"
    );
  }
};


// --------------------------------------------------
// Update Sections
// --------------------------------------------------

export const updatePageSections = async (req, res) => {

  try {

    const page = req.params.page?.trim().toLowerCase();
    const { sections } = req.body;

    if (!page) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.PAGE_CONFIG.INVALID_PAGE
      );
    }

    const validationError = validateSections(sections);

    if (validationError) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        validationError
      );
    }

    const pageConfig = await PageConfig.findOne({
      page,
    });

    if (!pageConfig) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.PAGE_CONFIG.NOT_FOUND
      );
    }

    pageConfig.sections = sections;
    pageConfig.updatedBy = req.user?.id || null;

    await pageConfig.save();

    pageConfig.sections.sort(
      (a, b) => a.order - b.order
    );

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.PAGE_CONFIG.UPDATED,
      pageConfig
    );

  } catch (error) {

    console.error("updatePageSections error:", error);

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Failed to update page sections"
    );
  }
};