import mongoose from "mongoose";

import Hotel from "../../models/hotel/index.js";
import State from "../../models/state/index.js";
import City from "../../models/city/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";

import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";


// ================================================================
// CREATE HOTEL
// ================================================================

export const createHotel = async (req, res) => {
  try {
    const {
      name,
      slug,

      stateId,
      cityId,

      shortDescription,
      description,

      category,
      starRating,

      highlights,
      amenities,

      location,

      rooms,

      policies,

      heroImage,
      gallery,

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
        "Hotel name is required"
      );
    }


    if (!slug?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Hotel slug is required"
      );
    }


    if (!stateId) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "State is required"
      );
    }


    if (!cityId) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "City is required"
      );
    }


    if (!category) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Hotel category is required"
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
      !mongoose.Types.ObjectId.isValid(cityId)
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid city ID"
      );
    }


    // ============================================================
    // CHECK STATE
    // ============================================================

    const state =
      await State.findOne({
        _id: stateId,
        isActive: true,
      }).lean();


    if (!state) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "State not found"
      );
    }


    // ============================================================
    // CHECK CITY
    // ============================================================

    const city =
      await City.findOne({
        _id: cityId,
        stateId,
        isActive: true,
      }).lean();


    if (!city) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "City not found in the selected state"
      );
    }


    // ============================================================
    // NORMALIZE
    // ============================================================

    const normalizedName =
      name.trim();

    const normalizedSlug =
      slug
        .trim()
        .toLowerCase();


    // ============================================================
    // DUPLICATE CHECK
    // ============================================================

    const existingHotel =
      await Hotel.findOne({
        isActive: true,

        $or: [
          {
            slug:
              normalizedSlug,
          },

          {
            name:
              normalizedName,

            cityId,
          },
        ],
      }).lean();


    if (existingHotel) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.HOTEL.ALREADY_EXISTS
      );
    }


    // ============================================================
    // CREATE
    // ============================================================

    const hotel =
      await Hotel.create({

        name:
          normalizedName,

        slug:
          normalizedSlug,

        stateId,
        cityId,

        shortDescription,
        description,

        category,

        starRating:
          starRating ?? null,

        highlights,
        amenities,

        location,

        rooms,

        policies,

        heroImage,
        gallery,

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


    return sendResponse(
      res,
      HTTP_STATUS_CODES.CREATED,
      RESPONSE_MESSAGES.HOTEL.CREATED,
      hotel
    );

  } catch (error) {

    console.error(
      "Create Hotel Error :",
      error
    );


    if (error.code === 11000) {

      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        `${duplicateField || "Hotel"} already exists`
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
// GET HOTELS
//
// ALL:
// GET /api/admin/hotels
//
// SINGLE:
// GET /api/admin/hotels?id=HOTEL_ID
// ================================================================

export const getHotels = async (req, res) => {
  try {

    const {
      id,

      page = 1,
      limit = 10,

      search,

      stateId,
      cityId,

      category,
      starRating,

      minStarRating,
      maxStarRating,

      minRoomAdults,
      maxRoomAdults,

      minRoomChildren,
      maxRoomChildren,

      roomAvailable,

      earlyCheckInAvailable,
      lateCheckOutAvailable,

      smokingAllowed,

      isPopular,
      isFeatured,

      status,

      isActive = "true",

      minRating,

      sortBy = "sortOrder",
      sortOrder = "asc",
    } = req.query;


    // ============================================================
    // GET SINGLE HOTEL
    // ============================================================

    if (id) {

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          RESPONSE_MESSAGES.HOTEL.INVALID_ID
        );
      }


      const hotel =
        await Hotel.findOne({
          _id: id,
          isActive: true,
        })
          .populate(
            "stateId",
            "name slug code region"
          )
          .populate(
            "cityId",
            "name slug stateId"
          )
          .lean();


      if (!hotel) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.HOTEL.NOT_FOUND
        );
      }


      return sendResponse(
        res,
        HTTP_STATUS_CODES.OK,
        RESPONSE_MESSAGES.HOTEL.FETCHED_SINGLE,
        hotel
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


    // ============================================================
    // ACTIVE
    // ============================================================

    if (isActive !== "all") {

      filter.isActive =
        isActive === "true";
    }


    // ============================================================
    // STATE
    // ============================================================

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


    // ============================================================
    // CITY
    // ============================================================

    if (cityId) {

      if (
        !mongoose.Types.ObjectId.isValid(
          cityId
        )
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid city ID"
        );
      }


      filter.cityId =
        cityId;
    }


    // ============================================================
    // CATEGORY
    // ============================================================

    if (category) {

      filter.category =
        category
          .trim()
          .toLowerCase();
    }


    // ============================================================
    // EXACT STAR RATING
    // ============================================================

    if (starRating !== undefined) {

      const value =
        Number(starRating);


      if (
        Number.isNaN(value) ||
        value < 1 ||
        value > 5
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid star rating"
        );
      }


      filter.starRating =
        value;
    }


    // ============================================================
    // STAR RATING RANGE
    // ============================================================

    if (
      minStarRating !== undefined ||
      maxStarRating !== undefined
    ) {

      const ratingFilter = {};


      if (
        minStarRating !== undefined
      ) {

        const value =
          Number(minStarRating);


        if (
          Number.isNaN(value) ||
          value < 1 ||
          value > 5
        ) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid minimum star rating"
          );
        }


        ratingFilter.$gte =
          value;
      }


      if (
        maxStarRating !== undefined
      ) {

        const value =
          Number(maxStarRating);


        if (
          Number.isNaN(value) ||
          value < 1 ||
          value > 5
        ) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid maximum star rating"
          );
        }


        ratingFilter.$lte =
          value;
      }


      if (
        ratingFilter.$gte !==
          undefined &&
        ratingFilter.$lte !==
          undefined &&
        ratingFilter.$gte >
          ratingFilter.$lte
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Minimum star rating cannot be greater than maximum star rating"
        );
      }


      filter.starRating =
        ratingFilter;
    }


    // ============================================================
    // ROOM ADULT CAPACITY
    // ============================================================

    if (
      minRoomAdults !== undefined
    ) {

      const value =
        Number(minRoomAdults);


      if (
        Number.isNaN(value) ||
        value < 1
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid minimum adult room capacity"
        );
      }


      filter.rooms = {
        $elemMatch: {
          maxAdults: {
            $gte: value,
          },
          isAvailable: true,
        },
      };
    }


    if (
      maxRoomAdults !== undefined
    ) {

      const value =
        Number(maxRoomAdults);


      if (
        Number.isNaN(value) ||
        value < 1
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid maximum adult room capacity"
        );
      }


      filter.rooms = {
        ...(filter.rooms || {}),

        $elemMatch: {
          ...(filter.rooms?.$elemMatch || {}),

          maxAdults: {
            ...(filter.rooms?.$elemMatch?.maxAdults || {}),
            $lte: value,
          },

          isAvailable: true,
        },
      };
    }


    // ============================================================
    // ROOM CHILD CAPACITY
    // ============================================================

    if (
      minRoomChildren !== undefined
    ) {

      const value =
        Number(minRoomChildren);


      if (
        Number.isNaN(value) ||
        value < 0
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid minimum child room capacity"
        );
      }


      filter.rooms = {
        $elemMatch: {
          ...(filter.rooms?.$elemMatch || {}),

          maxChildren: {
            $gte: value,
          },

          isAvailable: true,
        },
      };
    }


    if (
      maxRoomChildren !== undefined
    ) {

      const value =
        Number(maxRoomChildren);


      if (
        Number.isNaN(value) ||
        value < 0
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid maximum child room capacity"
        );
      }


      filter.rooms = {
        $elemMatch: {
          ...(filter.rooms?.$elemMatch || {}),

          maxChildren: {
            ...(filter.rooms?.$elemMatch?.maxChildren || {}),

            $lte: value,
          },

          isAvailable: true,
        },
      };
    }


    // ============================================================
    // ROOM AVAILABILITY
    // ============================================================

    if (
      roomAvailable !== undefined
    ) {

      filter.rooms = {
        $elemMatch: {
          ...(filter.rooms?.$elemMatch || {}),

          isAvailable:
            roomAvailable === "true",
        },
      };
    }


    // ============================================================
    // EARLY CHECK-IN
    // ============================================================

    if (
      earlyCheckInAvailable !==
      undefined
    ) {

      filter[
        "policies.earlyCheckInAvailable"
      ] =
        earlyCheckInAvailable ===
        "true";
    }


    // ============================================================
    // LATE CHECK-OUT
    // ============================================================

    if (
      lateCheckOutAvailable !==
      undefined
    ) {

      filter[
        "policies.lateCheckOutAvailable"
      ] =
        lateCheckOutAvailable ===
        "true";
    }


    // ============================================================
    // SMOKING
    // ============================================================

    if (
      smokingAllowed !==
      undefined
    ) {

      filter[
        "policies.smokingAllowed"
      ] =
        smokingAllowed ===
        "true";
    }


    // ============================================================
    // POPULAR
    // ============================================================

    if (
      isPopular !== undefined
    ) {

      filter.isPopular =
        isPopular === "true";
    }


    // ============================================================
    // FEATURED
    // ============================================================

    if (
      isFeatured !== undefined
    ) {

      filter.isFeatured =
        isFeatured === "true";
    }


    // ============================================================
    // STATUS
    // ============================================================

    if (status) {

      filter.status =
        status;
    }


    // ============================================================
    // RATING
    // ============================================================

    if (
      minRating !== undefined
    ) {

      const value =
        Number(minRating);


      if (
        Number.isNaN(value) ||
        value < 0 ||
        value > 5
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid minimum rating"
        );
      }


      filter[
        "rating.average"
      ] = {
        $gte: value,
      };
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
          name:
            searchRegex,
        },

        {
          shortDescription:
            searchRegex,
        },

        {
          description:
            searchRegex,
        },

        {
          highlights:
            searchRegex,
        },

        {
          amenities:
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
      "starRating",
      "rating.average",
      "rating.count",
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
      hotels,
      total,
    ] = await Promise.all([

      Hotel.find(filter)
        .populate(
          "stateId",
          "name slug code region"
        )
        .populate(
          "cityId",
          "name slug stateId"
        )
        .sort({
          [safeSortBy]:
            safeSortOrder,
        })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Hotel.countDocuments(
        filter
      ),
    ]);


    // ============================================================
    // RESPONSE
    // ============================================================

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.HOTEL.FETCHED,
      {
        hotels,

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
      "Get Hotels Error :",
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
// UPDATE HOTEL
// ================================================================

export const updateHotel = async (
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
        RESPONSE_MESSAGES.HOTEL.INVALID_ID
      );
    }


    // ============================================================
    // EXISTING HOTEL
    // ============================================================

    const existingHotel =
      await Hotel.findOne({
        _id: id,
        isActive: true,
      }).lean();


    if (!existingHotel) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.HOTEL.NOT_FOUND
      );
    }


    // ============================================================
    // ALLOWED FIELDS
    // ============================================================

    const allowedFields = [
      "name",
      "slug",

      "stateId",
      "cityId",

      "shortDescription",
      "description",

      "category",
      "starRating",

      "highlights",
      "amenities",

      "location",

      "rooms",

      "policies",

      "heroImage",
      "gallery",

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
    // NORMALIZE
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
          "Hotel name cannot be empty"
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
          "Hotel slug cannot be empty"
        );
      }


      updateData.slug =
        updateData.slug
          .trim()
          .toLowerCase();
    }


    // ============================================================
    // FINAL LOCATION
    // ============================================================

    const finalStateId =
      updateData.stateId ||
      existingHotel.stateId;


    const finalCityId =
      updateData.cityId ||
      existingHotel.cityId;


    // ============================================================
    // STATE
    // ============================================================

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
        isActive: true,
      }).lean();


    if (!state) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "State not found"
      );
    }


    // ============================================================
    // CITY
    // ============================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        finalCityId
      )
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid city ID"
      );
    }


    const city =
      await City.findOne({
        _id: finalCityId,
        stateId: finalStateId,
        isActive: true,
      }).lean();


    if (!city) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "City not found in the selected state"
      );
    }


    // ============================================================
    // DUPLICATE CHECK
    // ============================================================

    const duplicateConditions = [];


    if (updateData.slug) {

      duplicateConditions.push({
        slug:
          updateData.slug,
      });
    }


    if (updateData.name) {

      duplicateConditions.push({
        name:
          updateData.name,

        cityId:
          finalCityId,
      });
    }


    if (
      duplicateConditions.length
    ) {

      const duplicate =
        await Hotel.findOne({

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
          RESPONSE_MESSAGES.HOTEL.ALREADY_EXISTS
        );
      }
    }


    // ============================================================
    // HERO IMAGE
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
    // RELATIONS
    // ============================================================

    updateData.stateId =
      finalStateId;

    updateData.cityId =
      finalCityId;


    // ============================================================
    // STATUS
    // ============================================================

    if (
      updateData.status ===
      "published"
    ) {

      if (
        existingHotel.status !==
          "published" ||
        !existingHotel.publishedAt
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

    const updatedHotel =
      await Hotel.findOneAndUpdate(

        {
          _id: id,
          isActive: true,
        },

        {
          $set:
            updateData,
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
          "cityId",
          "name slug stateId"
        );


    if (!updatedHotel) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.HOTEL.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.HOTEL.UPDATED,
      updatedHotel
    );

  } catch (error) {

    console.error(
      "Update Hotel Error :",
      error
    );


    if (
      error.code === 11000
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.HOTEL.ALREADY_EXISTS
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
// DELETE HOTEL — SOFT DELETE
// ================================================================

export const deleteHotel = async (
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
        RESPONSE_MESSAGES.HOTEL.INVALID_ID
      );
    }


    const hotel =
      await Hotel.findOneAndUpdate(

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


    if (!hotel) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.HOTEL.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.HOTEL.DELETED,
      {
        id:
          hotel._id,
      }
    );

  } catch (error) {

    console.error(
      "Delete Hotel Error :",
      error
    );


    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};