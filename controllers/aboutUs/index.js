import mongoose from "mongoose";

import AboutUs from "../../models/aboutUs/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES
} from "../../helpers/response.js";

import {
  sendResponse,
  sendError
} from "../../helpers/responseHelper.js";


// ======================================================
// CREATE ABOUT US
// ======================================================

export const createAboutUs = async (req, res) => {
  try {
    const {
      hero = {},
      introduction = {},
      story = {},
      stats = {},
      timeline = {},
      offices = {},
      cta = {}
    } = req.body;

    // -----------------------------------------------
    // Check if active About Us already exists
    // -----------------------------------------------

    const existingAboutUs = await AboutUs.findOne({
      isActive: true,
      deletedAt: null
    }).lean();

    if (existingAboutUs) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        "Active About Us content already exists"
      );
    }

    // -----------------------------------------------
    // Validate timeline order
    // -----------------------------------------------

    if (
      timeline.milestones &&
      Array.isArray(timeline.milestones)
    ) {
      const orders = timeline.milestones.map(
        (item) => item.order
      );

      if (new Set(orders).size !== orders.length) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Timeline milestone order must be unique"
        );
      }
    }

    // -----------------------------------------------
    // Validate feature order
    // -----------------------------------------------

    if (
      introduction.features &&
      Array.isArray(introduction.features)
    ) {
      const orders = introduction.features.map(
        (item) => item.order
      );

      if (new Set(orders).size !== orders.length) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Introduction feature order must be unique"
        );
      }
    }

    // -----------------------------------------------
    // Validate office order
    // -----------------------------------------------

    if (
      offices.items &&
      Array.isArray(offices.items)
    ) {
      const orders = offices.items.map(
        (item) => item.order
      );

      if (new Set(orders).size !== orders.length) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Office order must be unique"
        );
      }
    }

    // -----------------------------------------------
    // Create
    // -----------------------------------------------

    const aboutUs = await AboutUs.create({
      hero,
      introduction,
      story,
      stats,
      timeline,
      offices,
      cta,

      isActive: true,
      deletedAt: null,

      createdBy:
        req.admin?._id ||
        req.user?.id ||
        null,

      updatedBy:
        req.admin?._id ||
        req.user?.id ||
        null
    });

    return sendResponse(
      res,
      HTTP_STATUS_CODES.CREATED,
      RESPONSE_MESSAGES.ABOUT_US.CREATED,
      aboutUs
    );

  } catch (error) {
    console.error("Create About Us Error:", error);

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ======================================================
// GET ABOUT US
//
// GET /api/about-us/get
// GET /api/about-us/get?id=ABOUT_US_ID
// ======================================================

export const getAboutUs = async (req, res) => {
  try {
    const {
      id,
      isActive,
      search,
      page = 1,
      limit = 10,
      sort = "-createdAt"
    } = req.query;


    // ==================================================
    // GET SINGLE BY ID
    // ==================================================

    if (id) {

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          RESPONSE_MESSAGES.ABOUT_US.INVALID_ID
        );
      }

      const aboutUs = await AboutUs.findOne({
        _id: id,
        isActive: true,
        deletedAt: null
      })
        .populate("hero.image.mediaId")
        .populate("introduction.image.mediaId")
        .populate("story.mainImage.mediaId")
        .populate("story.sideImages.mediaId")
        .populate("offices.items.image.mediaId")
        .lean();

      if (!aboutUs) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.ABOUT_US.NOT_FOUND
        );
      }

      return sendResponse(
        res,
        HTTP_STATUS_CODES.OK,
        RESPONSE_MESSAGES.ABOUT_US.FETCHED_SINGLE,
        aboutUs
      );
    }


    // ==================================================
    // GET ALL
    // ==================================================

    const currentPage = Math.max(
      Number(page) || 1,
      1
    );

    const perPage = Math.min(
      Math.max(Number(limit) || 10, 1),
      100
    );

    const skip =
      (currentPage - 1) * perPage;


    // ==================================================
    // QUERY
    // ==================================================

    const query = {};


    // Active filter

    if (isActive !== undefined) {
      query.isActive =
        isActive === "true";
    }


    // Search

    if (search?.trim()) {
      query.$or = [
        {
          "hero.title": {
            $regex: search.trim(),
            $options: "i"
          }
        },
        {
          "introduction.title": {
            $regex: search.trim(),
            $options: "i"
          }
        },
        {
          "story.title": {
            $regex: search.trim(),
            $options: "i"
          }
        }
      ];
    }


    // ==================================================
    // FETCH
    // ==================================================

    const [aboutUs, total] =
      await Promise.all([

        AboutUs.find(query)
          .populate("hero.image.mediaId")
          .populate("introduction.image.mediaId")
          .populate("story.mainImage.mediaId")
          .populate("story.sideImages.mediaId")
          .populate("offices.items.image.mediaId")
          .sort(sort)
          .skip(skip)
          .limit(perPage)
          .lean(),

        AboutUs.countDocuments(query)
      ]);


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ABOUT_US.FETCHED,
      {
        aboutUs,
        pagination: {
          total,
          page: currentPage,
          limit: perPage,
          totalPages: Math.ceil(
            total / perPage
          ),
          hasNextPage:
            currentPage <
            Math.ceil(total / perPage),

          hasPreviousPage:
            currentPage > 1
        }
      }
    );

  } catch (error) {

    console.error(
      "Get About Us Error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ======================================================
// UPDATE ABOUT US
// ======================================================

export const updateAboutUs = async (req, res) => {
  try {

    const { id } = req.params;


    // -----------------------------------------------
    // Validate ID
    // -----------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.ABOUT_US.INVALID_ID
      );
    }


    // -----------------------------------------------
    // Allowed fields
    // -----------------------------------------------

    const allowedFields = [
      "hero",
      "introduction",
      "story",
      "stats",
      "timeline",
      "offices",
      "cta",
      "isActive"
    ];


    const updateData = {};


    allowedFields.forEach((field) => {

      if (
        req.body[field] !== undefined
      ) {
        updateData[field] =
          req.body[field];
      }

    });


    if (
      Object.keys(updateData).length === 0
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "No valid fields provided for update"
      );
    }


    // -----------------------------------------------
    // Validate timeline order
    // -----------------------------------------------

    if (
      updateData.timeline?.milestones &&
      Array.isArray(
        updateData.timeline.milestones
      )
    ) {

      const orders =
        updateData.timeline.milestones.map(
          (item) => item.order
        );

      if (
        new Set(orders).size !==
        orders.length
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Timeline milestone order must be unique"
        );
      }
    }


    // -----------------------------------------------
    // Validate feature order
    // -----------------------------------------------

    if (
      updateData.introduction?.features &&
      Array.isArray(
        updateData.introduction.features
      )
    ) {

      const orders =
        updateData.introduction.features.map(
          (item) => item.order
        );

      if (
        new Set(orders).size !==
        orders.length
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Introduction feature order must be unique"
        );
      }
    }


    // -----------------------------------------------
    // Validate office order
    // -----------------------------------------------

    if (
      updateData.offices?.items &&
      Array.isArray(
        updateData.offices.items
      )
    ) {

      const orders =
        updateData.offices.items.map(
          (item) => item.order
        );

      if (
        new Set(orders).size !==
        orders.length
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Office order must be unique"
        );
      }
    }


    // -----------------------------------------------
    // Audit
    // -----------------------------------------------

    updateData.updatedBy =
      req.admin?._id ||
      req.user?.id ||
      null;


    // -----------------------------------------------
    // Update
    // -----------------------------------------------

    const aboutUs =
      await AboutUs.findOneAndUpdate(
        {
          _id: id,
          isActive: true,
          deletedAt: null
        },

        {
          $set: updateData
        },

        {
          new: true,
          runValidators: true
        }
      )
        .populate("hero.image.mediaId")
        .populate("introduction.image.mediaId")
        .populate("story.mainImage.mediaId")
        .populate("story.sideImages.mediaId")
        .populate("offices.items.image.mediaId");


    if (!aboutUs) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.ABOUT_US.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ABOUT_US.UPDATED,
      aboutUs
    );

  } catch (error) {

    console.error(
      "Update About Us Error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ======================================================
// DELETE ABOUT US
// SOFT DELETE
// ======================================================

export const deleteAboutUs = async (req, res) => {
  try {

    const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.ABOUT_US.INVALID_ID
      );
    }


    const aboutUs =
      await AboutUs.findOneAndUpdate(

        {
          _id: id,
          isActive: true,
          deletedAt: null
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


    if (!aboutUs) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.ABOUT_US.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ABOUT_US.DELETED,
      aboutUs
    );

  } catch (error) {

    console.error(
      "Delete About Us Error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ======================================================
// RESTORE ABOUT US
// ======================================================

export const restoreAboutUs = async (req, res) => {
  try {

    const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.ABOUT_US.INVALID_ID
      );
    }


    const aboutUs =
      await AboutUs.findOneAndUpdate(

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


    if (!aboutUs) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.ABOUT_US.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ABOUT_US.RESTORED,
      aboutUs
    );

  } catch (error) {

    console.error(
      "Restore About Us Error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};