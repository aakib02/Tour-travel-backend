import mongoose from "mongoose";

import Vehicle from "../../models/vehicle/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";

import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";


// ================================================================
// CREATE VEHICLE
// ================================================================

export const createVehicle = async (req, res) => {
  try {
    const {
      name,
      slug,

      type,
      category,

      seatingCapacity,
      luggageCapacity,

      ac,
      fuelType,
      transmission,
      modelYear,

      driverIncluded,
      driverType,
      driverFeatures,

      features,
      amenities,

      shortDescription,
      description,

      service,

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
        "Vehicle name is required"
      );
    }


    if (!slug?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Vehicle slug is required"
      );
    }


    if (!type) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Vehicle type is required"
      );
    }


    if (!seatingCapacity) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Seating capacity is required"
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

    const existingVehicle =
      await Vehicle.findOne({
        $or: [
          {
            slug:
              normalizedSlug,
          },

          {
            name:
              normalizedName,
          },
        ],
      }).lean();


    if (existingVehicle) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.VEHICLE.ALREADY_EXISTS
      );
    }


    // ============================================================
    // CREATE
    // ============================================================

    const vehicle =
      await Vehicle.create({

        name:
          normalizedName,

        slug:
          normalizedSlug,

        type,

        category:
          category || "standard",

        seatingCapacity,

        luggageCapacity,

        ac:
          ac ?? true,

        fuelType:
          fuelType || "diesel",

        transmission:
          transmission || "not-specified",

        modelYear,

        driverIncluded:
          driverIncluded ?? true,

        driverType:
          driverType || "professional",

        driverFeatures,

        features,

        amenities,

        shortDescription,

        description,

        service,

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
      RESPONSE_MESSAGES.VEHICLE.CREATED,
      vehicle
    );

  } catch (error) {

    console.error(
      "Create Vehicle Error :",
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
        `${duplicateField || "Vehicle"} already exists`
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
// GET VEHICLES
//
// ALL:
// GET /api/admin/vehicles
//
// SINGLE:
// GET /api/admin/vehicles?id=VEHICLE_ID
// ================================================================

export const getVehicles = async (req, res) => {
  try {

    const {
      id,

      page = 1,
      limit = 10,

      search,

      type,
      category,

      minSeats,
      maxSeats,

      fuelType,
      transmission,

      ac,

      driverIncluded,
      driverType,

      serviceAvailable,

      airportTransfer,
      intercityTravel,
      localSightseeing,
      outstation,
      oneWay,
      roundTrip,

      isPopular,
      isFeatured,

      status,

      isActive = "true",

      minRating,

      sortBy = "sortOrder",
      sortOrder = "asc",
    } = req.query;


    // ============================================================
    // GET SINGLE VEHICLE
    // ============================================================

    if (id) {

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          RESPONSE_MESSAGES.VEHICLE.INVALID_ID
        );
      }


      const vehicle =
        await Vehicle.findOne({
          _id: id,
          isActive: true,
        }).lean();


      if (!vehicle) {
        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.VEHICLE.NOT_FOUND
        );
      }


      return sendResponse(
        res,
        HTTP_STATUS_CODES.OK,
        RESPONSE_MESSAGES.VEHICLE.FETCHED_SINGLE,
        vehicle
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
    // TYPE
    // ============================================================

    if (type) {
      filter.type =
        type
          .trim()
          .toLowerCase();
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
    // SEATING CAPACITY
    // ============================================================

    if (
      minSeats !== undefined
    ) {

      const value =
        Number(minSeats);


      if (
        Number.isNaN(value) ||
        value < 1
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid minimum seating capacity"
        );
      }


      filter.seatingCapacity = {
        $gte: value,
      };
    }


    if (
      maxSeats !== undefined
    ) {

      const value =
        Number(maxSeats);


      if (
        Number.isNaN(value) ||
        value < 1
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid maximum seating capacity"
        );
      }


      filter.seatingCapacity = {
        ...(filter.seatingCapacity || {}),
        $lte: value,
      };
    }


    if (
      minSeats !== undefined &&
      maxSeats !== undefined &&
      Number(minSeats) >
        Number(maxSeats)
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Minimum seating capacity cannot be greater than maximum seating capacity"
      );
    }


    // ============================================================
    // FUEL TYPE
    // ============================================================

    if (fuelType) {

      filter.fuelType =
        fuelType
          .trim()
          .toLowerCase();
    }


    // ============================================================
    // TRANSMISSION
    // ============================================================

    if (transmission) {

      filter.transmission =
        transmission
          .trim()
          .toLowerCase();
    }


    // ============================================================
    // AC
    // ============================================================

    if (ac !== undefined) {

      filter.ac =
        ac === "true";
    }


    // ============================================================
    // DRIVER INCLUDED
    // ============================================================

    if (
      driverIncluded !==
      undefined
    ) {

      filter.driverIncluded =
        driverIncluded === "true";
    }


    // ============================================================
    // DRIVER TYPE
    // ============================================================

    if (driverType) {

      filter.driverType =
        driverType
          .trim()
          .toLowerCase();
    }


    // ============================================================
    // SERVICE AVAILABLE
    // ============================================================

    if (
      serviceAvailable !==
      undefined
    ) {

      filter[
        "service.available"
      ] =
        serviceAvailable ===
        "true";
    }


    // ============================================================
    // AIRPORT TRANSFER
    // ============================================================

    if (
      airportTransfer !==
      undefined
    ) {

      filter[
        "service.airportTransfer"
      ] =
        airportTransfer ===
        "true";
    }


    // ============================================================
    // INTERCITY
    // ============================================================

    if (
      intercityTravel !==
      undefined
    ) {

      filter[
        "service.intercityTravel"
      ] =
        intercityTravel ===
        "true";
    }


    // ============================================================
    // LOCAL SIGHTSEEING
    // ============================================================

    if (
      localSightseeing !==
      undefined
    ) {

      filter[
        "service.localSightseeing"
      ] =
        localSightseeing ===
        "true";
    }


    // ============================================================
    // OUTSTATION
    // ============================================================

    if (
      outstation !==
      undefined
    ) {

      filter[
        "service.outstation"
      ] =
        outstation ===
        "true";
    }


    // ============================================================
    // ONE WAY
    // ============================================================

    if (
      oneWay !==
      undefined
    ) {

      filter[
        "service.oneWay"
      ] =
        oneWay ===
        "true";
    }


    // ============================================================
    // ROUND TRIP
    // ============================================================

    if (
      roundTrip !==
      undefined
    ) {

      filter[
        "service.roundTrip"
      ] =
        roundTrip ===
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
          features:
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
      "seatingCapacity",
      "modelYear",
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
      vehicles,
      total,
    ] = await Promise.all([

      Vehicle.find(filter)
        .sort({
          [safeSortBy]:
            safeSortOrder,
        })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Vehicle.countDocuments(
        filter
      ),
    ]);


    // ============================================================
    // RESPONSE
    // ============================================================

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.VEHICLE.FETCHED,
      {
        vehicles,

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
      "Get Vehicles Error :",
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
// UPDATE VEHICLE
// ================================================================

export const updateVehicle = async (
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
        RESPONSE_MESSAGES.VEHICLE.INVALID_ID
      );
    }


    // ============================================================
    // EXISTING VEHICLE
    // ============================================================

    const existingVehicle =
      await Vehicle.findOne({
        _id: id,
        isActive: true,
      }).lean();


    if (!existingVehicle) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.VEHICLE.NOT_FOUND
      );
    }


    // ============================================================
    // ALLOWED FIELDS
    // ============================================================

    const allowedFields = [
      "name",
      "slug",

      "type",
      "category",

      "seatingCapacity",
      "luggageCapacity",

      "ac",
      "fuelType",
      "transmission",
      "modelYear",

      "driverIncluded",
      "driverType",
      "driverFeatures",

      "features",
      "amenities",

      "shortDescription",
      "description",

      "service",

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
    // NORMALIZE NAME
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
          "Vehicle name cannot be empty"
        );
      }


      updateData.name =
        updateData.name.trim();
    }


    // ============================================================
    // NORMALIZE SLUG
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
          "Vehicle slug cannot be empty"
        );
      }


      updateData.slug =
        updateData.slug
          .trim()
          .toLowerCase();
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
      });
    }


    if (
      duplicateConditions.length
    ) {

      const duplicate =
        await Vehicle.findOne({

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
          RESPONSE_MESSAGES.VEHICLE.ALREADY_EXISTS
        );
      }
    }


    // ============================================================
    // STATUS
    // ============================================================

    if (
      updateData.status ===
      "published"
    ) {

      if (
        existingVehicle.status !==
          "published" ||
        !existingVehicle.publishedAt
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

    const updatedVehicle =
      await Vehicle.findOneAndUpdate(

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
      );


    if (!updatedVehicle) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.VEHICLE.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.VEHICLE.UPDATED,
      updatedVehicle
    );

  } catch (error) {

    console.error(
      "Update Vehicle Error :",
      error
    );


    if (
      error.code === 11000
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        RESPONSE_MESSAGES.VEHICLE.ALREADY_EXISTS
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
// DELETE VEHICLE — SOFT DELETE
// ================================================================

export const deleteVehicle = async (
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
        RESPONSE_MESSAGES.VEHICLE.INVALID_ID
      );
    }


    const vehicle =
      await Vehicle.findOneAndUpdate(

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


    if (!vehicle) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.VEHICLE.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.VEHICLE.DELETED,
      {
        id:
          vehicle._id,
      }
    );

  } catch (error) {

    console.error(
      "Delete Vehicle Error :",
      error
    );


    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};