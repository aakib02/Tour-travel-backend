import crypto from "crypto";
import mongoose from "mongoose";

import cloudinary from "../../config/cloudinary.js";
import Media from "../../models/media/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";

import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";
import { deleteFromCloudinary } from "../../utils/cloudinary.js";


// ============================================================
// GENERATE UPLOAD SIGNATURE
// ============================================================

export const generateUploadSignature = async (req, res) => {
  try {
    const {
      folder = "travel",
      uploadSessionId = null,
    } = req.body;

    const timestamp = Math.floor(Date.now() / 1000);

    const paramsToSign = {
      folder,
      timestamp,
    };

    if (uploadSessionId) {
      paramsToSign.uploadSessionId = uploadSessionId;
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Upload signature generated successfully",
      {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        timestamp,
        signature,
        folder,
        uploadSessionId,
      }
    );

  } catch (error) {
    console.error("Generate Upload Signature Error:", error);

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ============================================================
// CREATE MEDIA RECORD
// ============================================================

export const createMedia = async (req, res) => {
  try {
    if (Array.isArray(req.body) || req.body?.items || req.body?.media) {
      return createMediaBulk(req, res);
    }

    let {
      name,
      originalName,
      url,
      secureUrl,
      publicId,
      resourceType = "image",
      format,
      mimeType,
      folder,
      size,
      width,
      height,
      duration,
      alt,
      title,
      caption,
      description,
      fileHash,
      tags = [],
      clientUploadId,
      uploadSessionId,
    } = req.body;

    // ----------------------------------------------------------
    // DIRECT FILE UPLOAD HANDLER (IF req.file IS PRESENT)
    // ----------------------------------------------------------
    if (req.file) {
      originalName = req.file.originalname;
      name = name || originalName.split(".")[0];
      alt = alt || req.body.alt || name;
      mimeType = req.file.mimetype;
      size = req.file.size;

      // Upload buffer directly to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: folder || "travel",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      url = uploadResult.url;
      secureUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
      format = uploadResult.format;
      width = uploadResult.width;
      height = uploadResult.height;
      resourceType = uploadResult.resource_type;
    }

    // ----------------------------------------------------------
    // REQUIRED CLOUDINARY DATA
    // ----------------------------------------------------------

    if (!secureUrl || !publicId) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "File or Cloudinary secureUrl and publicId are required"
      );
    }


    // ----------------------------------------------------------
    // IDEMPOTENCY CHECK
    // ----------------------------------------------------------

    if (clientUploadId) {
      const existingMedia = await Media.findOne({
        clientUploadId,
        isActive: true,
      }).lean();

      if (existingMedia) {
        return sendResponse(
          res,
          HTTP_STATUS_CODES.OK,
          "Media already exists",
          existingMedia
        );
      }
    }


    // ----------------------------------------------------------
    // PUBLIC ID DUPLICATE CHECK
    // ----------------------------------------------------------

    const existingPublicId = await Media.findOne({
      publicId,
      isActive: true,
    }).lean();

    if (existingPublicId) {
      return sendResponse(
        res,
        HTTP_STATUS_CODES.OK,
        "Media already exists",
        existingPublicId
      );
    }


    // ----------------------------------------------------------
    // FILE HASH DUPLICATE CHECK
    // ----------------------------------------------------------

    if (fileHash) {
      const existingHash = await Media.findOne({
        fileHash,
        isActive: true,
      }).lean();

      if (existingHash) {
        return sendResponse(
          res,
          HTTP_STATUS_CODES.OK,
          "Duplicate media detected",
          existingHash
        );
      }
    }


    // ----------------------------------------------------------
    // CREATE MEDIA
    // ----------------------------------------------------------

    const media = await Media.create({
      name: name || originalName || "Untitled Media",
      originalName,

      url: url || secureUrl,
      secureUrl,

      publicId,
      resourceType,

      format,
      mimeType,
      folder,

      size,
      width,
      height,
      duration,

      alt,
      title,
      caption,
      description,

      fileHash,

      tags,

      uploadedBy: req.admin?._id || req.user?.id || null,

      clientUploadId,
      uploadSessionId,

      isActive: true,
      deletedAt: null,
    });


    return sendResponse(
      res,
      HTTP_STATUS_CODES.CREATED,
      "Media uploaded successfully",
      media
    );

  } catch (error) {

    console.error("Create Media Error:", error);


    // ----------------------------------------------------------
    // DUPLICATE KEY
    // ----------------------------------------------------------

    if (error.code === 11000) {

      const existingMedia = await Media.findOne({
        $or: [
          { clientUploadId: req.body.clientUploadId },
          { publicId: req.body.publicId },
        ],
      }).lean();

      if (existingMedia) {
        return sendResponse(
          res,
          HTTP_STATUS_CODES.OK,
          "Media already exists",
          existingMedia
        );
      }

      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        "Media already exists"
      );
    }


    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ============================================================
// CREATE MEDIA RECORDS IN BULK (SHOPIFY-STYLE STAGED FLOW)
// ============================================================

export const createMediaBulk = async (req, res) => {
  try {
    const rawItems = Array.isArray(req.body)
      ? req.body
      : req.body?.items || req.body?.media || [];

    if (!rawItems.length) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "No media items provided for bulk creation"
      );
    }

    const docsToInsert = rawItems
      .filter((item) => item?.secureUrl && item?.publicId)
      .map((item) => ({
        name: item.name || item.originalName || "Untitled Media",
        originalName: item.originalName || item.name || "media",
        url: item.url || item.secureUrl,
        secureUrl: item.secureUrl,
        publicId: item.publicId,
        resourceType: item.resourceType || "image",
        format: item.format || "jpg",
        mimeType: item.mimeType,
        folder: item.folder || "travel",
        size: item.size || item.bytes || 0,
        width: item.width || 0,
        height: item.height || 0,
        duration: item.duration || 0,
        alt: item.alt || item.name || "Media Asset",
        title: item.title,
        caption: item.caption,
        description: item.description,
        fileHash: item.fileHash,
        tags: Array.isArray(item.tags) ? item.tags : [],
        uploadedBy: req.admin?._id || req.user?.id || null,
        clientUploadId: item.clientUploadId,
        uploadSessionId: item.uploadSessionId,
        isActive: true,
        deletedAt: null,
      }));

    if (!docsToInsert.length) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Valid items with secureUrl and publicId are required"
      );
    }

    const savedMedia = await Media.insertMany(docsToInsert, { ordered: false });

    return sendResponse(
      res,
      HTTP_STATUS_CODES.CREATED,
      `${savedMedia.length} media items created successfully`,
      savedMedia
    );
  } catch (error) {
    console.error("Create Media Bulk Error:", error);

    if (error.insertedDocs && error.insertedDocs.length > 0) {
      return sendResponse(
        res,
        HTTP_STATUS_CODES.CREATED,
        `${error.insertedDocs.length} media items created (some duplicates skipped)`,
        error.insertedDocs
      );
    }

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error.message || RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ============================================================
// GET MEDIA LIST
// ============================================================

export const getMedia = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 30,
      search,
      resourceType,
      folder,
      isActive = "true",
      tags,
      uploadSessionId,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;


    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(
      Math.max(Number(limit), 1),
      100
    );


    const filter = {};


    // ----------------------------------------------------------
    // ACTIVE
    // ----------------------------------------------------------

    if (isActive !== "all") {
      filter.isActive = isActive === "true";
    }


    // ----------------------------------------------------------
    // RESOURCE TYPE
    // ----------------------------------------------------------

    if (resourceType) {
      filter.resourceType = resourceType;
    }


    // ----------------------------------------------------------
    // FOLDER
    // ----------------------------------------------------------

    if (folder) {
      filter.folder = folder;
    }


    // ----------------------------------------------------------
    // SESSION
    // ----------------------------------------------------------

    if (uploadSessionId) {
      filter.uploadSessionId = uploadSessionId;
    }


    // ----------------------------------------------------------
    // TAG
    // ----------------------------------------------------------

    if (tags) {
      filter.tags = {
        $in: tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase()),
      };
    }


    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (search?.trim()) {

      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { originalName: searchRegex },
        { alt: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
    }


    const skip =
      (pageNumber - 1) * limitNumber;


    const sort = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };


    const [
      media,
      total,
    ] = await Promise.all([

      Media.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Media.countDocuments(filter),

    ]);


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Media fetched successfully",
      {
        media,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages: Math.ceil(
            total / limitNumber
          ),
        },
      }
    );

  } catch (error) {

    console.error("Get Media Error:", error);

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};


// ============================================================
// GET SINGLE MEDIA
// ============================================================

export const getSingleMedia = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid media ID"
      );
    }


    const media = await Media.findOne({
      _id: id,
      isActive: true,
    }).lean();


    if (!media) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "Media not found"
      );
    }


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Media fetched successfully",
      media
    );

  } catch (error) {

    console.error(
      "Get Single Media Error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};

// ============================================================
// DELETE MEDIA
// ============================================================

export const deleteMedia = async (req, res) => {
  try {

    const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid media ID"
      );
    }


    const media = await Media.findOne({
      _id: id,
      isActive: true,
    });


    if (!media) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "Media not found"
      );
    }


    // ----------------------------------------------------------
    // CHECK USAGE
    // ----------------------------------------------------------

    if (media.usageCount > 0) {
      return sendError(
        res,
        HTTP_STATUS_CODES.CONFLICT,
        "Media is currently being used and cannot be deleted"
      );
    }


    // ----------------------------------------------------------
    // DELETE FROM CLOUDINARY
    // ----------------------------------------------------------

    await deleteFromCloudinary(
      media.publicId,
      media.resourceType
    );


    // ----------------------------------------------------------
    // SOFT DELETE
    // ----------------------------------------------------------

    media.isActive = false;
    media.deletedAt = new Date();

    await media.save();


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Media deleted successfully",
      {
        id: media._id,
      }
    );

  } catch (error) {

    console.error(
      "Delete Media Error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};



// ============================================================
// RESTORE MEDIA
// ============================================================

export const restoreMedia = async (req, res) => {
  try {

    const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(
        res,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Invalid media ID"
      );
    }


    const media = await Media.findOne({
      _id: id,
      isActive: false,
    });


    if (!media) {
      return sendError(
        res,
        HTTP_STATUS_CODES.NOT_FOUND,
        "Media not found"
      );
    }


    media.isActive = true;
    media.deletedAt = null;

    await media.save();


    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Media restored successfully",
      media
    );

  } catch (error) {

    console.error(
      "Restore Media Error:",
      error
    );

    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};