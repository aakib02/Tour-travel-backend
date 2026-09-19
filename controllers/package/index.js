import mongoose from "mongoose";

import Package from "../../models/package/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";

import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";


// ================================================================
// CREATE PACKAGE
// ================================================================

export const createPackage = async (req, res) => {
  try {

    const {
      title,
      slug,
      packageCode,

      tagline,
      shortDescription,
      description,

      packageType,
      themes,

      regions,
      countries,
      states,
      cities,
      attractions,
      activities,

      startLocation,
      endLocation,

      duration,

      highlights,

      itinerary,

      accommodation,

      transport,

      groupSize,

      difficulty,

      bestTimeToVisit,
      suitableMonths,

      inclusions,
      exclusions,

      importantInformation,
      termsAndConditions,

      heroImage,
      gallery,

      faqs,

      rating,

      seo,

      isFeatured,
      isPopular,
      isBestSeller,
      isRecommended,

      sortOrder,

      status,

      currency,
      destinations,
      overview,
      tourType,
      season,
      mealsPlan,
      mapEmbedUrl,
      included,
      excluded,
      hotels,
    } = req.body;


    // ============================================================
    // REQUIRED VALIDATION
    // ============================================================

    if (!title?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Package title is required"
      );
    }


    if (!slug?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Package slug is required"
      );
    }


    if (!packageCode?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Package code is required"
      );
    }


    if (!duration) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Package duration is required"
      );
    }


    if (
      duration.days === undefined ||
      duration.nights === undefined
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Package duration days and nights are required"
      );
    }


    // ============================================================
    // NORMALIZE
    // ============================================================

    const normalizedTitle =
      title.trim();

    const normalizedSlug =
      slug
        .trim()
        .toLowerCase();

    const normalizedPackageCode =
      packageCode
        .trim()
        .toUpperCase();


    // ============================================================
    // OBJECT ID VALIDATION
    // ============================================================

    const objectIdArrays = [
      {
        name: "countries",
        value: countries,
      },
      {
        name: "states",
        value: states,
      },
      {
        name: "cities",
        value: cities,
      },
      {
        name: "attractions",
        value: attractions,
      },
      {
        name: "activities",
        value: activities,
      },
    ];


    for (const item of objectIdArrays) {

      if (!item.value) {
        continue;
      }


      if (!Array.isArray(item.value)) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          `${item.name} must be an array`
        );
      }


      const invalidId =
        item.value.find(
          (value) =>
            !mongoose.Types.ObjectId.isValid(
              value
            )
        );


      if (invalidId) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          `Invalid ${item.name} ID`
        );
      }
    }


    // ============================================================
    // HERO IMAGE VALIDATION
    // ============================================================

    if (
      !heroImage?.mediaId
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Hero image media ID is required"
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
    // DUPLICATE CHECK
    // ============================================================

    const existingPackage =
      await Package.findOne({
        $or: [
          {
            slug:
              normalizedSlug,
          },

          {
            packageCode:
              normalizedPackageCode,
          },
        ],
      }).lean();


    if (existingPackage) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.PACKAGE.ALREADY_EXISTS
      );
    }


    // ============================================================
    // PUBLISHED DATE
    // ============================================================

    let publishedAt = null;

    if (status === "published") {
      publishedAt =
        new Date();
    }


    // ============================================================
    // CREATE
    // ============================================================

    const packageData = {

      title:
        normalizedTitle,

      slug:
        normalizedSlug,

      packageCode:
        normalizedPackageCode,

      tagline,

      shortDescription,

      description,

      packageType:
        packageType || "private",

      themes,

      regions,

      countries,

      states,

      cities,

      attractions,

      activities,

      startLocation,

      endLocation,

      duration,

      highlights,

      itinerary,

      accommodation,

      transport,

      groupSize,

      difficulty,

      bestTimeToVisit,

      suitableMonths,

      inclusions,

      exclusions,

      importantInformation,

      termsAndConditions,

      heroImage,

      gallery,

      faqs,

      rating,

      seo,

      currency:
        currency || "INR",

      destinations:
        destinations || [],

      overview:
        overview || description || tagline || "",

      tourType:
        tourType || packageType || "Private",

      season:
        season || [],

      mealsPlan:
        mealsPlan || "",

      mapEmbedUrl:
        mapEmbedUrl || "",

      included:
        included || inclusions || [],

      excluded:
        excluded || exclusions || [],

      hotels:
        hotels || [],

      isFeatured:
        isFeatured ?? false,

      isPopular:
        isPopular ?? false,

      isBestSeller:
        isBestSeller ?? false,

      isRecommended:
        isRecommended ?? false,

      sortOrder:
        sortOrder ?? 0,

      status:
        status || "draft",

      publishedAt,

      isActive:
        true,

      createdBy:
        req.user.id,

      updatedBy:
        req.user.id,
    };


    const createdPackage =
      await Package.create(
        packageData
      );


    return sendResponse(
      res,
      HTTP_STATUS_CODES.CREATED,
      RESPONSE_MESSAGES.PACKAGE.CREATED,
      createdPackage
    );

  } catch (error) {

    console.error(
      "Create Package Error :",
      error
    );


    // ============================================================
    // DUPLICATE
    // ============================================================

    if (
      error.code === 11000
    ) {

      const field =
        Object.keys(
          error.keyPattern || {}
        )[0];


      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        `${field || "Package"} already exists`
      );
    }


    // ============================================================
    // VALIDATION
    // ============================================================

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {

      const errors =
        Object.values(
          error.errors
        ).map(
          (err) =>
            err.message
        );


      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        errors
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
// GET PACKAGES
//
// ALL:
// GET /api/packages
//
// SINGLE:
// GET /api/packages?id=PACKAGE_ID
// ================================================================

export const getPackages = async (
  req,
  res
) => {

  try {

    const {

      id,

      page = 1,
      limit = 12,

      search,

      packageType,

      theme,

      themes,

      region,
      regions,

      countryId,
      country,

      stateId,
      state,

      cityId,
      city,

      attractionId,
      activityId,

      minDays,
      maxDays,

      days,

      minNights,
      maxNights,

      difficulty,

      month,

      suitableMonth,

      minGroupSize,
      maxGroupSize,

      minRating,
      maxRating,

      isFeatured,
      isPopular,
      isBestSeller,
      isRecommended,

      status = "published",

      isActive = "true",

      startCityId,
      endCityId,

      mealPlan,

      transportIncluded,

      airportPickup,
      airportDrop,

      railwayPickup,
      railwayDrop,

      intercityTransfer,
      localSightseeing,

      sortBy = "sortOrder",
      sortOrder = "asc",

    } = req.query;


    // ============================================================
    // GET SINGLE PACKAGE
    // ============================================================

    if (id) {

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          RESPONSE_MESSAGES.PACKAGE.INVALID_ID
        );
      }


      const singleFilter = { _id: id };
      if (isActive !== "all") {
        singleFilter.isActive = isActive === "true";
      }

      const packageData =
        await Package.findOne(singleFilter)
          .populate(
            "countries",
            "name slug code"
          )
          .populate(
            "states",
            "name slug code region"
          )
          .populate(
            "cities",
            "name slug"
          )
          .populate(
            "attractions",
            "name slug"
          )
          .populate(
            "activities",
            "name slug"
          )
          .populate(
            "startLocation.cityId",
            "name slug"
          )
          .populate(
            "endLocation.cityId",
            "name slug"
          )
          .populate(
            "itinerary.cityId",
            "name slug"
          )
          .populate({
            path: "itinerary.attractions",
            select: "name slug category rating heroImage shortDescription",
            populate: {
              path: "heroImage.mediaId",
              select: "name url secureUrl alt",
            },
          })
          .populate({
            path: "itinerary.activities",
            select: "name slug category duration rating heroImage shortDescription",
            populate: {
              path: "heroImage.mediaId",
              select: "name url secureUrl alt",
            },
          })
          .populate({
            path: "itinerary.hotel.hotelId",
            select: "name slug category starRating heroImage shortDescription address",
            populate: {
              path: "heroImage.mediaId",
              select: "name url secureUrl alt",
            },
          })
          .populate(
            "itinerary.transport.vehicleId",
            "name slug type seatingCapacity"
          )
          .populate({
            path: "accommodation.hotelId",
            select: "name slug category starRating heroImage shortDescription address",
            populate: {
              path: "heroImage.mediaId",
              select: "name url secureUrl alt",
            },
          })
          .populate(
            "transport.vehicles",
            "name slug type seatingCapacity"
          )
          .populate(
            "heroImage.mediaId",
            "name url secureUrl alt format width height"
          )
          .populate(
            "gallery.mediaId",
            "name url secureUrl alt format width height"
          )
          .lean();


      if (!packageData) {

        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.PACKAGE.NOT_FOUND
        );
      }


      return sendResponse(
        res,
        HTTP_STATUS_CODES.OK,
        RESPONSE_MESSAGES.PACKAGE.FETCHED_SINGLE,
        packageData
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
          Number(limit) || 12,
          1
        ),
        100
      );


    const skip =
      (currentPage - 1) *
      perPage;


    // ============================================================
    // BASE FILTER
    // ============================================================

    const filter = {};


    // ============================================================
    // ACTIVE
    // ============================================================

    if (
      isActive !== "all"
    ) {

      filter.isActive =
        isActive === "true";
    }


    // ============================================================
    // STATUS
    // ============================================================

    if (
      status &&
      status !== "all"
    ) {

      const allowedStatuses = [
        "draft",
        "published",
        "archived",
      ];


      if (
        !allowedStatuses.includes(
          status
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid package status"
        );
      }


      filter.status =
        status;
    }


    // ============================================================
    // PACKAGE TYPE
    // ============================================================

    if (packageType) {

      const allowedTypes = [
        "fixed-departure",
        "private",
        "group",
        "customizable",
        "honeymoon",
        "family",
        "luxury",
      ];


      if (
        !allowedTypes.includes(
          packageType
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid package type"
        );
      }


      filter.packageType =
        packageType;
    }


    // ============================================================
    // THEMES
    // ============================================================

    if (theme) {

      filter.themes =
        theme
          .trim()
          .toLowerCase();
    }


    if (themes) {

      const themeList =
        themes
          .split(",")
          .map(
            (item) =>
              item
                .trim()
                .toLowerCase()
          )
          .filter(Boolean);


      if (themeList.length) {

        filter.themes = {
          $all:
            themeList,
        };
      }
    }


    // ============================================================
    // REGION
    // ============================================================

    if (region) {

      filter.regions =
        region
          .trim()
          .toLowerCase();
    }


    if (regions) {

      const regionList =
        regions
          .split(",")
          .map(
            (item) =>
              item
                .trim()
                .toLowerCase()
          )
          .filter(Boolean);


      if (regionList.length) {

        filter.regions = {
          $in:
            regionList,
        };
      }
    }


    // ============================================================
    // COUNTRY
    // ============================================================

    if (countryId || country) {

      const value =
        countryId || country;


      if (
        !mongoose.Types.ObjectId.isValid(
          value
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid country ID"
        );
      }


      filter.countries =
        value;
    }


    // ============================================================
    // STATE
    // ============================================================

    if (stateId || state) {

      const value =
        stateId || state;


      if (
        !mongoose.Types.ObjectId.isValid(
          value
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid state ID"
        );
      }


      filter.states =
        value;
    }


    // ============================================================
    // CITY
    // ============================================================

    if (cityId || city) {

      const value =
        cityId || city;


      if (
        !mongoose.Types.ObjectId.isValid(
          value
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid city ID"
        );
      }


      filter.cities =
        value;
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


      filter.attractions =
        attractionId;
    }


    // ============================================================
    // ACTIVITY
    // ============================================================

    if (activityId) {

      if (
        !mongoose.Types.ObjectId.isValid(
          activityId
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid activity ID"
        );
      }


      filter.activities =
        activityId;
    }


    // ============================================================
    // START CITY
    // ============================================================

    if (startCityId) {

      if (
        !mongoose.Types.ObjectId.isValid(
          startCityId
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid start city ID"
        );
      }


      filter[
        "startLocation.cityId"
      ] =
        startCityId;
    }


    // ============================================================
    // END CITY
    // ============================================================

    if (endCityId) {

      if (
        !mongoose.Types.ObjectId.isValid(
          endCityId
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid end city ID"
        );
      }


      filter[
        "endLocation.cityId"
      ] =
        endCityId;
    }


    // ============================================================
    // EXACT DAYS
    // ============================================================

    if (days !== undefined) {

      const value =
        Number(days);


      if (
        Number.isNaN(value) ||
        value < 1
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid days"
        );
      }


      filter[
        "duration.days"
      ] =
        value;
    }


    // ============================================================
    // DAYS RANGE
    // ============================================================

    if (
      minDays !== undefined ||
      maxDays !== undefined
    ) {

      const daysFilter = {};


      if (
        minDays !== undefined
      ) {

        const value =
          Number(minDays);


        if (
          Number.isNaN(value) ||
          value < 1
        ) {

          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid minimum days"
          );
        }


        daysFilter.$gte =
          value;
      }


      if (
        maxDays !== undefined
      ) {

        const value =
          Number(maxDays);


        if (
          Number.isNaN(value) ||
          value < 1
        ) {

          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid maximum days"
          );
        }


        daysFilter.$lte =
          value;
      }


      if (
        daysFilter.$gte !== undefined &&
        daysFilter.$lte !== undefined &&
        daysFilter.$gte >
          daysFilter.$lte
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Minimum days cannot be greater than maximum days"
        );
      }


      filter[
        "duration.days"
      ] =
        daysFilter;
    }


    // ============================================================
    // NIGHTS RANGE
    // ============================================================

    if (
      minNights !== undefined ||
      maxNights !== undefined
    ) {

      const nightsFilter = {};


      if (
        minNights !== undefined
      ) {

        const value =
          Number(minNights);


        if (
          Number.isNaN(value) ||
          value < 0
        ) {

          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid minimum nights"
          );
        }


        nightsFilter.$gte =
          value;
      }


      if (
        maxNights !== undefined
      ) {

        const value =
          Number(maxNights);


        if (
          Number.isNaN(value) ||
          value < 0
        ) {

          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid maximum nights"
          );
        }


        nightsFilter.$lte =
          value;
      }


      filter[
        "duration.nights"
      ] =
        nightsFilter;
    }


    // ============================================================
    // DIFFICULTY
    // ============================================================

    if (difficulty) {

      const allowedDifficulty = [
        "easy",
        "moderate",
        "challenging",
        "difficult",
      ];


      if (
        !allowedDifficulty.includes(
          difficulty
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid package difficulty"
        );
      }


      filter.difficulty =
        difficulty;
    }


    // ============================================================
    // MONTH
    // ============================================================

    if (
      month !== undefined ||
      suitableMonth !== undefined
    ) {

      const monthValue =
        Number(
          month ||
          suitableMonth
        );


      if (
        Number.isNaN(
          monthValue
        ) ||
        monthValue < 1 ||
        monthValue > 12
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Month must be between 1 and 12"
        );
      }


      filter.suitableMonths =
        monthValue;
    }


    // ============================================================
    // GROUP SIZE
    // ============================================================

    if (
      minGroupSize !== undefined
    ) {

      const value =
        Number(minGroupSize);


      if (
        Number.isNaN(value) ||
        value < 1
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid minimum group size"
        );
      }


      filter[
        "groupSize.min"
      ] = {
        $gte: value,
      };
    }


    if (
      maxGroupSize !== undefined
    ) {

      const value =
        Number(maxGroupSize);


      if (
        Number.isNaN(value) ||
        value < 1
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid maximum group size"
        );
      }


      filter[
        "groupSize.max"
      ] = {
        $lte: value,
      };
    }


    // ============================================================
    // RATING
    // ============================================================

    if (
      minRating !== undefined ||
      maxRating !== undefined
    ) {

      const ratingFilter = {};


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


        ratingFilter.$gte =
          value;
      }


      if (
        maxRating !== undefined
      ) {

        const value =
          Number(maxRating);


        if (
          Number.isNaN(value) ||
          value < 0 ||
          value > 5
        ) {

          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid maximum rating"
          );
        }


        ratingFilter.$lte =
          value;
      }


      filter[
        "rating.average"
      ] =
        ratingFilter;
    }


    // ============================================================
    // MEAL PLAN
    // ============================================================

    if (mealPlan) {

      const allowedMealPlans = [
        "room_only",
        "breakfast",
        "half_board",
        "full_board",
        "all_inclusive",
      ];


      if (
        !allowedMealPlans.includes(
          mealPlan
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid meal plan"
        );
      }


      filter[
        "accommodation.mealPlan"
      ] =
        mealPlan;
    }


    // ============================================================
    // TRANSPORT FILTERS
    // ============================================================

    const transportBooleanFilters = [
      {
        query:
          "transportIncluded",
        field:
          "transport.included",
      },

      {
        query:
          "airportPickup",
        field:
          "transport.airportPickup",
      },

      {
        query:
          "airportDrop",
        field:
          "transport.airportDrop",
      },

      {
        query:
          "railwayPickup",
        field:
          "transport.railwayPickup",
      },

      {
        query:
          "railwayDrop",
        field:
          "transport.railwayDrop",
      },

      {
        query:
          "intercityTransfer",
        field:
          "transport.intercityTransfer",
      },

      {
        query:
          "localSightseeing",
        field:
          "transport.localSightseeing",
      },
    ];


    for (
      const item of
      transportBooleanFilters
    ) {

      if (
        req.query[
          item.query
        ] !== undefined
      ) {

        filter[item.field] =
          req.query[
            item.query
          ] === "true";
      }
    }


    // ============================================================
    // DISCOVERY FILTERS
    // ============================================================

    const discoveryFilters = [
      "isFeatured",
      "isPopular",
      "isBestSeller",
      "isRecommended",
    ];


    for (
      const field of
      discoveryFilters
    ) {

      if (
        req.query[field] !==
        undefined
      ) {

        filter[field] =
          req.query[field] ===
          "true";
      }
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
          title:
            searchRegex,
        },

        {
          tagline:
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
          inclusions:
            searchRegex,
        },

        {
          exclusions:
            searchRegex,
        },

        {
          importantInformation:
            searchRegex,
        },

        {
          "startLocation.name":
            searchRegex,
        },

        {
          "endLocation.name":
            searchRegex,
        },
      ];
    }


    // ============================================================
    // SORTING
    // ============================================================

    const allowedSortFields = [
      "title",
      "createdAt",
      "updatedAt",
      "sortOrder",

      "duration.days",
      "duration.nights",

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
      packages,
      total,
    ] = await Promise.all([

      Package.find(filter)

        .populate(
          "countries",
          "name slug code"
        )

        .populate(
          "states",
          "name slug code region"
        )

        .populate(
          "cities",
          "name slug"
        )

        .populate(
          "attractions",
          "name slug"
        )

        .populate(
          "activities",
          "name slug"
        )

        .populate(
          "startLocation.cityId",
          "name slug"
        )

        .populate(
          "endLocation.cityId",
          "name slug"
        )
        .populate(
          "itinerary.cityId",
          "name slug"
        )
        .populate({
          path: "itinerary.attractions",
          select: "name slug category rating heroImage shortDescription",
          populate: {
            path: "heroImage.mediaId",
            select: "name url secureUrl alt",
          },
        })
        .populate({
          path: "itinerary.activities",
          select: "name slug category duration rating heroImage shortDescription",
          populate: {
            path: "heroImage.mediaId",
            select: "name url secureUrl alt",
          },
        })
        .populate({
          path: "itinerary.hotel.hotelId",
          select: "name slug category starRating heroImage shortDescription address",
          populate: {
            path: "heroImage.mediaId",
            select: "name url secureUrl alt",
          },
        })
        .populate({
          path: "accommodation.hotelId",
          select: "name slug category starRating heroImage shortDescription address",
          populate: {
            path: "heroImage.mediaId",
            select: "name url secureUrl alt",
          },
        })
        .populate(
          "heroImage.mediaId",
          "name url secureUrl alt format width height"
        )
        .populate(
          "gallery.mediaId",
          "name url secureUrl alt format width height"
        )

        .sort({
          [safeSortBy]:
            safeSortOrder,
        })

        .skip(skip)

        .limit(perPage)

        .lean(),

      Package.countDocuments(
        filter
      ),
    ]);


    // ============================================================
    // RESPONSE
    // ============================================================

    const totalPages =
      Math.ceil(
        total / perPage
      );


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.PACKAGE.FETCHED,
      {
        packages,

        pagination: {
          total,

          page:
            currentPage,

          limit:
            perPage,

          totalPages,

          hasNextPage:
            currentPage <
            totalPages,

          hasPreviousPage:
            currentPage > 1,
        },
      }
    );

  } catch (error) {

    console.error(
      "Get Packages Error :",
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
// UPDATE PACKAGE
// ================================================================

export const updatePackage = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;


    // ============================================================
    // ID
    // ============================================================

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.PACKAGE.INVALID_ID
      );
    }


    // ============================================================
    // EXISTING
    // ============================================================

    const existingPackage =
      await Package.findOne({
        _id: id,
      }).lean();


    if (!existingPackage) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.PACKAGE.NOT_FOUND
      );
    }


    // ============================================================
    // ALLOWED FIELDS
    // ============================================================

    const allowedFields = [

      "title",
      "slug",
      "packageCode",

      "tagline",
      "shortDescription",
      "description",

      "packageType",
      "themes",

      "regions",
      "countries",
      "states",
      "cities",
      "attractions",
      "activities",

      "startLocation",
      "endLocation",

      "duration",

      "highlights",

      "itinerary",

      "accommodation",

      "transport",

      "groupSize",

      "difficulty",

      "bestTimeToVisit",
      "suitableMonths",

      "inclusions",
      "exclusions",

      "importantInformation",
      "termsAndConditions",

      "heroImage",
      "gallery",

      "faqs",

      "rating",

      "seo",

      "isFeatured",
      "isPopular",
      "isBestSeller",
      "isRecommended",

      "sortOrder",

      "status",
      "isActive",
      "currency",
      "destinations",
      "overview",
      "tourType",
      "season",
      "mealsPlan",
      "mapEmbedUrl",
      "included",
      "excluded",
      "hotels",
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

    if (updateData.isActive !== undefined) {
      const activeBool = updateData.isActive === true || updateData.isActive === "true";
      updateData.isActive = activeBool;
      updateData.deletedAt = activeBool ? null : new Date();
    }


    // ============================================================
    // NORMALIZE
    // ============================================================

    if (
      updateData.title !==
      undefined
    ) {

      if (
        !updateData.title.trim()
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Package title cannot be empty"
        );
      }


      updateData.title =
        updateData.title.trim();
    }


    if (
      updateData.slug !==
      undefined
    ) {

      updateData.slug =
        updateData.slug
          .trim()
          .toLowerCase();
    }


    if (
      updateData.packageCode !==
      undefined
    ) {

      updateData.packageCode =
        updateData.packageCode
          .trim()
          .toUpperCase();
    }


    // ============================================================
    // HERO IMAGE
    // ============================================================

    if (
      updateData.heroImage !==
      undefined
    ) {

      if (
        !updateData.heroImage?.mediaId
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Hero image media ID is required"
        );
      }


      if (
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
    }


    // ============================================================
    // DUPLICATE CHECK
    // ============================================================

    const duplicateConditions = [];


    if (
      updateData.slug
    ) {

      duplicateConditions.push({
        slug:
          updateData.slug,
      });
    }


    if (
      updateData.packageCode
    ) {

      duplicateConditions.push({
        packageCode:
          updateData.packageCode,
      });
    }


    if (
      duplicateConditions.length
    ) {

      const duplicate =
        await Package.findOne({

          _id: {
            $ne: id,
          },

          $or:
            duplicateConditions,

        }).lean();


      if (duplicate) {

        return sendError(
          res,
          HTTP_STATUS_CODES.CONFLICT,
          RESPONSE_MESSAGES.PACKAGE.ALREADY_EXISTS
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

      if (
        existingPackage.status !==
          "published" ||
        !existingPackage.publishedAt
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

    const updatedPackage =
      await Package.findOneAndUpdate(

        {
          _id: id,
        },

        {
          $set:
            updateData,
        },

        {
          returnDocument: "after",
          new: true,
          runValidators: true,
        }
      );


    if (!updatedPackage) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.PACKAGE.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.PACKAGE.UPDATED,
      updatedPackage
    );

  } catch (error) {

    console.error(
      "Update Package Error :",
      error
    );


    if (
      error.code === 11000
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.PACKAGE.ALREADY_EXISTS
      );
    }


    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {

      const errors =
        Object.values(
          error.errors
        ).map(
          (err) =>
            err.message
        );


      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        errors
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
// DELETE PACKAGE
// SOFT DELETE
// ================================================================

export const deletePackage = async (
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
        RESPONSE_MESSAGES.PACKAGE.INVALID_ID
      );
    }


    const deletedPackage =
      await Package.findOneAndUpdate(

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


    if (!deletedPackage) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.PACKAGE.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.PACKAGE.DELETED,
      {
        id:
          deletedPackage._id,
      }
    );

  } catch (error) {

    console.error(
      "Delete Package Error :",
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
// UPDATE PACKAGE STATUS (ACTIVE / INACTIVE & PUBLISHING STATUS)
// ================================================================

export const updatePackageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.PACKAGE.INVALID_ID
      );
    }

    const pkg = await Package.findById(id);

    if (!pkg) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.PACKAGE.NOT_FOUND
      );
    }

    // 1. If explicit isActive is provided
    if (isActive !== undefined) {
      const activeBool = isActive === true || isActive === "true";
      pkg.isActive = activeBool;
      if (activeBool) {
        pkg.deletedAt = null;
      } else {
        pkg.deletedAt = new Date();
      }
    }

    // 2. If status is provided
    if (status !== undefined) {
      const allowedStatuses = ["draft", "published", "archived"];
      if (!allowedStatuses.includes(status)) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid package status. Allowed values: draft, published, archived"
        );
      }
      pkg.status = status;
      if (status === "published" && !pkg.publishedAt) {
        pkg.publishedAt = new Date();
      }
    }

    // 3. If neither isActive nor status is explicitly passed, toggle isActive
    if (isActive === undefined && status === undefined) {
      pkg.isActive = !pkg.isActive;
      if (pkg.isActive) {
        pkg.deletedAt = null;
      } else {
        pkg.deletedAt = new Date();
      }
    }

    if (req.user?.id) {
      pkg.updatedBy = req.user.id;
    }

    await pkg.save();

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.PACKAGE.STATUS_UPDATED,
      pkg
    );
  } catch (error) {
    console.error("Update Package Status Error :", error);

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ================================================================
// HARD DELETE PACKAGE (PERMANENT DELETE)
// ================================================================

export const hardDeletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.PACKAGE.INVALID_ID
      );
    }

    const deletedPackage = await Package.findByIdAndDelete(id);

    if (!deletedPackage) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.PACKAGE.NOT_FOUND
      );
    }

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.PACKAGE.HARD_DELETED,
      {
        id: deletedPackage._id,
        title: deletedPackage.title,
      }
    );
  } catch (error) {
    console.error("Hard Delete Package Error :", error);

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};