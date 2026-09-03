import mongoose from "mongoose";

import City from "../../models/city/index.js";
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
// CREATE CITY
// ================================================================

export const createCity = async (req, res) => {
  try {
    const {
      name,
      slug,
      stateId,
      countryId,
      region,

      shortDescription,
      overview,
      tagline,

      bestTimeToVisit,

      popularDuration,

      howToReach,

      coordinates,
      address,

      cityType,
      popularFor,
      travelThemes,

      heroImage,
      gallery,

      food,
      shopping,

      weather,

      faqs,

      map,

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
        "City name is required"
      );
    }


    if (!slug?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "City slug is required"
      );
    }


    if (!stateId) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "State is required"
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


    if (!heroImage?.mediaId) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Hero image is required"
      );
    }


    // ============================================================
    // OBJECT ID VALIDATION
    // ============================================================

    if (
      !mongoose.Types.ObjectId.isValid(stateId)
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid state ID"
      );
    }


    if (
      !mongoose.Types.ObjectId.isValid(countryId)
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid country ID"
      );
    }


    if (
      !mongoose.Types.ObjectId.isValid(
        heroImage.mediaId
      )
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid hero image media ID"
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
    // CHECK STATE
    // ============================================================

    const state =
      await State.findOne({
        _id: stateId,
        countryId: countryId,
        isActive: true,
      }).lean();


    if (!state) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "State not found in the selected country"
      );
    }


    // ============================================================
    // REGION CONSISTENCY
    // ============================================================

    if (state.region !== region) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "City region must match the selected state's region"
      );
    }


    // ============================================================
    // NORMALIZE
    // ============================================================

    const normalizedName =
      name.trim();

    const normalizedSlug =
      slug.trim().toLowerCase();


    // ============================================================
    // DUPLICATE CHECK
    // ============================================================

    const existingCity =
      await City.findOne({
        isActive: true,

        $or: [
          {
            name: normalizedName,
            stateId,
          },
          {
            slug: normalizedSlug,
          },
        ],
      }).lean();


    if (existingCity) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.CITY.ALREADY_EXISTS
      );
    }


    // ============================================================
    // CREATE CITY
    // ============================================================

    const city =
      await City.create({
        name:
          normalizedName,

        slug:
          normalizedSlug,

        stateId,

        countryId,

        region,

        shortDescription,
        overview,
        tagline,

        bestTimeToVisit,

        popularDuration,

        howToReach,

        coordinates,
        address,

        cityType,
        popularFor,
        travelThemes,

        heroImage,
        gallery,

        food,
        shopping,

        weather,

        faqs,

        map,

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
      RESPONSE_MESSAGES.CITY.CREATED,
      city
    );

  } catch (error) {

    console.error(
      "Create City Error :",
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
        `${duplicateField || "City"} already exists`
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
// GET CITIES
// GET ALL
// GET SINGLE USING ?id=
// ================================================================

export const getCities = async (req, res) => {
  try {

    const {
      id,

      page = 1,
      limit = 10,

      search = "",

      stateId,
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
    // GET SINGLE CITY
    // ============================================================

    if (id) {

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          RESPONSE_MESSAGES.CITY.INVALID_ID
        );
      }


      const city =
        await City.findOne({
          _id: id,
          isActive: true,
        })
          .populate(
            "stateId",
            "name slug code region"
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
          )
          .lean();


      if (!city) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.CITY.NOT_FOUND
        );
      }


      return sendResponse(
        res,
        HTTP_STATUS_CODES.OK,
        RESPONSE_MESSAGES.CITY.FETCHED_SINGLE,
        city
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


    if (stateId) {

      if (
        !mongoose.Types.ObjectId.isValid(
          stateId
        )
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid state ID"
        );
      }

      filter.stateId =
        stateId;
    }


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


    if (region) {
      filter.region =
        region;
    }


    if (status) {
      filter.status =
        status;
    }


    if (isPopular !== undefined) {
      filter.isPopular =
        isPopular === "true";
    }


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
          shortDescription:
            searchRegex,
        },
        {
          overview:
            searchRegex,
        },
        {
          tagline:
            searchRegex,
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
      cities,
      total,
    ] = await Promise.all([

      City.find(filter)
        .populate(
          "stateId",
          "name slug code region"
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
        )
        .sort({
          [safeSortBy]:
            safeSortOrder,
        })
        .skip(skip)
        .limit(perPage)
        .lean(),

      City.countDocuments(
        filter
      ),
    ]);


    // ============================================================
    // RESPONSE
    // ============================================================

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.CITY.FETCHED,
      {
        cities,

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
      "Get Cities Error :",
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
// UPDATE CITY
// ================================================================

export const updateCity = async (
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
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.CITY.INVALID_ID
      );
    }


    // ============================================================
    // ALLOWED FIELDS
    // ============================================================

    const allowedFields = [
      "name",
      "slug",

      "stateId",
      "countryId",
      "region",

      "shortDescription",
      "overview",
      "tagline",

      "bestTimeToVisit",

      "popularDuration",

      "howToReach",

      "coordinates",
      "address",

      "cityType",
      "popularFor",
      "travelThemes",

      "heroImage",
      "gallery",

      "food",
      "shopping",

      "weather",

      "faqs",

      "map",

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
    // BASIC FIELD NORMALIZATION
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
          "City name cannot be empty"
        );
      }


      updateData.name =
        updateData.name.trim();
    }


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
          "City slug cannot be empty"
        );
      }


      updateData.slug =
        updateData.slug
          .trim()
          .toLowerCase();
    }


    // ============================================================
    // GET EXISTING CITY
    // ============================================================

    const existingCity =
      await City.findOne({
        _id: id,
        isActive: true,
      }).lean();


    if (!existingCity) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.CITY.NOT_FOUND
      );
    }


    // ============================================================
    // COUNTRY VALIDATION
    // ============================================================

    const finalCountryId =
      updateData.countryId ||
      existingCity.countryId;


    if (
      !mongoose.Types.ObjectId.isValid(
        finalCountryId
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
        _id: finalCountryId,
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
    // STATE VALIDATION
    // ============================================================

    const finalStateId =
      updateData.stateId ||
      existingCity.stateId;


    if (
      !mongoose.Types.ObjectId.isValid(
        finalStateId
      )
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid state ID"
      );
    }


    const state =
      await State.findOne({
        _id: finalStateId,
        countryId: finalCountryId,
        isActive: true,
      }).lean();


    if (!state) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "State not found in the selected country"
      );
    }


    // ============================================================
    // REGION CONSISTENCY
    // ============================================================

    const finalRegion =
      updateData.region ||
      existingCity.region;


    if (
      state.region !== finalRegion
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "City region must match the selected state's region"
      );
    }


    // ============================================================
    // HERO IMAGE VALIDATION
    // ============================================================

    if (
      updateData.heroImage &&
      !updateData.heroImage.mediaId
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Hero image media ID is required"
      );
    }


    if (
      updateData.heroImage?.mediaId &&
      !mongoose.Types.ObjectId.isValid(
        updateData.heroImage.mediaId
      )
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid hero image media ID"
      );
    }


    // ============================================================
    // DUPLICATE CHECK
    // ============================================================

    const duplicateConditions = [];


    if (updateData.name) {

      duplicateConditions.push({
        name:
          updateData.name,
        stateId:
          finalStateId,
      });
    }


    if (updateData.slug) {

      duplicateConditions.push({
        slug:
          updateData.slug,
      });
    }


    if (
      duplicateConditions.length
    ) {

      const duplicate =
        await City.findOne({
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
          RESPONSE_MESSAGES.CITY.ALREADY_EXISTS
        );
      }
    }


    // ============================================================
    // SET RELATIONS
    // ============================================================

    updateData.stateId =
      finalStateId;

    updateData.countryId =
      finalCountryId;

    updateData.region =
      finalRegion;


    // ============================================================
    // STATUS
    // ============================================================

    if (
      updateData.status ===
      "published"
    ) {

      if (
        existingCity.status !==
          "published" ||
        !existingCity.publishedAt
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

    const updatedCity =
      await City.findOneAndUpdate(
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
          "stateId",
          "name slug code region"
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


    if (!updatedCity) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.CITY.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.CITY.UPDATED,
      updatedCity
    );

  } catch (error) {

    console.error(
      "Update City Error :",
      error
    );


    if (
      error.code === 11000
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.CITY.ALREADY_EXISTS
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
// DELETE CITY — SOFT DELETE
// ================================================================

export const deleteCity = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;


    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.CITY.INVALID_ID
      );
    }


    const city =
      await City.findOneAndUpdate(
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


    if (!city) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.CITY.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.CITY.DELETED,
      {
        id: city._id,
      }
    );

  } catch (error) {

    console.error(
      "Delete City Error :",
      error
    );


    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};