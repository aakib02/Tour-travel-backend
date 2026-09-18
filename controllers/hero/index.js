import mongoose from "mongoose";
import Hero from "../../models/hero/index.js";
import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES
} from "../../helpers/response.js";
import {
  sendResponse,
  sendError
} from "../../helpers/responseHelper.js";


// ======================================================
// CREATE HERO
// ======================================================

export const createHero = async (req, res) => {
  try {
    const {
      name,
      slides = [],
      showcase = [],
      trustCard = {},
      settings = {}
    } = req.body;

    if (!name?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Hero name is required"
      );
    }

    if (!Array.isArray(slides) || slides.length === 0) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "At least one hero slide is required"
      );
    }

    // Validate slide order
    const slideOrders = slides.map((slide) => slide.order);

    if (new Set(slideOrders).size !== slideOrders.length) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Hero slide order must be unique"
      );
    }

    // Validate showcase order
    if (Array.isArray(showcase) && showcase.length > 0) {
      const showcaseOrders = showcase.map((item) => item.order);

      if (new Set(showcaseOrders).size !== showcaseOrders.length) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Showcase order must be unique"
        );
      }
    }

    const hero = await Hero.create({
      name: name.trim(),
      slides,
      showcase,
      trustCard,
      settings,
      isActive: true,
      deletedAt: null,
      createdBy: req.admin?._id || req.user?.id || null,
      updatedBy: req.admin?._id || req.user?.id || null
    });

    return sendResponse(
      res,
      HTTP_STATUS_CODES.CREATED,
      "Hero created successfully",
      hero
    );

  } catch (error) {
    console.error("Create Hero Error:", error);

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ======================================================
// GET HERO
// GET ALL + GET BY ID USING SAME API
//
// GET /api/hero/get
// GET /api/hero/get?id=xxxxx
// ======================================================

export const getHero = async (req, res) => {
  try {
    const {
      id,
      status,
      isActive,
      search,
      page = 1,
      limit = 10,
      sort = "-createdAt"
    } = req.query;

    // --------------------------------------------------
    // GET SINGLE HERO BY ID
    // --------------------------------------------------

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid hero ID"
        );
      }

      const hero = await Hero.findOne({
        _id: id,
        isActive: true
      })
        .populate("slides.image.mediaId")
        .populate("slides.thumbnail.mediaId")
        .populate("showcase.image.mediaId")
        .populate("trustCard.avatars.mediaId")
        .lean();

      if (!hero) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          "Hero not found"
        );
      }

      return sendResponse(
        res,
        HTTP_STATUS_CODES.OK,
        "Hero fetched successfully",
        hero
      );
    }

    // --------------------------------------------------
    // GET ALL HEROES
    // --------------------------------------------------

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (currentPage - 1) * perPage;

    const query = {};

    // Active filter
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }



    // Search
    if (search?.trim()) {
      query.name = {
        $regex: search.trim(),
        $options: "i"
      };
    }

    const [heroes, total] = await Promise.all([
      Hero.find(query)
        .populate("slides.image.mediaId")
        .populate("slides.thumbnail.mediaId")
        .populate("showcase.image.mediaId")
        .populate("trustCard.avatars.mediaId")
        .sort(sort)
        .skip(skip)
        .limit(perPage)
        .lean(),

      Hero.countDocuments(query)
    ]);

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.HERO?.FETCHED || "Heroes fetched successfully",
      {
        heroes,
        pagination: {
          total,
          page: currentPage,
          limit: perPage,
          totalPages: Math.ceil(total / perPage),
          hasNextPage: currentPage < Math.ceil(total / perPage),
          hasPreviousPage: currentPage > 1
        }
      }
    );

  } catch (error) {
    console.error("Get Hero Error:", error);

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ======================================================
// UPDATE HERO
// ======================================================

export const updateHero = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid hero ID"
      );
    }

    const allowedFields = [
      "name",
      "slides",
      "showcase",
      "trustCard",
      "settings",
      "isActive"
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "No valid fields provided for update"
      );
    }

    updateData.updatedBy =
      req.admin?._id ||
      req.user?.id ||
      null;

    const hero = await Hero.findOneAndUpdate(
      {
        _id: id,
        isActive: true
      },
      {
        $set: updateData
      },
      {
        new: true,
        runValidators: true
      }
    )
      .populate("slides.image.mediaId")
      .populate("slides.thumbnail.mediaId")
      .populate("showcase.image.mediaId")
      .populate("trustCard.avatars.mediaId");

    if (!hero) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "Hero not found"
      );
    }

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Hero updated successfully",
      hero
    );

  } catch (error) {
    console.error("Update Hero Error:", error);

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ======================================================
// DELETE HERO - SOFT DELETE
// ======================================================

export const deleteHero = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid hero ID"
      );
    }

    const hero = await Hero.findOneAndUpdate(
      {
        _id: id,
        isActive: true
      },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
          updatedBy:
            req.admin?._id ||
            req.user?.id ||
            null
        }
      },
      {
        new: true
      }
    );

    if (!hero) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "Hero not found"
      );
    }

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Hero deleted successfully",
      hero
    );

  } catch (error) {
    console.error("Delete Hero Error:", error);

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ======================================================
// RESTORE HERO
// ======================================================

export const restoreHero = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid hero ID"
      );
    }

    const hero = await Hero.findOneAndUpdate(
      {
        _id: id,
        isActive: false
      },
      {
        $set: {
          isActive: true,
          deletedAt: null,
          updatedBy:
            req.admin?._id ||
            req.user?.id ||
            null
        }
      },
      {
        new: true
      }
    );

    if (!hero) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "Hero not found"
      );
    }

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Hero restored successfully",
      hero
    );

  } catch (error) {
    console.error("Restore Hero Error:", error);

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};