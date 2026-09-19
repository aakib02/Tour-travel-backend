import mongoose from "mongoose";

import Hero from "../../models/hero/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";

import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";


// ============================================================
// HELPERS
// ============================================================

const getUserId = (req) => {
  return (
    req.user?.id 
  );
};


// ------------------------------------------------------------
// Validate slide orders
// ------------------------------------------------------------

const validateSlideOrders = (slides) => {
  if (!Array.isArray(slides) || slides.length === 0) {
    return "At least one hero slide is required";
  }

  const orders = slides.map((slide) => slide.order);

  if (orders.some((order) => !Number.isInteger(order) || order < 1)) {
    return "Hero slide order must be a positive integer";
  }

  if (new Set(orders).size !== orders.length) {
    return "Hero slide order must be unique";
  }

  return null;
};


// ------------------------------------------------------------
// Validate showcase orders
// ------------------------------------------------------------

const validateShowcaseOrders = (showcase) => {
  if (!Array.isArray(showcase) || showcase.length === 0) {
    return null;
  }

  const orders = showcase.map((item) => item.order);

  if (orders.some((order) => !Number.isInteger(order) || order < 1)) {
    return "Showcase order must be a positive integer";
  }

  if (new Set(orders).size !== orders.length) {
    return "Showcase order must be unique";
  }

  return null;
};


// ------------------------------------------------------------
// Activate only one Hero
// ------------------------------------------------------------

const makeOnlyHeroActive = async (heroId) => {
  await Hero.updateMany(
    {
      _id: {
        $ne: heroId,
      },
      isActive: true,
    },
    {
      $set: {
        isActive: false,
      },
    }
  );
};


// ------------------------------------------------------------
// Populate Hero
// ------------------------------------------------------------

const populateHero = (query) => {
  return query
    .populate("slides.image.mediaId")
    .populate("slides.thumbnail.mediaId")
    .populate("showcase.image.mediaId")
    .populate("trustCard.avatars.mediaId");
};


// ------------------------------------------------------------
// Prepare public Hero response
// ------------------------------------------------------------

const normalizeHero = (hero) => {
  if (!hero) return null;

  const normalized = {
    ...hero,

    slides: (hero.slides || [])
      .filter((slide) => slide.isActive !== false)
      .sort((a, b) => a.order - b.order)
      .map((slide) => ({
        ...slide,

        image: {
          ...(slide.image || {}),
          url:
            slide.image?.url ||
            slide.image?.mediaId?.url ||
            "",
        },

        thumbnail: slide.thumbnail
          ? {
              ...(slide.thumbnail || {}),
              url:
                slide.thumbnail?.url ||
                slide.thumbnail?.mediaId?.url ||
                "",
            }
          : null,

        // Frontend-friendly alias
        thumb:
          slide.thumbnail?.url ||
          slide.thumbnail?.mediaId?.url ||
          "",
      })),

    showcase: (hero.showcase || [])
      .filter((item) => item.isActive !== false)
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        ...item,

        image: {
          ...(item.image || {}),
          url:
            item.image?.url ||
            item.image?.mediaId?.url ||
            "",
        },
      })),

    trustCard: {
      ...(hero.trustCard || {}),

      avatars: (hero.trustCard?.avatars || []).map((avatar) => ({
        ...avatar,

        url:
          avatar.url ||
          avatar.mediaId?.url ||
          "",
      })),
    },
  };

  return normalized;
};


// ============================================================
// CREATE HERO
// ============================================================

export const createHero = async (req, res) => {
  try {
    const {
      name,
      slides = [],
      showcase = [],
      trustCard = {},
      settings = {},
      isActive = true,
    } = req.body;


    // --------------------------------------------------------
    // Name
    // --------------------------------------------------------

    if (!name?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Hero name is required"
      );
    }


    // --------------------------------------------------------
    // Slides
    // --------------------------------------------------------

    const slideError = validateSlideOrders(slides);

    if (slideError) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        slideError
      );
    }


    // --------------------------------------------------------
    // Showcase
    // --------------------------------------------------------

    const showcaseError =
      validateShowcaseOrders(showcase);

    if (showcaseError) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        showcaseError
      );
    }


    // --------------------------------------------------------
    // Create
    // --------------------------------------------------------

    const hero = await Hero.create({
      name: name.trim(),

      slides,

      showcase,

      trustCard,

      settings,

      isActive,

      deletedAt: null,

      createdBy: getUserId(req),

      updatedBy: getUserId(req),
    });


    // --------------------------------------------------------
    // Only one active Hero
    // --------------------------------------------------------

    if (isActive) {
      await makeOnlyHeroActive(hero._id);
    }


    // --------------------------------------------------------
    // Fetch populated Hero
    // --------------------------------------------------------

    const populatedHero = await populateHero(
      Hero.findById(hero._id)
    );


    const normalizedHero =
      normalizeHero(
        populatedHero.toObject()
      );


    return sendResponse(
      res,
      HTTP_STATUS_CODES.CREATED,
      RESPONSE_MESSAGES.HERO?.CREATED ||
        "Hero created successfully",
      normalizedHero
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


// ============================================================
// GET ACTIVE HERO - PUBLIC
// ============================================================

export const getActiveHero = async (req, res) => {
  try {

    const heroQuery = Hero.findOne({
      isActive: true,
      deletedAt: null,
    });

    const hero = await populateHero(
      heroQuery
    ).lean();

    if (!hero) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "Active hero not found"
      );
    }


    const normalizedHero =
      normalizeHero(hero);


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.HERO?.FETCHED ||
        "Hero fetched successfully",
      normalizedHero
    );

  } catch (error) {
    console.error(
      "Get Active Hero Error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ============================================================
// GET HERO
// ADMIN
//
// GET /api/hero/get
// GET /api/hero/get?id=xxxxx
// ============================================================

export const getHero = async (req, res) => {
  try {
    const {
      id,
      isActive,
      search,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;


    // ========================================================
    // SINGLE HERO
    // ========================================================

    if (id) {

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid hero ID"
        );
      }


      const hero =
        await populateHero(
          Hero.findById(id)
        ).lean();


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
        RESPONSE_MESSAGES.HERO?.FETCHED ||
          "Hero fetched successfully",
        normalizeHero(hero)
      );
    }


    // ========================================================
    // PAGINATION
    // ========================================================

    const currentPage =
      Math.max(
        Number(page) || 1,
        1
      );

    const perPage =
      Math.min(
        Math.max(
          Number(limit) || 10,
          1
        ),
        100
      );

    const skip =
      (currentPage - 1) * perPage;


    // ========================================================
    // QUERY
    // ========================================================

    const query = {};


    if (isActive !== undefined) {
      query.isActive =
        isActive === "true";
    }


    if (search?.trim()) {
      query.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }


    // ========================================================
    // SAFE SORT
    // ========================================================

    const allowedSorts = [
      "createdAt",
      "-createdAt",
      "updatedAt",
      "-updatedAt",
      "name",
      "-name",
    ];

    const safeSort =
      allowedSorts.includes(sort)
        ? sort
        : "-createdAt";


    // ========================================================
    // FETCH
    // ========================================================

    const [
      heroes,
      total,
    ] = await Promise.all([

      populateHero(
        Hero.find(query)
          .sort(safeSort)
          .skip(skip)
          .limit(perPage)
      ).lean(),

      Hero.countDocuments(query),
    ]);


    const normalizedHeroes =
      heroes.map(normalizeHero);


    const totalPages =
      Math.ceil(
        total / perPage
      );


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.HERO?.FETCHED ||
        "Heroes fetched successfully",
      {
        heroes: normalizedHeroes,

        pagination: {
          total,

          page: currentPage,

          limit: perPage,

          totalPages,

          hasNextPage:
            currentPage < totalPages,

          hasPreviousPage:
            currentPage > 1,
        },
      }
    );

  } catch (error) {
    console.error(
      "Get Hero Error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ============================================================
// UPDATE HERO
// ============================================================

export const updateHero = async (req, res) => {
  try {

    const { id } = req.params;


    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
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
      "isActive",
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


    // --------------------------------------------------------
    // Validate name
    // --------------------------------------------------------

    if (
      updateData.name !== undefined &&
      !updateData.name?.trim()
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Hero name is required"
      );
    }


    // --------------------------------------------------------
    // Validate slides
    // --------------------------------------------------------

    if (
      updateData.slides !== undefined
    ) {

      const slideError =
        validateSlideOrders(
          updateData.slides
        );

      if (slideError) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          slideError
        );
      }
    }


    // --------------------------------------------------------
    // Validate showcase
    // --------------------------------------------------------

    if (
      updateData.showcase !== undefined
    ) {

      const showcaseError =
        validateShowcaseOrders(
          updateData.showcase
        );

      if (showcaseError) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          showcaseError
        );
      }
    }


    if (
      updateData.name !== undefined
    ) {
      updateData.name =
        updateData.name.trim();
    }


    updateData.updatedBy =
      getUserId(req);


    // --------------------------------------------------------
    // Update
    // --------------------------------------------------------

    const hero =
      await Hero.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      );


    if (!hero) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "Hero not found"
      );
    }


    // --------------------------------------------------------
    // If activated → deactivate others
    // --------------------------------------------------------

    if (
      updateData.isActive === true
    ) {
      await makeOnlyHeroActive(
        hero._id
      );
    }


    // --------------------------------------------------------
    // Populate
    // --------------------------------------------------------

    const populatedHero =
      await populateHero(
        Hero.findById(hero._id)
      ).lean();


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.HERO?.UPDATED ||
        "Hero updated successfully",
      normalizeHero(populatedHero)
    );

  } catch (error) {
    console.error(
      "Update Hero Error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ============================================================
// DELETE HERO - SOFT DELETE
// ============================================================
export const deleteHero = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // Validate ID
    // --------------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid hero ID"
      );
    }

    // --------------------------------------------------------
    // HARD DELETE
    // --------------------------------------------------------

    const hero = await Hero.findByIdAndDelete(id);

    // --------------------------------------------------------
    // Hero not found
    // --------------------------------------------------------

    if (!hero) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "Hero not found"
      );
    }

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.HERO?.DELETED ||
        "Hero deleted successfully",
      {
        _id: hero._id,
      }
    );

  } catch (error) {
    console.error(
      "Delete Hero Error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};

// ============================================================
// RESTORE HERO
// ============================================================

export const restoreHero = async (req, res) => {
  try {

    const { id } = req.params;


    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid hero ID"
      );
    }


    const hero =
      await Hero.findOneAndUpdate(
        {
          _id: id,
          isActive: false,
        },
        {
          $set: {
            isActive: true,

            deletedAt: null,

            updatedBy:
              getUserId(req),
          },
        },
        {
          new: true,
        }
      );


    if (!hero) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "Hero not found"
      );
    }


    // --------------------------------------------------------
    // Only one active Hero
    // --------------------------------------------------------

    await makeOnlyHeroActive(
      hero._id
    );


    const populatedHero =
      await populateHero(
        Hero.findById(hero._id)
      ).lean();


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.HERO?.RESTORED ||
        "Hero restored successfully",
      normalizeHero(populatedHero)
    );

  } catch (error) {
    console.error(
      "Restore Hero Error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};