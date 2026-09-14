import mongoose from "mongoose";

import State from "../../models/state/index.js";
import Country from "../../models/country/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";

import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";


// ================================================================
// CREATE STATE
// ================================================================

export const createState = async (req, res) => {
  try {
    const {
      name,
      slug,
      code,
      countryId,

      region,

      shortDescription,
      overview,
      bestTimeToVisit,

      heroImage,
      gallery,

      capital,

      popularFor,
      travelThemes,

      seasons,

      rating,

      seo,

      isPopular,
      isFeatured,
      sortOrder,

      status,
    } = req.body;


    // ============================================================
    // REQUIRED VALIDATION
    // ============================================================

    if (!name?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "State name is required"
      );
    }


    if (!slug?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "State slug is required"
      );
    }


    if (!code?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "State code is required"
      );
    }


    if (!countryId) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Country is required"
      );
    }


    if (!region) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Region is required"
      );
    }


    // ============================================================
    // OBJECT ID VALIDATION
    // ============================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        countryId
      )
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid country ID"
      );
    }


    // ============================================================
    // CHECK COUNTRY
    // ============================================================

    const country =
      await Country.findOne({
        _id: countryId,
        isActive: true,
      }).lean();


    if (!country) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "Country not found"
      );
    }


    // ============================================================
    // NORMALIZE BASIC VALUES
    // ============================================================

    const normalizedName =
      name.trim();

    const normalizedSlug =
      slug.trim().toLowerCase();

    const normalizedCode =
      code.trim().toUpperCase();


    // ============================================================
    // DUPLICATE CHECK
    // ============================================================

    const existingState =
      await State.findOne({
        isActive: true,
        $or: [
          {
            name: normalizedName,
          },
          {
            slug: normalizedSlug,
          },
          {
            code: normalizedCode,
          },
        ],
      }).lean();


    if (existingState) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.STATE.ALREADY_EXISTS
      );
    }


    // ============================================================
    // CREATE STATE
    // ============================================================

    let normalizedHeroImage = undefined;
    if (heroImage) {
      if (typeof heroImage === "object" && heroImage.mediaId) {
        normalizedHeroImage = {
          mediaId: heroImage.mediaId,
          alt: heroImage.alt || normalizedName,
          title: heroImage.title || normalizedName,
        };
      } else if (typeof heroImage === "string" && heroImage.trim()) {
        normalizedHeroImage = {
          mediaId: heroImage.trim(),
          alt: normalizedName,
          title: normalizedName,
        };
      }
    }

    const state =
      await State.create({
        name: normalizedName,

        slug: normalizedSlug,

        code: normalizedCode,

        countryId,

        region,

        shortDescription,
        overview,
        bestTimeToVisit,

        heroImage: normalizedHeroImage,
        gallery,

        capital,

        popularFor,
        travelThemes,

        seasons,

        rating,

        seo,

        isPopular:
          isPopular ?? false,

        isFeatured:
          isFeatured ?? false,

        sortOrder:
          sortOrder ?? 0,

        status:
          status || "draft",

        publishedAt:
          status === "published"
            ? new Date()
            : null,

        createdBy:
          req.user.id,

        updatedBy:
          req.user.id,
      });


    // ============================================================
    // RESPONSE
    // ============================================================

    return sendResponse(
      res,
      HTTP_STATUS_CODES.CREATED,
      RESPONSE_MESSAGES.STATE.CREATED,
      state
    );

  } catch (error) {

    console.error(
      "Create State Error :",
      error
    );


    // ============================================================
    // DUPLICATE KEY
    // ============================================================

    if (error.code === 11000) {

      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        `${duplicateField || "State"} already exists`
      );
    }


    // ============================================================
    // MONGOOSE VALIDATION
    // ============================================================

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {

      const validationErrors =
        Object.values(
          error.errors
        ).map(
          (err) => err.message
        );

      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        validationErrors
      );
    }


    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ================================================================
// GET STATES
// GET ALL
// GET SINGLE USING ?id=
// ================================================================

export const getStates = async (req, res) => {
  try {

    const {
      id,

      page = 1,
      limit = 10,

      search = "",

      countryId,
      region,
      status,

      isPopular,
      isFeatured,

      isActive = "true",

      sortBy = "sortOrder",
      sortOrder = "asc",
    } = req.query;


    // ============================================================
    // GET SINGLE STATE
    // ============================================================

    if (id) {

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          RESPONSE_MESSAGES.STATE.INVALID_ID
        );
      }


      const state =
        await State.findOne({
          _id: id,
          isActive: true,
        })
          .populate(
            "countryId",
            "name slug code"
          )
          .populate(
            "heroImage.mediaId"
          )
          .populate(
            "gallery.mediaId"
          )
          .lean();


      if (!state) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.STATE.NOT_FOUND
        );
      }


      return sendResponse(
        res,
        HTTP_STATUS_CODES.OK,
        RESPONSE_MESSAGES.STATE.FETCHED_SINGLE,
        state
      );
    }


    // ============================================================
    // PAGINATION
    // ============================================================

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
      (currentPage - 1) *
      perPage;


    // ============================================================
    // FILTER
    // ============================================================

    const filter = {};


    if (isActive !== "all") {

      filter.isActive =
        isActive === "true";
    }


    // ============================================================
    // COUNTRY FILTER
    // ============================================================

    if (countryId) {

      if (
        !mongoose.Types.ObjectId.isValid(
          countryId
        )
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid country ID"
        );
      }


      filter.countryId =
        countryId;
    }


    // ============================================================
    // REGION FILTER
    // ============================================================

    if (region) {
      filter.region = region;
    }


    // ============================================================
    // STATUS FILTER
    // ============================================================

    if (status) {
      filter.status = status;
    }


    // ============================================================
    // POPULAR FILTER
    // ============================================================

    if (isPopular !== undefined) {

      filter.isPopular =
        isPopular === "true";
    }


    // ============================================================
    // FEATURED FILTER
    // ============================================================

    if (isFeatured !== undefined) {

      filter.isFeatured =
        isFeatured === "true";
    }


    // ============================================================
    // SEARCH
    // ============================================================

    if (search?.trim()) {

      const searchRegex =
        new RegExp(
          search.trim(),
          "i"
        );


      filter.$or = [
        {
          name: searchRegex,
        },
        {
          slug: searchRegex,
        },
        {
          code: searchRegex,
        },
        {
          capital: searchRegex,
        },
        {
          region: searchRegex,
        },
      ];
    }


    // ============================================================
    // SORT
    // ============================================================

    const allowedSortFields = [
      "name",
      "code",
      "sortOrder",
      "createdAt",
      "updatedAt",
      "rating.average",
    ];


    const safeSortBy =
      allowedSortFields.includes(
        sortBy
      )
        ? sortBy
        : "sortOrder";


    const safeSortOrder =
      sortOrder === "desc"
        ? -1
        : 1;


    // ============================================================
    // FETCH
    // ============================================================

    const [
      states,
      total,
    ] = await Promise.all([

      State.find(filter)
        .populate(
          "countryId",
          "name slug code"
        )
        .populate(
          "heroImage.mediaId"
        )
        .populate(
          "gallery.mediaId"
        )
        .sort({
          [safeSortBy]:
            safeSortOrder,
        })
        .skip(skip)
        .limit(perPage)
        .lean(),

      State.countDocuments(
        filter
      ),
    ]);


    // ============================================================
    // RESPONSE
    // ============================================================

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.STATE.FETCHED,
      {
        states,

        pagination: {
          total,

          page:
            currentPage,

          limit:
            perPage,

          totalPages:
            Math.ceil(
              total / perPage
            ),

          hasNextPage:
            currentPage <
            Math.ceil(
              total / perPage
            ),

          hasPreviousPage:
            currentPage > 1,
        },
      }
    );

  } catch (error) {

    console.error(
      "Get States Error :",
      error
    );


    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ================================================================
// UPDATE STATE
// ================================================================

export const updateState = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;


    // ============================================================
    // ID VALIDATION
    // ============================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.STATE.INVALID_ID
      );
    }


    // ============================================================
    // ALLOWED FIELDS
    // ============================================================

    const allowedFields = [
      "name",
      "slug",
      "code",
      "countryId",

      "region",

      "shortDescription",
      "overview",
      "bestTimeToVisit",

      "heroImage",
      "gallery",

      "capital",

      "popularFor",
      "travelThemes",

      "seasons",

      "rating",

      "seo",

      "isPopular",
      "isFeatured",
      "sortOrder",

      "status",
    ];


    const updateData = {};


    allowedFields.forEach(
      (field) => {

        if (
          req.body[field] !==
          undefined
        ) {

          updateData[field] =
            req.body[field];
        }
      }
    );


    // ============================================================
    // NAME
    // ============================================================

    if (
      updateData.name !==
      undefined
    ) {

      if (
        !updateData.name.trim()
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "State name cannot be empty"
        );
      }


      updateData.name =
        updateData.name.trim();
    }


    // ============================================================
    // SLUG
    // ============================================================

    if (
      updateData.slug !==
      undefined
    ) {

      if (
        !updateData.slug.trim()
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "State slug cannot be empty"
        );
      }


      updateData.slug =
        updateData.slug
          .trim()
          .toLowerCase();
    }


    // ============================================================
    // CODE
    // ============================================================

    if (
      updateData.code !==
      undefined
    ) {

      if (
        !updateData.code.trim()
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "State code cannot be empty"
        );
      }


      updateData.code =
        updateData.code
          .trim()
          .toUpperCase();
    }


    // ============================================================
    // COUNTRY VALIDATION
    // ============================================================

    if (
      updateData.countryId
    ) {

      if (
        !mongoose.Types.ObjectId.isValid(
          updateData.countryId
        )
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid country ID"
        );
      }


      const country =
        await Country.findOne({
          _id:
            updateData.countryId,

          isActive: true,
        }).lean();


      if (!country) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          "Country not found"
        );
      }
    }


    // ============================================================
    // HERO IMAGE NORMALIZATION
    // ============================================================

    if (updateData.heroImage !== undefined) {
      if (!updateData.heroImage) {
        updateData.heroImage = null;
      } else if (typeof updateData.heroImage === "object" && updateData.heroImage.mediaId) {
        updateData.heroImage = {
          mediaId: updateData.heroImage.mediaId,
          alt: updateData.heroImage.alt || "",
          title: updateData.heroImage.title || "",
        };
      } else if (typeof updateData.heroImage === "string" && updateData.heroImage.trim()) {
        updateData.heroImage = {
          mediaId: updateData.heroImage.trim(),
          alt: "",
          title: "",
        };
      }
    }


    // ============================================================
    // DUPLICATE CHECK
    // ============================================================

    const duplicateConditions = [];


    if (updateData.name) {

      duplicateConditions.push({
        name:
          updateData.name,
      });
    }


    if (updateData.slug) {

      duplicateConditions.push({
        slug:
          updateData.slug,
      });
    }


    if (updateData.code) {

      duplicateConditions.push({
        code:
          updateData.code,
      });
    }


    if (
      duplicateConditions.length
    ) {

      const duplicate =
        await State.findOne({
          _id: {
            $ne: id,
          },

          isActive: true,

          $or:
            duplicateConditions,
        }).lean();


      if (duplicate) {
        return sendError(
          res,
          HTTP_STATUS_CODES.CONFLICT,
          RESPONSE_MESSAGES.STATE.ALREADY_EXISTS
        );
      }
    }


    // ============================================================
    // STATUS / PUBLISHED DATE
    // ============================================================

    if (
      updateData.status ===
      "published"
    ) {

      const existingState =
        await State.findById(id)
          .select(
            "status publishedAt"
          )
          .lean();


      if (!existingState) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.STATE.NOT_FOUND
        );
      }


      if (
        existingState.status !==
          "published" ||
        !existingState.publishedAt
      ) {

        updateData.publishedAt =
          new Date();
      }

    } else if (
      updateData.status &&
      updateData.status !==
        "published"
    ) {

      updateData.publishedAt =
        null;
    }


    // ============================================================
    // AUDIT
    // ============================================================

    updateData.updatedBy =
      req.user.id;


    // ============================================================
    // UPDATE
    // ============================================================

    const updatedState =
      await State.findOneAndUpdate(
        {
          _id: id,
          isActive: true,
        },

        {
          $set: updateData,
        },

        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "countryId",
          "name slug code"
        )
        .populate(
          "heroImage.mediaId"
        )
        .populate(
          "gallery.mediaId"
        );


    if (!updatedState) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.STATE.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.STATE.UPDATED,
      updatedState
    );

  } catch (error) {

    console.error(
      "Update State Error :",
      error
    );


    if (
      error.code === 11000
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.STATE.ALREADY_EXISTS
      );
    }


    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {

      const validationErrors =
        Object.values(
          error.errors
        ).map(
          (err) =>
            err.message
        );


      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        validationErrors
      );
    }


    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ================================================================
// DELETE STATE — SOFT DELETE
// ================================================================

export const deleteState = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;


    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.STATE.INVALID_ID
      );
    }


    const state =
      await State.findOneAndUpdate(
        {
          _id: id,
          isActive: true,
        },

        {
          $set: {
            isActive: false,

            deletedAt:
              new Date(),

            updatedBy:
              req.user.id,
          },
        },

        {
          new: true,
        }
      );


    if (!state) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.STATE.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.STATE.DELETED,
      {
        id: state._id,
      }
    );

  } catch (error) {

    console.error(
      "Delete State Error :",
      error
    );


    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};