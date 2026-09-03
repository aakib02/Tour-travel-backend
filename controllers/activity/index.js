import mongoose from "mongoose";

import Activity from "../../models/activity/index.js";
import State from "../../models/state/index.js";
import City from "../../models/city/index.js";
import Attraction from "../../models/attraction/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";

import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";


// ================================================================
// CREATE ACTIVITY
// ================================================================

export const createActivity = async (req, res) => {
  try {
    const {
      name,
      slug,

      stateId,
      cityId,
      attractionId,

      shortDescription,
      description,

      category,
      subCategories,

      highlights,
      suitableFor,
      requirements,
      importantInformation,

      duration,

      pricing,

      availability,

      participants,

      booking,

      location,

      heroImage,
      gallery,

      inclusions,
      exclusions,

      safety,

      facilities,

      faqs,

      rating,
      stats,

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
        "Activity name is required"
      );
    }


    if (!slug?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Activity slug is required"
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
        "Activity category is required"
      );
    }


    if (!duration?.minMinutes) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Minimum activity duration is required"
      );
    }


    if (!duration?.maxMinutes) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Maximum activity duration is required"
      );
    }


    if (!pricing?.priceFrom && pricing?.priceFrom !== 0) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Activity starting price is required"
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
      !mongoose.Types.ObjectId.isValid(cityId)
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid city ID"
      );
    }


    if (
      attractionId &&
      !mongoose.Types.ObjectId.isValid(attractionId)
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid attraction ID"
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
    // DURATION VALIDATION
    // ============================================================

    if (
      duration.minMinutes < 1 ||
      duration.maxMinutes < 1
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Activity duration must be at least 1 minute"
      );
    }


    if (
      duration.minMinutes >
      duration.maxMinutes
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Minimum duration cannot be greater than maximum duration"
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
    // CITY MUST BELONG TO STATE
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
    // CHECK ATTRACTION
    // OPTIONAL
    // ============================================================

    if (attractionId) {

      const attraction =
        await Attraction.findOne({
          _id: attractionId,
          cityId,
          stateId,
          isActive: true,
        }).lean();


      if (!attraction) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          "Attraction not found in the selected city and state"
        );
      }
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

    const existingActivity =
      await Activity.findOne({
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


    if (existingActivity) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.ACTIVITY.ALREADY_EXISTS
      );
    }


    // ============================================================
    // CREATE
    // ============================================================

    const activity =
      await Activity.create({

        name:
          normalizedName,

        slug:
          normalizedSlug,

        stateId,
        cityId,
        attractionId:
          attractionId || null,

        shortDescription,
        description,

        category,
        subCategories,

        highlights,
        suitableFor,
        requirements,
        importantInformation,

        duration,

        pricing,

        availability,

        participants,

        booking,

        location,

        heroImage,
        gallery,

        inclusions,
        exclusions,

        safety,

        facilities,

        faqs,

        rating,
        stats,

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
      RESPONSE_MESSAGES.ACTIVITY.CREATED,
      activity
    );

  } catch (error) {

    console.error(
      "Create Activity Error :",
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
        `${duplicateField || "Activity"} already exists`
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
// GET ACTIVITIES
//
// ALL:
// GET /api/admin/activities
//
// SINGLE:
// GET /api/admin/activities?id=ACTIVITY_ID
// ================================================================

export const getActivities = async (req, res) => {
  try {

    const {
      id,

      page = 1,
      limit = 10,

      search,

      stateId,
      cityId,
      attractionId,

      category,
      subCategory,

      suitableFor,

      minPrice,
      maxPrice,

      priceType,

      minDuration,
      maxDuration,

      availableDay,

      seasonalAvailability,

      advanceBookingRequired,

      minParticipants,
      maxParticipants,

      childrenAllowed,
      infantsAllowed,

      bookingAvailable,
      instantBooking,

      confirmationType,

      pickupAvailable,

      isPopular,
      isFeatured,

      status,

      isActive = "true",

      minRating,

      sortBy = "sortOrder",
      sortOrder = "asc",
    } = req.query;


    // ============================================================
    // SINGLE ACTIVITY
    // ============================================================

    if (id) {

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          RESPONSE_MESSAGES.ACTIVITY.INVALID_ID
        );
      }


      const activity =
        await Activity.findOne({
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
          .populate(
            "attractionId",
            "name slug category"
          )
          .lean();


      if (!activity) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.ACTIVITY.NOT_FOUND
        );
      }


      return sendResponse(
        res,
        HTTP_STATUS_CODES.OK,
        RESPONSE_MESSAGES.ACTIVITY.FETCHED_SINGLE,
        activity
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
    // ATTRACTION
    // ============================================================

    if (attractionId) {

      if (
        !mongoose.Types.ObjectId.isValid(
          attractionId
        )
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid attraction ID"
        );
      }


      filter.attractionId =
        attractionId;
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
    // SUB CATEGORY
    // ============================================================

    if (subCategory?.trim()) {

      filter.subCategories = {
        $in: [
          subCategory
            .trim()
            .toLowerCase(),
        ],
      };
    }


    // ============================================================
    // SUITABLE FOR
    // ============================================================

    if (suitableFor?.trim()) {

      filter.suitableFor = {
        $in: [
          suitableFor
            .trim()
            .toLowerCase(),
        ],
      };
    }


    // ============================================================
    // PRICE
    // ============================================================

    if (
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {

      const priceFilter = {};


      if (
        minPrice !== undefined
      ) {

        const value =
          Number(minPrice);


        if (
          Number.isNaN(value) ||
          value < 0
        ) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid minimum price"
          );
        }


        priceFilter.$gte =
          value;
      }


      if (
        maxPrice !== undefined
      ) {

        const value =
          Number(maxPrice);


        if (
          Number.isNaN(value) ||
          value < 0
        ) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid maximum price"
          );
        }


        priceFilter.$lte =
          value;
      }


      if (
        priceFilter.$gte !==
          undefined &&
        priceFilter.$lte !==
          undefined &&
        priceFilter.$gte >
          priceFilter.$lte
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Minimum price cannot be greater than maximum price"
        );
      }


      filter[
        "pricing.priceFrom"
      ] = priceFilter;
    }


    // ============================================================
    // PRICE TYPE
    // ============================================================

    if (priceType) {

      filter[
        "pricing.priceType"
      ] =
        priceType;
    }


    // ============================================================
    // DURATION
    // ============================================================

    if (
      minDuration !== undefined ||
      maxDuration !== undefined
    ) {

      const min =
        minDuration !== undefined
          ? Number(minDuration)
          : undefined;


      const max =
        maxDuration !== undefined
          ? Number(maxDuration)
          : undefined;


      if (
        min !== undefined &&
        (Number.isNaN(min) ||
          min < 1)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid minimum duration"
        );
      }


      if (
        max !== undefined &&
        (Number.isNaN(max) ||
          max < 1)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid maximum duration"
        );
      }


      if (
        min !== undefined &&
        max !== undefined &&
        min > max
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Minimum duration cannot be greater than maximum duration"
        );
      }


      if (min !== undefined) {

        filter[
          "duration.maxMinutes"
        ] = {
          $gte: min,
        };
      }


      if (max !== undefined) {

        filter[
          "duration.minMinutes"
        ] = {
          ...(filter[
            "duration.minMinutes"
          ] || {}),

          $lte: max,
        };
      }
    }


    // ============================================================
    // AVAILABLE DAY
    // ============================================================

    if (availableDay) {

      filter[
        "availability.availableDays"
      ] =
        availableDay
          .trim()
          .toLowerCase();
    }


    // ============================================================
    // SEASONAL AVAILABILITY
    // ============================================================

    if (
      seasonalAvailability !==
      undefined
    ) {

      filter[
        "availability.seasonalAvailability"
      ] =
        seasonalAvailability ===
        "true";
    }


    // ============================================================
    // ADVANCE BOOKING REQUIRED
    // ============================================================

    if (
      advanceBookingRequired !==
      undefined
    ) {

      filter[
        "availability.advanceBookingRequired"
      ] =
        advanceBookingRequired ===
        "true";
    }


    // ============================================================
    // PARTICIPANTS
    // ============================================================

    if (
      minParticipants !==
      undefined
    ) {

      const value =
        Number(minParticipants);


      if (
        Number.isNaN(value) ||
        value < 1
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid minimum participants"
        );
      }


      filter[
        "participants.max"
      ] = {
        $gte: value,
      };
    }


    if (
      maxParticipants !==
      undefined
    ) {

      const value =
        Number(maxParticipants);


      if (
        Number.isNaN(value) ||
        value < 1
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid maximum participants"
        );
      }


      filter[
        "participants.min"
      ] = {
        ...(filter[
          "participants.min"
        ] || {}),

        $lte: value,
      };
    }


    // ============================================================
    // CHILDREN
    // ============================================================

    if (
      childrenAllowed !==
      undefined
    ) {

      filter[
        "participants.childrenAllowed"
      ] =
        childrenAllowed ===
        "true";
    }


    // ============================================================
    // INFANTS
    // ============================================================

    if (
      infantsAllowed !==
      undefined
    ) {

      filter[
        "participants.infantsAllowed"
      ] =
        infantsAllowed ===
        "true";
    }


    // ============================================================
    // BOOKING AVAILABLE
    // ============================================================

    if (
      bookingAvailable !==
      undefined
    ) {

      filter[
        "booking.available"
      ] =
        bookingAvailable ===
        "true";
    }


    // ============================================================
    // INSTANT BOOKING
    // ============================================================

    if (
      instantBooking !==
      undefined
    ) {

      filter[
        "booking.instantBooking"
      ] =
        instantBooking ===
        "true";
    }


    // ============================================================
    // CONFIRMATION TYPE
    // ============================================================

    if (confirmationType) {

      filter[
        "booking.confirmationType"
      ] =
        confirmationType;
    }


    // ============================================================
    // PICKUP
    // ============================================================

    if (
      pickupAvailable !==
      undefined
    ) {

      filter[
        "location.pickupAvailable"
      ] =
        pickupAvailable ===
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
      "pricing.priceFrom",
      "duration.minMinutes",
      "rating.average",
      "rating.count",
      "stats.viewCount",
      "stats.bookingCount",
      "stats.reviewCount",
      "stats.packageCount",
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
      activities,
      total,
    ] = await Promise.all([

      Activity.find(filter)
        .populate(
          "stateId",
          "name slug code region"
        )
        .populate(
          "cityId",
          "name slug stateId"
        )
        .populate(
          "attractionId",
          "name slug category"
        )
        .sort({
          [safeSortBy]:
            safeSortOrder,
        })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Activity.countDocuments(
        filter
      ),
    ]);


    // ============================================================
    // RESPONSE
    // ============================================================

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ACTIVITY.FETCHED,
      {
        activities,

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
      "Get Activities Error :",
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
// UPDATE ACTIVITY
// ================================================================

export const updateActivity = async (
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
        RESPONSE_MESSAGES.ACTIVITY.INVALID_ID
      );
    }


    // ============================================================
    // EXISTING
    // ============================================================

    const existingActivity =
      await Activity.findOne({
        _id: id,
        isActive: true,
      }).lean();


    if (!existingActivity) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.ACTIVITY.NOT_FOUND
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
      "attractionId",

      "shortDescription",
      "description",

      "category",
      "subCategories",

      "highlights",
      "suitableFor",
      "requirements",
      "importantInformation",

      "duration",

      "pricing",

      "availability",

      "participants",

      "booking",

      "location",

      "heroImage",
      "gallery",

      "inclusions",
      "exclusions",

      "safety",

      "facilities",

      "faqs",

      "rating",
      "stats",

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
          "Activity name cannot be empty"
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
          "Activity slug cannot be empty"
        );
      }


      updateData.slug =
        updateData.slug
          .trim()
          .toLowerCase();
    }


    // ============================================================
    // FINAL LOCATION IDS
    // ============================================================

    const finalStateId =
      updateData.stateId ||
      existingActivity.stateId;


    const finalCityId =
      updateData.cityId ||
      existingActivity.cityId;


    const finalAttractionId =
      updateData.attractionId !==
      undefined
        ? updateData.attractionId
        : existingActivity.attractionId;


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
    // ATTRACTION
    // ============================================================

    if (finalAttractionId) {

      if (
        !mongoose.Types.ObjectId.isValid(
          finalAttractionId
        )
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid attraction ID"
        );
      }


      const attraction =
        await Attraction.findOne({
          _id:
            finalAttractionId,

          cityId:
            finalCityId,

          stateId:
            finalStateId,

          isActive:
            true,
        }).lean();


      if (!attraction) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          "Attraction not found in the selected city and state"
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
    // DURATION
    // ============================================================

    if (updateData.duration) {

      const min =
        updateData.duration.minMinutes;

      const max =
        updateData.duration.maxMinutes;


      if (
        min !== undefined &&
        min < 1
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Minimum duration must be at least 1 minute"
        );
      }


      if (
        max !== undefined &&
        max < 1
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Maximum duration must be at least 1 minute"
        );
      }


      if (
        min !== undefined &&
        max !== undefined &&
        min > max
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Minimum duration cannot be greater than maximum duration"
        );
      }
    }


    // ============================================================
    // DUPLICATE
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
        await Activity.findOne({
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
          RESPONSE_MESSAGES.ACTIVITY.ALREADY_EXISTS
        );
      }
    }


    // ============================================================
    // RELATIONS
    // ============================================================

    updateData.stateId =
      finalStateId;

    updateData.cityId =
      finalCityId;

    updateData.attractionId =
      finalAttractionId || null;


    // ============================================================
    // STATUS
    // ============================================================

    if (
      updateData.status ===
      "published"
    ) {

      if (
        existingActivity.status !==
          "published" ||
        !existingActivity.publishedAt
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

    const updatedActivity =
      await Activity.findOneAndUpdate(
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
        )
        .populate(
          "attractionId",
          "name slug category"
        );


    if (!updatedActivity) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.ACTIVITY.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ACTIVITY.UPDATED,
      updatedActivity
    );

  } catch (error) {

    console.error(
      "Update Activity Error :",
      error
    );


    if (
      error.code === 11000
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.ACTIVITY.ALREADY_EXISTS
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
// DELETE ACTIVITY — SOFT DELETE
// ================================================================

export const deleteActivity = async (
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
        RESPONSE_MESSAGES.ACTIVITY.INVALID_ID
      );
    }


    const activity =
      await Activity.findOneAndUpdate(
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


    if (!activity) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.ACTIVITY.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ACTIVITY.DELETED,
      {
        id:
          activity._id,
      }
    );

  } catch (error) {

    console.error(
      "Delete Activity Error :",
      error
    );


    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};