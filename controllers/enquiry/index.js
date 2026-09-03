import mongoose from "mongoose";

import Enquiry from "../../models/enquiry/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";

import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";


// ================================================================
// CREATE ENQUIRY
// PUBLIC API
// ================================================================

export const createEnquiry = async (req, res) => {
  try {

    const {
      name,
      company,
      phone,
      email,
      country,
      subject,
      message,
    } = req.body;


    // ============================================================
    // BASIC VALIDATION
    // ============================================================

    if (!name?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Name is required"
      );
    }


    if (!phone?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Phone is required"
      );
    }


    if (!email?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Email is required"
      );
    }


    if (!subject?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Subject is required"
      );
    }


    if (!message?.trim()) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Message is required"
      );
    }


    // ============================================================
    // NORMALIZE
    // ============================================================

    const enquiryData = {
      name:
        name.trim(),

      company:
        company?.trim() || null,

      phone:
        phone.trim(),

      email:
        email.trim().toLowerCase(),

      country:
        country?.trim() || "India",

      subject:
        subject.trim(),

      message:
        message.trim(),

      status:
        "new",

      isActive:
        true,
    };


    // ============================================================
    // CREATE
    // ============================================================

    const enquiry =
      await Enquiry.create(
        enquiryData
      );


    return sendResponse(
      res,
      HTTP_STATUS_CODES.CREATED,
      RESPONSE_MESSAGES.ENQUIRY.CREATED,
      enquiry
    );

  } catch (error) {

    console.error(
      "Create Enquiry Error :",
      error
    );


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
// GET ENQUIRIES
//
// ALL:
// GET /api/admin/enquiries
//
// SINGLE:
// GET /api/admin/enquiries?id=ENQUIRY_ID
// ================================================================

export const getEnquiries = async (
  req,
  res
) => {

  try {

    const {
      id,

      page = 1,
      limit = 10,

      search,

      status,
      country,

      email,
      phone,

      isActive = "true",

      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;


    // ============================================================
    // GET SINGLE
    // ============================================================

    if (id) {

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          RESPONSE_MESSAGES.ENQUIRY.INVALID_ID
        );
      }


      const enquiry =
        await Enquiry.findOne({
          _id: id,
          isActive: true,
        }).lean();


      if (!enquiry) {

        return sendError(
          res,
          HTTP_STATUS_CODES.NOT_FOUND,
          RESPONSE_MESSAGES.ENQUIRY.NOT_FOUND
        );
      }


      return sendResponse(
        res,
        HTTP_STATUS_CODES.OK,
        RESPONSE_MESSAGES.ENQUIRY.FETCHED_SINGLE,
        enquiry
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

    if (
      isActive !== "all"
    ) {

      filter.isActive =
        isActive === "true";
    }


    // ============================================================
    // STATUS
    // ============================================================

    if (status) {

      const allowedStatuses = [
        "new",
        "active",
        "replied",
        "closed",
      ];


      if (
        !allowedStatuses.includes(
          status
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid enquiry status"
        );
      }


      filter.status =
        status;
    }


    // ============================================================
    // COUNTRY
    // ============================================================

    if (country?.trim()) {

      filter.country =
        country.trim();
    }


    // ============================================================
    // EMAIL
    // ============================================================

    if (email?.trim()) {

      filter.email =
        email
          .trim()
          .toLowerCase();
    }


    // ============================================================
    // PHONE
    // ============================================================

    if (phone?.trim()) {

      filter.phone =
        phone.trim();
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
          company:
            searchRegex,
        },

        {
          email:
            searchRegex,
        },

        {
          phone:
            searchRegex,
        },

        {
          subject:
            searchRegex,
        },

        {
          message:
            searchRegex,
        },

        {
          country:
            searchRegex,
        },
      ];
    }


    // ============================================================
    // SORT
    // ============================================================

    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "name",
      "email",
      "status",
      "country",
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
      enquiries,
      total,
    ] = await Promise.all([

      Enquiry.find(filter)
        .sort({
          [safeSortBy]:
            safeSortOrder,
        })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Enquiry.countDocuments(
        filter
      ),
    ]);


    // ============================================================
    // RESPONSE
    // ============================================================

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ENQUIRY.FETCHED,
      {
        enquiries,

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
      "Get Enquiries Error :",
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
// UPDATE ENQUIRY
// ADMIN ONLY
// ================================================================

export const updateEnquiry = async (
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
        RESPONSE_MESSAGES.ENQUIRY.INVALID_ID
      );
    }


    const existingEnquiry =
      await Enquiry.findOne({
        _id: id,
        isActive: true,
      }).lean();


    if (!existingEnquiry) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.ENQUIRY.NOT_FOUND
      );
    }


    // ============================================================
    // ALLOWED FIELDS
    // ============================================================

    const allowedFields = [
      "name",
      "company",
      "phone",
      "email",
      "country",
      "subject",
      "message",
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

      updateData.name =
        updateData.name.trim();
    }


    if (
      updateData.company !==
      undefined
    ) {

      updateData.company =
        updateData.company?.trim() ||
        null;
    }


    if (
      updateData.phone !==
      undefined
    ) {

      updateData.phone =
        updateData.phone.trim();
    }


    if (
      updateData.email !==
      undefined
    ) {

      updateData.email =
        updateData.email
          .trim()
          .toLowerCase();
    }


    if (
      updateData.country !==
      undefined
    ) {

      updateData.country =
        updateData.country.trim();
    }


    if (
      updateData.subject !==
      undefined
    ) {

      updateData.subject =
        updateData.subject.trim();
    }


    if (
      updateData.message !==
      undefined
    ) {

      updateData.message =
        updateData.message.trim();
    }


    // ============================================================
    // STATUS VALIDATION
    // ============================================================

    if (
      updateData.status !==
      undefined
    ) {

      const allowedStatuses = [
        "new",
        "active",
        "replied",
        "closed",
      ];


      if (
        !allowedStatuses.includes(
          updateData.status
        )
      ) {

        return sendError(
          res,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Invalid enquiry status"
        );
      }
    }


    // ============================================================
    // UPDATE
    // ============================================================

    const updatedEnquiry =
      await Enquiry.findOneAndUpdate(

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


    if (!updatedEnquiry) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.ENQUIRY.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ENQUIRY.UPDATED,
      updatedEnquiry
    );

  } catch (error) {

    console.error(
      "Update Enquiry Error :",
      error
    );


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
// UPDATE ONLY STATUS
// ADMIN ONLY
// ================================================================

export const updateEnquiryStatus = async (
  req,
  res
) => {

  try {

    const { id } =
      req.params;

    const { status } =
      req.body;


    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        RESPONSE_MESSAGES.ENQUIRY.INVALID_ID
      );
    }


    const allowedStatuses = [
      "new",
      "active",
      "replied",
      "closed",
    ];


    if (
      !allowedStatuses.includes(
        status
      )
    ) {

      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid enquiry status"
      );
    }


    const enquiry =
      await Enquiry.findOneAndUpdate(

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


    if (!enquiry) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.ENQUIRY.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ENQUIRY.STATUS_UPDATED,
      enquiry
    );

  } catch (error) {

    console.error(
      "Update Enquiry Status Error :",
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
// DELETE ENQUIRY
// SOFT DELETE
// ADMIN ONLY
// ================================================================

export const deleteEnquiry = async (
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
        RESPONSE_MESSAGES.ENQUIRY.INVALID_ID
      );
    }


    const enquiry =
      await Enquiry.findOneAndUpdate(

        {
          _id: id,
          isActive: true,
        },

        {
          $set: {

            isActive: false,

            deletedAt:
              new Date(),
          },
        },

        {
          new: true,
        }
      );


    if (!enquiry) {

      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        RESPONSE_MESSAGES.ENQUIRY.NOT_FOUND
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ENQUIRY.DELETED,
      {
        id:
          enquiry._id,
      }
    );

  } catch (error) {

    console.error(
      "Delete Enquiry Error :",
      error
    );


    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};