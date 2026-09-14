import mongoose from "mongoose";

import Country from "../../models/country/index.js";

import {
  HTTP_STATUS_CODES,RESPONSE_MESSAGES
} from "../../helpers/response.js";


import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";


// ================================================================
// CREATE COUNTRY
// ================================================================

export const createCountry = async (req, res) => {
  try {
    const {
      name,
      slug,
      code,
      isoCode,
      region,
      currency,
      description,
      heroImage,
      gallery,
      seo,
      sortOrder,
      status,
    } = req.body;


    // ============================================================
    // VALIDATION
    // ============================================================

    if (!name?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Country name is required"
      );
    }


    // ============================================================
    // NORMALIZE VALUES
    // ============================================================

    const normalizedName = name.trim();

    const normalizedSlug = slug?.trim()
      ? slug.trim().toLowerCase()
      : normalizedName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");


    // ============================================================
    // DUPLICATE CHECK
    // ============================================================

    const existingCountry = await Country.findOne({
      $or: [
        {
          name: normalizedName,
          isActive: true,
        },
        {
          slug: normalizedSlug,
          isActive: true,
        },
      ],
    }).lean();


    if (existingCountry) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.COUNTRY.ALREADY_EXISTS
      );
    }


    // ============================================================
    // CREATE COUNTRY
    // ============================================================

      const heroImgId = (heroImage && typeof heroImage === 'object') ? (heroImage.mediaId || heroImage._id) : heroImage;

      const country = await Country.create({
        name: normalizedName,
        slug: normalizedSlug,

        code,
        isoCode,
        region: region || "Other",
        currency,
        description,

        heroImage: heroImgId || null,
        gallery,

      seo,

      sortOrder:
        sortOrder !== undefined
          ? sortOrder
          : 0,

      status:
        status || "draft",

      createdBy: req.user.id,
      updatedBy: req.user.id,

      publishedAt:
        status === "published"
          ? new Date()
          : null,
    });


    // ============================================================
    // RESPONSE
    // ============================================================

    return sendResponse(
      res,
      HTTP_STATUS_CODES.CREATED,
      RESPONSE_MESSAGES.COUNTRY.CREATED,
      country
    );

  } catch (error) {

    console.error(
      "Create country error:",
      error
    );

    // Handle MongoDB duplicate key
    if (error.code === 11000) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.COUNTRY.ALREADY_EXISTS
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
// GET ALL COUNTRIES
// ================================================================

export const getCountries = async (req, res) => {
  try {
    const {
      id,
      page = 1,
      limit = 10,
      search = "",
      status,
      isActive = "true",
      sortBy = "sortOrder",
      sortOrder = "asc",
    } = req.query;


    // ============================================================
    // GET SINGLE COUNTRY BY QUERY ID
    // ============================================================

    if (id) {

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          RESPONSE_MESSAGES.COUNTRY.INVALID_ID
        );
      }


      const country = await Country.findOne({
        _id: id,
        isActive: true,
      })
        .populate("heroImage")
        .lean();


      if (!country) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.COUNTRY.NOT_FOUND
        );
      }


      return sendResponse(
        res,
        HTTP_STATUS_CODES.OK,
        RESPONSE_MESSAGES.COUNTRY.FETCHED_SINGLE,
        country
      );
    }


    // ============================================================
    // PAGINATION
    // ============================================================

    const currentPage =
      Math.max(Number(page) || 1, 1);

    const perPage =
      Math.min(
        Math.max(Number(limit) || 10, 1),
        100
      );

    const skip =
      (currentPage - 1) * perPage;


    // ============================================================
    // FILTER
    // ============================================================

    const filter = {};


    if (isActive !== "all") {
      filter.isActive =
        isActive === "true";
    }


    if (status) {
      filter.status = status;
    }


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
          isoCode: searchRegex,
        },
      ];
    }


    // ============================================================
    // SORT
    // ============================================================

    const allowedSortFields = [
      "name",
      "createdAt",
      "updatedAt",
      "sortOrder",
    ];

    const safeSortBy =
      allowedSortFields.includes(sortBy)
        ? sortBy
        : "sortOrder";

    const safeSortOrder =
      sortOrder === "desc"
        ? -1
        : 1;


    // ============================================================
    // FETCH COUNTRIES
    // ============================================================

    const [
      countries,
      total,
    ] = await Promise.all([

      Country.find(filter)
        .populate("heroImage")
        .sort({
          [safeSortBy]: safeSortOrder,
        })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Country.countDocuments(filter),
    ]);


    // ============================================================
    // RESPONSE
    // ============================================================

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.COUNTRY.FETCHED,
      {
        countries,

        pagination: {
          total,
          page: currentPage,
          limit: perPage,

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
      "Get countries error:",
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
// UPDATE COUNTRY
// ================================================================

export const updateCountry = async (req, res) => {
  try {
    const { id } = req.params;


    // ============================================================
    // OBJECT ID VALIDATION
    // ============================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.COUNTRY.INVALID_ID
      );
    }


    // ============================================================
    // ALLOWED FIELDS
    // ============================================================

    const allowedFields = [
      "name",
      "slug",
      "code",
      "isoCode",
      "region",
      "currency",
      "description",
      "heroImage",
      "gallery",
      "seo",
      "sortOrder",
      "status",
    ];


    const updateData = {};


    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] =
          req.body[field];
      }
    });


    // ============================================================
    // NAME NORMALIZATION
    // ============================================================

    if (updateData.name !== undefined) {
      updateData.name =
        updateData.name.trim();
    }


    if (updateData.slug !== undefined) {
      updateData.slug =
        updateData.slug
          .trim()
          .toLowerCase();
    }


    // ============================================================
    // DUPLICATE CHECK
    // ============================================================

    if (
      updateData.name ||
      updateData.slug
    ) {

      const duplicateFilter = {
        _id: { $ne: id },
        isActive: true,
        $or: [],
      };


      if (updateData.name) {
        duplicateFilter.$or.push({
          name: updateData.name,
        });
      }


      if (updateData.slug) {
        duplicateFilter.$or.push({
          slug: updateData.slug,
        });
      }


      if (
        duplicateFilter.$or.length
      ) {
        const duplicate =
          await Country.findOne(
            duplicateFilter
          ).lean();

        if (duplicate) {
          return sendError(
            res,
            HTTP_STATUS_CODES.CONFLICT,
            RESPONSE_MESSAGES.COUNTRY.ALREADY_EXISTS
          );
        }
      }
    }


    // ============================================================
    // PUBLISHED DATE
    // ============================================================

    if (
      updateData.status ===
      "published"
    ) {
      const existing =
        await Country.findById(id)
          .select("status publishedAt")
          .lean();

      if (!existing) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.COUNTRY.NOT_FOUND
        );
      }

      if (
        existing.status !== "published" ||
        !existing.publishedAt
      ) {
        updateData.publishedAt =
          new Date();
      }
    }


    if (
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

    // Normalize heroImage ID if object is passed
    if (updateData.heroImage !== undefined) {
      if (updateData.heroImage && typeof updateData.heroImage === 'object') {
        updateData.heroImage = updateData.heroImage.mediaId || updateData.heroImage._id || null;
      }
      if (!updateData.heroImage || !mongoose.Types.ObjectId.isValid(updateData.heroImage)) {
        updateData.heroImage = null;
      }
    }

    const updatedCountry =
      await Country.findOneAndUpdate(
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
        .populate("heroImage")
        .lean();


    if (!updatedCountry) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.COUNTRY.NOT_FOUND
      );
    }


    // ============================================================
    // RESPONSE
    // ============================================================

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.COUNTRY.UPDATED,
      updatedCountry
    );

  } catch (error) {

    console.error(
      "Update country error:",
      error
    );

    if (error.code === 11000) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.COUNTRY.ALREADY_EXISTS
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
// DELETE COUNTRY — SOFT DELETE
// ================================================================

export const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;


    // ============================================================
    // OBJECT ID VALIDATION
    // ============================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.COUNTRY.INVALID_ID
      );
    }


    // ============================================================
    // SOFT DELETE
    // ============================================================

    const deletedCountry =
      await Country.findOneAndUpdate(
        {
          _id: id,
          isActive: true,
        },
        {
          $set: {
            isActive: false,
            deletedAt: new Date(),
            updatedBy: req.user.id,
          },
        },
        {
          new: true,
        }
      ).lean();


    if (!deletedCountry) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.COUNTRY.NOT_FOUND
      );
    }


    // ============================================================
    // RESPONSE
    // ============================================================

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.COUNTRY.DELETED,
      {
        id: deletedCountry._id,
      }
    );

  } catch (error) {

    console.error(
      "Delete country error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};