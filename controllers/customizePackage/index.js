import mongoose from "mongoose";

import CustomizePackage from "../../models/customizePackage/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";

import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";


// ================================================================
// CREATE CUSTOMIZE PACKAGE
// PUBLIC API
// ================================================================

export const createCustomizePackage = async (req, res) => {
  try {
    const {
      travelerType,
      adultsCount,
      childrenCount,
      infantsCount,
      seniorsCount,

      startDate,
      isFlexible,

      destinations,
      cityStays,

      sightseeing,

      hotels,

      vehicles,

      addons,
      specialNotes,

      customer,

      totalDays,
      totalNights,
    } = req.body;


    // ============================================================
    // BASIC VALIDATION
    // ============================================================

    if (!travelerType) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Traveler type is required"
      );
    }


    if (
      ![
        "Solo",
        "Couple",
        "Family",
        "Group of Friends",
      ].includes(travelerType)
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid traveler type"
      );
    }


    if (
      adultsCount === undefined ||
      Number(adultsCount) < 1
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "At least one adult is required"
      );
    }


    if (!startDate) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Start date is required"
      );
    }


    if (!customer) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Customer details are required"
      );
    }


    if (!customer.name?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Customer name is required"
      );
    }


    if (!customer.email?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Customer email is required"
      );
    }


    if (!customer.phone?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Customer phone is required"
      );
    }


    // ============================================================
    // DATE VALIDATION
    // ============================================================

    const parsedStartDate =
      new Date(startDate);


    if (
      Number.isNaN(
        parsedStartDate.getTime()
      )
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid start date"
      );
    }


    // ============================================================
    // OBJECT ID VALIDATION HELPER
    // ============================================================

    const validateObjectId = (
      value,
      fieldName
    ) => {

      if (
        !mongoose.Types.ObjectId.isValid(
          value
        )
      ) {
        return `${fieldName} is invalid`;
      }

      return null;
    };


    // ============================================================
    // DESTINATIONS
    // ============================================================

    if (
      destinations !== undefined
    ) {

      if (
        !Array.isArray(destinations)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Destinations must be an array"
        );
      }


      for (
        const destination
        of destinations
      ) {

        const error =
          validateObjectId(
            destination.cityId,
            "Destination city"
          );


        if (error) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            error
          );
        }


        if (
          !Number.isInteger(
            Number(destination.order)
          ) ||
          Number(destination.order) < 1
        ) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Destination order must be at least 1"
          );
        }
      }
    }


    // ============================================================
    // CITY STAYS
    // ============================================================

    if (
      cityStays !== undefined
    ) {

      if (
        !Array.isArray(cityStays)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "City stays must be an array"
        );
      }


      for (
        const stay
        of cityStays
      ) {

        const error =
          validateObjectId(
            stay.cityId,
            "City stay city"
          );


        if (error) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            error
          );
        }


        if (
          Number(stay.nights) < 1
        ) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "City stay nights must be at least 1"
          );
        }


        if (
          !Number.isInteger(
            Number(stay.order)
          ) ||
          Number(stay.order) < 1
        ) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "City stay order must be at least 1"
          );
        }
      }
    }


    // ============================================================
    // SIGHTSEEING
    // ============================================================

    if (
      sightseeing !== undefined
    ) {

      if (
        !Array.isArray(sightseeing)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Sightseeing must be an array"
        );
      }


      for (
        const item
        of sightseeing
      ) {

        const cityError =
          validateObjectId(
            item.cityId,
            "Sightseeing city"
          );


        if (cityError) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            cityError
          );
        }


        if (
          item.attractions !==
          undefined
        ) {

          if (
            !Array.isArray(
              item.attractions
            )
          ) {
            return sendError(
              res,
              HTTP_STATUS_CODES.BAD_REQUEST,
              "Sightseeing attractions must be an array"
            );
          }


          for (
            const attraction
            of item.attractions
          ) {

            const error =
              validateObjectId(
                attraction.attractionId,
                "Attraction"
              );


            if (error) {
              return sendError(
                res,
                HTTP_STATUS_CODES.BAD_REQUEST,
                error
              );
            }
          }
        }


        if (
          item.activities !==
          undefined
        ) {

          if (
            !Array.isArray(
              item.activities
            )
          ) {
            return sendError(
              res,
              HTTP_STATUS_CODES.BAD_REQUEST,
              "Sightseeing activities must be an array"
            );
          }


          for (
            const activity
            of item.activities
          ) {

            const error =
              validateObjectId(
                activity.activityId,
                "Activity"
              );


            if (error) {
              return sendError(
                res,
                HTTP_STATUS_CODES.BAD_REQUEST,
                error
              );
            }
          }
        }
      }
    }


    // ============================================================
    // HOTELS
    // ============================================================

    if (
      hotels !== undefined
    ) {

      if (
        !Array.isArray(hotels)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Hotels must be an array"
        );
      }


      for (
        const hotel
        of hotels
      ) {

        const cityError =
          validateObjectId(
            hotel.cityId,
            "Hotel city"
          );


        if (cityError) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            cityError
          );
        }


        const hotelError =
          validateObjectId(
            hotel.hotelId,
            "Hotel"
          );


        if (hotelError) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            hotelError
          );
        }


        const roomError =
          validateObjectId(
            hotel.roomId,
            "Room"
          );


        if (roomError) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            roomError
          );
        }
      }
    }


    // ============================================================
    // VEHICLES
    // ============================================================

    if (
      vehicles !== undefined
    ) {

      if (
        !Array.isArray(vehicles)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Vehicles must be an array"
        );
      }


      for (
        const vehicle
        of vehicles
      ) {

        const error =
          validateObjectId(
            vehicle.vehicleId,
            "Vehicle"
          );


        if (error) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            error
          );
        }


        if (
          Number(vehicle.quantity) < 1
        ) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Vehicle quantity must be at least 1"
          );
        }
      }
    }


    // ============================================================
    // ADDONS
    // ============================================================

    if (
      addons !== undefined
    ) {

      if (
        !Array.isArray(addons)
      ) {
        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Addons must be an array"
        );
      }


      for (
        const addon
        of addons
      ) {

        const error =
          validateObjectId(
            addon.addonId,
            "Addon"
          );


        if (error) {
          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            error
          );
        }
      }
    }


    // ============================================================
    // TOTAL DAYS / NIGHTS
    // ============================================================

    if (
      totalDays === undefined ||
      Number(totalDays) < 1
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Total days must be at least 1"
      );
    }


    if (
      totalNights === undefined ||
      Number(totalNights) < 0
    ) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Total nights cannot be negative"
      );
    }


    // ============================================================
    // CREATE DATA
    // ============================================================

    const customizePackage =
      await CustomizePackage.create({

        travelerType,

        adultsCount:
          Number(adultsCount),

        childrenCount:
          Number(childrenCount || 0),

        infantsCount:
          Number(infantsCount || 0),

        seniorsCount:
          Number(seniorsCount || 0),

        startDate:
          parsedStartDate,

        isFlexible:
          isFlexible ?? true,

        destinations:
          destinations || [],

        cityStays:
          cityStays || [],

        sightseeing:
          sightseeing || [],

        hotels:
          hotels || [],

        vehicles:
          vehicles || [],

        addons:
          addons || [],

        specialNotes:
          specialNotes || "",

        customer: {
          name:
            customer.name.trim(),

          email:
            customer.email
              .trim()
              .toLowerCase(),

          phone:
            customer.phone.trim(),
        },

        totalDays:
          Number(totalDays),

        totalNights:
          Number(totalNights),

        status:
          "submitted",

        isActive:
          true,
      });


    return sendResponse(
      res,
      HTTP_STATUS_CODES.CREATED,
      "Customize package enquiry submitted successfully",
      customizePackage
    );

  } catch (error) {

    console.error(
      "Create Customize Package Error :",
      error
    );


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
// GET CUSTOMIZE PACKAGES
//
// ADMIN
//
// GET /api/customize-packages
//
// SINGLE
//
// GET /api/customize-packages?id=ID
// ================================================================

export const getCustomizePackages = async (
  req,
  res
) => {

  try {

    const {
      id,

      page = 1,
      limit = 20,

      status,

      email,

      phone,

      cityId,

      travelerType,

      isFlexible,

      startDateFrom,

      startDateTo,

      createdFrom,

      createdTo,

      search,

      sortBy = "createdAt",

      sortOrder = "desc",
    } = req.query;


    // ============================================================
    // SINGLE
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
          "Invalid customize package ID"
        );
      }


      const customizePackage =
        await CustomizePackage.findOne({
          _id: id,
          isActive: true,
        })
          .populate(
            "destinations.cityId",
            "name slug"
          )
          .populate(
            "cityStays.cityId",
            "name slug"
          )
          .populate(
            "sightseeing.cityId",
            "name slug"
          )
          .populate(
            "sightseeing.attractions.attractionId",
            "name slug"
          )
          .populate(
            "sightseeing.activities.activityId",
            "name slug"
          )
          .populate(
            "hotels.cityId",
            "name slug"
          )
          .populate(
            "hotels.hotelId",
            "name slug category starRating"
          )
          .populate(
            "vehicles.vehicleId",
            "name slug type seatingCapacity"
          )
          .lean();


      if (!customizePackage) {

        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          "Customize package not found"
        );
      }


      return sendResponse(
        res,
        HTTP_STATUS_CODES.OK,
        "Customize package fetched successfully",
        customizePackage
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
          Number(limit) || 20,
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

    const filter = {
      isActive: true,
    };


    // ============================================================
    // STATUS
    // ============================================================

    if (status) {

      const allowedStatuses = [
        "draft",
        "submitted",
        "itinerary-generated",
        "contacted",
        "confirmed",
        "cancelled",
      ];


      if (
        !allowedStatuses.includes(
          status
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid customize package status"
        );
      }


      filter.status =
        status;
    }


    // ============================================================
    // TRAVELER TYPE
    // ============================================================

    if (travelerType) {

      if (
        ![
          "Solo",
          "Couple",
          "Family",
          "Group of Friends",
        ].includes(
          travelerType
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid traveler type"
        );
      }


      filter.travelerType =
        travelerType;
    }


    // ============================================================
    // CUSTOMER EMAIL
    // ============================================================

    if (email?.trim()) {

      filter[
        "customer.email"
      ] =
        email
          .trim()
          .toLowerCase();
    }


    // ============================================================
    // CUSTOMER PHONE
    // ============================================================

    if (phone?.trim()) {

      filter[
        "customer.phone"
      ] =
        phone.trim();
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


      filter[
        "destinations.cityId"
      ] =
        cityId;
    }


    // ============================================================
    // FLEXIBLE DATE
    // ============================================================

    if (
      isFlexible !==
      undefined
    ) {

      filter.isFlexible =
        isFlexible === "true";
    }


    // ============================================================
    // TRAVEL START DATE
    // ============================================================

    if (
      startDateFrom ||
      startDateTo
    ) {

      filter.startDate = {};


      if (startDateFrom) {

        const date =
          new Date(
            startDateFrom
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid startDateFrom"
          );
        }


        filter.startDate.$gte =
          date;
      }


      if (startDateTo) {

        const date =
          new Date(
            startDateTo
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid startDateTo"
          );
        }


        filter.startDate.$lte =
          date;
      }
    }


    // ============================================================
    // CREATED DATE
    // ============================================================

    if (
      createdFrom ||
      createdTo
    ) {

      filter.createdAt = {};


      if (createdFrom) {

        const date =
          new Date(
            createdFrom
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid createdFrom"
          );
        }


        filter.createdAt.$gte =
          date;
      }


      if (createdTo) {

        const date =
          new Date(
            createdTo
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return sendError(
            res,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Invalid createdTo"
          );
        }


        filter.createdAt.$lte =
          date;
      }
    }


    // ============================================================
    // SEARCH
    // ============================================================

    if (search?.trim()) {

      const regex =
        new RegExp(
          search.trim(),
          "i"
        );


      filter.$or = [

        {
          "customer.name":
            regex,
        },

        {
          "customer.email":
            regex,
        },

        {
          "customer.phone":
            regex,
        },

        {
          "customer.company":
            regex,
        },

        {
          specialNotes:
            regex,
        },
      ];
    }


    // ============================================================
    // SORT
    // ============================================================

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "startDate",
      "totalDays",
      "totalNights",
      "status",
      "travelerType",
    ];


    const safeSortBy =
      allowedSortFields.includes(
        sortBy
      )
        ? sortBy
        : "createdAt";


    const safeSortOrder =
      sortOrder === "asc"
        ? 1
        : -1;


    // ============================================================
    // FETCH
    // ============================================================

    const [
      customizePackages,
      total,
    ] = await Promise.all([

      CustomizePackage.find(
        filter
      )

        .populate(
          "destinations.cityId",
          "name slug"
        )

        .populate(
          "cityStays.cityId",
          "name slug"
        )

        .populate(
          "sightseeing.cityId",
          "name slug"
        )

        .populate(
          "sightseeing.attractions.attractionId",
          "name slug"
        )

        .populate(
          "sightseeing.activities.activityId",
          "name slug"
        )

        .populate(
          "hotels.cityId",
          "name slug"
        )

        .populate(
          "hotels.hotelId",
          "name slug category starRating"
        )

        .populate(
          "vehicles.vehicleId",
          "name slug type seatingCapacity"
        )

        .sort({
          [safeSortBy]:
            safeSortOrder,
        })

        .skip(skip)

        .limit(perPage)

        .lean(),

      CustomizePackage.countDocuments(
        filter
      ),
    ]);


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Customize packages fetched successfully",
      {
        customizePackages,

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
      "Get Customize Packages Error :",
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
// UPDATE CUSTOMIZE PACKAGE
// ADMIN
// ================================================================

export const updateCustomizePackage = async (
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
        "Invalid customize package ID"
      );
    }


    const allowedFields = [
      "travelerType",
      "adultsCount",
      "childrenCount",
      "infantsCount",
      "seniorsCount",

      "startDate",
      "isFlexible",

      "destinations",
      "cityStays",

      "sightseeing",

      "hotels",

      "vehicles",

      "addons",

      "specialNotes",

      "customer",

      "totalDays",
      "totalNights",

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


    if (
      updateData.customer
        ?.email
    ) {

      updateData.customer.email =
        updateData.customer.email
          .trim()
          .toLowerCase();
    }


    const updatedPackage =
      await CustomizePackage.findOneAndUpdate(

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


    if (!updatedPackage) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "Customize package not found"
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Customize package updated successfully",
      updatedPackage
    );

  } catch (error) {

    console.error(
      "Update Customize Package Error :",
      error
    );


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
// UPDATE STATUS
// ADMIN
// ================================================================

export const updateCustomizePackageStatus = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;

    const { status } =
      req.body;


    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid customize package ID"
      );
    }


    const allowedStatuses = [
      "draft",
      "submitted",
      "itinerary-generated",
      "contacted",
      "confirmed",
      "cancelled",
    ];


    if (
      !allowedStatuses.includes(
        status
      )
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid customize package status"
      );
    }


    const updatedPackage =
      await CustomizePackage.findOneAndUpdate(

        {
          _id: id,
          isActive: true,
        },

        {
          $set: {
            status,
          },
        },

        {
          new: true,
          runValidators: true,
        }
      );


    if (!updatedPackage) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "Customize package not found"
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Customize package status updated successfully",
      updatedPackage
    );

  } catch (error) {

    console.error(
      "Update Customize Package Status Error :",
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
// DELETE CUSTOMIZE PACKAGE
// SOFT DELETE
// ADMIN
// ================================================================

export const deleteCustomizePackage = async (
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
        "Invalid customize package ID"
      );
    }


    const deletedPackage =
      await CustomizePackage.findOneAndUpdate(

        {
          _id: id,
          isActive: true,
        },

        {
          $set: {

            isActive:
              false,

            deletedAt:
              new Date(),
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
        "Customize package not found"
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Customize package deleted successfully",
      {
        id:
          deletedPackage._id,
      }
    );

  } catch (error) {

    console.error(
      "Delete Customize Package Error :",
      error
    );


    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};