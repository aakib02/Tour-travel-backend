import mongoose from "mongoose";

import Attraction from "../../models/attraction/index.js";
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

const sanitizeAttractionTicket = (att) => {
  if (!att) return att;
  if (att.ticket) {
    const {
      indianAdultPrice,
      indianChildPrice,
      foreignAdultPrice,
      foreignChildPrice,
      currency,
      ...cleanTicket
    } = att.ticket;
    return { ...att, ticket: cleanTicket };
  }
  return att;
};


// ================================================================
// CREATE ATTRACTION
// ================================================================

export const createAttraction = async (req, res) => {
  try {
    const {
      name,
      slug,

      stateId,
      cityId,

      shortDescription,
      description,
      history,

      category,
      subCategories,

      highlights,

      recommendedDuration,
      bestTimeToVisit,
      bestFor,

      visitingHours,

      ticket,

      location,

      heroImage,
      gallery,

      facilities,
      accessibility,

      visitorInformation,

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
        "Attraction name is required"
      );
    }


    if (!slug?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Attraction slug is required"
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
        "Attraction category is required"
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


    const heroMediaId = heroImage?.mediaId?._id || heroImage?.mediaId || heroImage?._id;
    if (
      heroMediaId &&
      !mongoose.Types.ObjectId.isValid(
        heroMediaId
      )
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid hero image media ID"
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
        stateId: stateId,
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
      slug.trim().toLowerCase();


    // ============================================================
    // DUPLICATE CHECK
    // ============================================================

    const existingAttraction =
      await Attraction.findOne({
        isActive: true,

        $or: [
          {
            slug: normalizedSlug,
          },

          {
            name: normalizedName,
            cityId,
          },
        ],
      }).lean();


    if (existingAttraction) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.ATTRACTION.ALREADY_EXISTS
      );
    }


    // ============================================================
    // CREATE
    // ============================================================

    const attraction =
      await Attraction.create({

        name:
          normalizedName,

        slug:
          normalizedSlug,

        stateId,

        cityId,

        shortDescription,
        description,
        history,

        category,
        subCategories,

        highlights,

        recommendedDuration,
        bestTimeToVisit,
        bestFor,

        visitingHours,

        ticket,

        location,

        heroImage,
        gallery,

        facilities,
        accessibility,

        visitorInformation,

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


    const populatedAttraction = await Attraction.findById(attraction._id)
      .populate("stateId", "name slug code region")
      .populate("cityId", "name slug stateId")
      .populate("heroImage.mediaId", "url secureUrl title alt originalName mimeType size")
      .populate("gallery.mediaId", "url secureUrl title alt originalName mimeType size")
      .lean();

    return sendResponse(
      res,
      HTTP_STATUS_CODES.CREATED,
      RESPONSE_MESSAGES.ATTRACTION.CREATED,
      sanitizeAttractionTicket(populatedAttraction || attraction)
    );

  } catch (error) {

    console.error(
      "Create Attraction Error :",
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
        `${duplicateField || "Attraction"} already exists`
      );
    }


    // ============================================================
    // VALIDATION ERROR
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
// GET ATTRACTIONS
//
// GET ALL:
// /api/admin/attractions
//
// SINGLE:
// /api/admin/attractions?id=ATTRACTION_ID
//
// FILTER EXAMPLES:
//
// ?cityId=...
// ?stateId=...
// ?category=fort
// ?isPopular=true
// ?isFeatured=true
// ?ticketRequired=true
// ?onlineBookingAvailable=true
// ?status=published
// ?search=amber
// ================================================================

export const getAttractions = async (req, res) => {
  try {

    const {
      id,

      page = 1,
      limit = 10,

      search = "",

      cityId,
      stateId,

      category,
      subCategory,

      bestFor,

      ticketRequired,
      onlineBookingAvailable,

      isPopular,
      isFeatured,

      status,

      isActive = "true",

      minDuration,
      maxDuration,

      minRating,

      sortBy = "sortOrder",
      sortOrder = "asc",
    } = req.query;


    // ============================================================
    // GET SINGLE ATTRACTION
    // ============================================================

    if (id) {

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          RESPONSE_MESSAGES.ATTRACTION.INVALID_ID
        );
      }


      const attraction =
        await Attraction.findById(id)
          .populate(
            "stateId",
            "name slug code region"
          )
          .populate(
            "cityId",
            "name slug stateId"
          )
          .populate(
            "heroImage.mediaId",
            "url secureUrl title alt originalName mimeType size"
          )
          .populate(
            "gallery.mediaId",
            "url secureUrl title alt originalName mimeType size"
          )
          .lean();


      if (!attraction) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.ATTRACTION.NOT_FOUND
        );
      }


      return sendResponse(
        res,
        HTTP_STATUS_CODES.OK,
        RESPONSE_MESSAGES.ATTRACTION.FETCHED_SINGLE,
        sanitizeAttractionTicket(attraction)
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
    // FILTER OBJECT
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
    // CITY FILTER
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
    // STATE FILTER
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
    // CATEGORY
    // ============================================================

    if (category) {
      filter.category =
        category.toLowerCase();
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
    // BEST FOR
    // ============================================================

    if (bestFor?.trim()) {

      filter.bestFor = {
        $in: [
          bestFor
            .trim()
            .toLowerCase(),
        ],
      };
    }


    // ============================================================
    // TICKET REQUIRED
    // ============================================================

    if (
      ticketRequired !==
      undefined
    ) {

      filter["ticket.required"] =
        ticketRequired === "true";
    }


    // ============================================================
    // ONLINE BOOKING
    // ============================================================

    if (
      onlineBookingAvailable !==
      undefined
    ) {

      filter[
        "ticket.onlineBookingAvailable"
      ] =
        onlineBookingAvailable ===
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
    // MIN RATING
    // ============================================================

    if (
      minRating !==
      undefined
    ) {

      const rating =
        Number(minRating);


      if (
        Number.isNaN(rating) ||
        rating < 0 ||
        rating > 5
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
        $gte: rating,
      };
    }


    // ============================================================
    // DURATION FILTER
    // ============================================================

    if (
      minDuration !==
      undefined ||
      maxDuration !==
      undefined
    ) {

      const min =
        minDuration !==
        undefined
          ? Number(minDuration)
          : undefined;


      const max =
        maxDuration !==
        undefined
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


      const durationFilter = {};


      if (min !== undefined) {
        durationFilter.$gte =
          min;
      }


      if (max !== undefined) {
        durationFilter.$lte =
          max;
      }


      filter[
        "recommendedDuration.minMinutes"
      ] = durationFilter;
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
          shortDescription:
            searchRegex,
        },

        {
          description:
            searchRegex,
        },

        {
          history:
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
      "rating.count",
      "stats.viewCount",
      "stats.reviewCount",
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
      attractions,
      total,
    ] = await Promise.all([

      Attraction.find(filter)
        .populate(
          "stateId",
          "name slug code region"
        )
        .populate(
          "cityId",
          "name slug stateId"
        )
        .populate(
          "heroImage.mediaId",
          "url secureUrl title alt originalName mimeType size"
        )
        .populate(
          "gallery.mediaId",
          "url secureUrl title alt originalName mimeType size"
        )
        .select("-ticket.indianAdultPrice -ticket.indianChildPrice -ticket.foreignAdultPrice -ticket.foreignChildPrice -ticket.currency")
        .sort({
          [safeSortBy]:
            safeSortOrder,
        })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Attraction.countDocuments(
        filter
      ),
    ]);


    // ============================================================
    // RESPONSE
    // ============================================================

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ATTRACTION.FETCHED,
      {
        attractions: attractions.map(sanitizeAttractionTicket),

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
      "Get Attractions Error :",
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
// UPDATE ATTRACTION
// ================================================================

export const updateAttraction = async (
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
        RESPONSE_MESSAGES.ATTRACTION.INVALID_ID
      );
    }


    // ============================================================
    // EXISTING ATTRACTION
    // ============================================================

    const existingAttraction =
      await Attraction.findOne({
        _id: id,
        isActive: true,
      }).lean();


    if (!existingAttraction) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.ATTRACTION.NOT_FOUND
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
      "history",

      "category",
      "subCategories",

      "highlights",

      "recommendedDuration",
      "bestTimeToVisit",
      "bestFor",

      "visitingHours",

      "ticket",

      "location",

      "heroImage",
      "gallery",

      "facilities",
      "accessibility",

      "visitorInformation",

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
          "Attraction name cannot be empty"
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
          "Attraction slug cannot be empty"
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
      existingAttraction.stateId;


    const finalCityId =
      updateData.cityId ||
      existingAttraction.cityId;


    // ============================================================
    // STATE VALIDATION
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
    // CITY VALIDATION
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
    // HERO IMAGE VALIDATION
    // ============================================================

    if (updateData.heroImage !== undefined) {
      const heroMediaId =
        updateData.heroImage?.mediaId?._id ||
        updateData.heroImage?.mediaId ||
        updateData.heroImage?._id;

      if (heroMediaId) {
        if (!mongoose.Types.ObjectId.isValid(heroMediaId)) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid hero image media ID"
          );
        }
        updateData.heroImage = {
          mediaId: heroMediaId,
          alt: updateData.heroImage.alt?.trim() || "",
          title: updateData.heroImage.title?.trim() || "",
        };
      } else {
        delete updateData.heroImage;
      }
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
        await Attraction.findOne({

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
          RESPONSE_MESSAGES.ATTRACTION.ALREADY_EXISTS
        );
      }
    }


    // ============================================================
    // SET RELATIONS
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
        existingAttraction.status !==
          "published" ||
        !existingAttraction.publishedAt
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

    const updatedAttraction =
      await Attraction.findOneAndUpdate(

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
          "heroImage.mediaId",
          "url secureUrl title alt originalName mimeType size"
        )
        .populate(
          "gallery.mediaId",
          "url secureUrl title alt originalName mimeType size"
        );


    if (!updatedAttraction) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.ATTRACTION.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ATTRACTION.UPDATED,
      sanitizeAttractionTicket(updatedAttraction?.toObject ? updatedAttraction.toObject() : updatedAttraction)
    );

  } catch (error) {

    console.error(
      "Update Attraction Error :",
      error
    );


    if (
      error.code === 11000
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.ATTRACTION.ALREADY_EXISTS
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
// DELETE ATTRACTION — SOFT DELETE
// ================================================================

export const deleteAttraction = async (
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
        RESPONSE_MESSAGES.ATTRACTION.INVALID_ID
      );
    }


    const attraction =
      await Attraction.findOneAndUpdate(

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


    if (!attraction) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.ATTRACTION.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ATTRACTION.DELETED,
      {
        id:
          attraction._id,
      }
    );

  } catch (error) {

    console.error(
      "Delete Attraction Error :",
      error
    );


    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};