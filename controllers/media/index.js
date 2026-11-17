import crypto from "crypto";
import mongoose from "mongoose";

import cloudinary from "../../config/cloudinary.js";
import Media from "../../models/media/index.js";
import Package from "../../models/package/index.js";
import Hotel from "../../models/hotel/index.js";
import Vehicle from "../../models/vehicle/index.js";
import Activity from "../../models/activity/index.js";
import Attraction from "../../models/attraction/index.js";
import Country from "../../models/country/index.js";
import State from "../../models/state/index.js";
import City from "../../models/city/index.js";
import Hero from "../../models/hero/index.js";
import AboutUs from "../../models/aboutUs/index.js";
import Review from "../../models/review/index.js";

import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";

import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";
import { deleteFromCloudinary } from "../../utils/cloudinary.js";
import { buildZipBuffer, fetchMediaBuffers } from "../../utils/zipStream.js";


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
// SCAN MEDIA USAGE ACROSS ALL COLLECTIONS
// ============================================================

export const findMediaUsages = async (mediaIds) => {
  const objectIds = mediaIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (!objectIds.length) {
    return { totalUsages: 0, usages: [] };
  }

  const idStrings = new Set(objectIds.map((id) => id.toString()));
  const usages = [];

  const [
    packages,
    hotels,
    vehicles,
    activities,
    attractions,
    countries,
    states,
    cities,
    heroes,
    reviews,
    aboutDoc,
  ] = await Promise.all([
    Package.find({
      $or: [
        { "heroImage.mediaId": { $in: objectIds } },
        { "gallery.mediaId": { $in: objectIds } },
      ],
    }).select("title heroImage gallery").lean(),

    Hotel.find({
      $or: [
        { "heroImage.mediaId": { $in: objectIds } },
        { "gallery.mediaId": { $in: objectIds } },
        { "roomTypes.images.mediaId": { $in: objectIds } },
        { ogImage: { $in: objectIds } },
      ],
    }).select("name heroImage gallery roomTypes ogImage").lean(),

    Vehicle.find({
      $or: [
        { "heroImage.mediaId": { $in: objectIds } },
        { "gallery.mediaId": { $in: objectIds } },
      ],
    }).select("name heroImage gallery").lean(),

    Activity.find({
      $or: [
        { "heroImage.mediaId": { $in: objectIds } },
        { "gallery.mediaId": { $in: objectIds } },
      ],
    }).select("title name heroImage gallery").lean(),

    Attraction.find({
      $or: [
        { "heroImage.mediaId": { $in: objectIds } },
        { "gallery.mediaId": { $in: objectIds } },
      ],
    }).select("name heroImage gallery").lean(),

    Country.find({
      $or: [
        { heroImage: { $in: objectIds } },
        { "gallery.mediaId": { $in: objectIds } },
      ],
    }).select("name heroImage gallery").lean(),

    State.find({
      $or: [
        { "heroImage.mediaId": { $in: objectIds } },
        { "gallery.mediaId": { $in: objectIds } },
      ],
    }).select("name heroImage gallery").lean(),

    City.find({
      $or: [
        { "heroImage.mediaId": { $in: objectIds } },
        { "gallery.mediaId": { $in: objectIds } },
      ],
    }).select("name heroImage gallery").lean(),

    Hero.find({
      $or: [
        { "slides.image.mediaId": { $in: objectIds } },
        { "slides.thumbnail.mediaId": { $in: objectIds } },
        { "showcase.image.mediaId": { $in: objectIds } },
        { "trustCard.avatars.mediaId": { $in: objectIds } },
      ],
    }).select("title slides showcase trustCard").lean(),

    Review.find({
      "images.mediaId": { $in: objectIds },
    }).select("userName title images").lean(),

    AboutUs.findOne().lean(),
  ]);

  // Packages
  packages.forEach((p) => {
    if (p.heroImage?.mediaId && idStrings.has(p.heroImage.mediaId.toString())) {
      usages.push({
        entityType: "Package",
        entityId: p._id,
        entityTitle: p.title || "Untitled Package",
        role: "Hero Image",
        mediaId: p.heroImage.mediaId,
      });
    }
    p.gallery?.forEach((g) => {
      if (g.mediaId && idStrings.has(g.mediaId.toString())) {
        usages.push({
          entityType: "Package",
          entityId: p._id,
          entityTitle: p.title || "Untitled Package",
          role: "Gallery Image",
          mediaId: g.mediaId,
        });
      }
    });
  });

  // Hotels
  hotels.forEach((h) => {
    if (h.heroImage?.mediaId && idStrings.has(h.heroImage.mediaId.toString())) {
      usages.push({
        entityType: "Hotel",
        entityId: h._id,
        entityTitle: h.name || "Untitled Hotel",
        role: "Hero Image",
        mediaId: h.heroImage.mediaId,
      });
    }
    h.gallery?.forEach((g) => {
      if (g.mediaId && idStrings.has(g.mediaId.toString())) {
        usages.push({
          entityType: "Hotel",
          entityId: h._id,
          entityTitle: h.name || "Untitled Hotel",
          role: "Gallery Image",
          mediaId: g.mediaId,
        });
      }
    });
    h.roomTypes?.forEach((rt) => {
      rt.images?.forEach((img) => {
        if (img.mediaId && idStrings.has(img.mediaId.toString())) {
          usages.push({
            entityType: "Hotel",
            entityId: h._id,
            entityTitle: `${h.name || "Hotel"} (${rt.name || "Room"})`,
            role: "Room Image",
            mediaId: img.mediaId,
          });
        }
      });
    });
    if (h.ogImage && idStrings.has(h.ogImage.toString())) {
      usages.push({
        entityType: "Hotel",
        entityId: h._id,
        entityTitle: h.name || "Untitled Hotel",
        role: "SEO OG Image",
        mediaId: h.ogImage,
      });
    }
  });

  // Vehicles
  vehicles.forEach((v) => {
    if (v.heroImage?.mediaId && idStrings.has(v.heroImage.mediaId.toString())) {
      usages.push({
        entityType: "Vehicle",
        entityId: v._id,
        entityTitle: v.name || "Fleet Vehicle",
        role: "Hero Image",
        mediaId: v.heroImage.mediaId,
      });
    }
    v.gallery?.forEach((g) => {
      if (g.mediaId && idStrings.has(g.mediaId.toString())) {
        usages.push({
          entityType: "Vehicle",
          entityId: v._id,
          entityTitle: v.name || "Fleet Vehicle",
          role: "Gallery Image",
          mediaId: g.mediaId,
        });
      }
    });
  });

  // Activities
  activities.forEach((a) => {
    if (a.heroImage?.mediaId && idStrings.has(a.heroImage.mediaId.toString())) {
      usages.push({
        entityType: "Activity",
        entityId: a._id,
        entityTitle: a.name || a.title || "Activity",
        role: "Hero Image",
        mediaId: a.heroImage.mediaId,
      });
    }
    a.gallery?.forEach((g) => {
      if (g.mediaId && idStrings.has(g.mediaId.toString())) {
        usages.push({
          entityType: "Activity",
          entityId: a._id,
          entityTitle: a.name || a.title || "Activity",
          role: "Gallery Image",
          mediaId: g.mediaId,
        });
      }
    });
  });

  // Attractions
  attractions.forEach((a) => {
    if (a.heroImage?.mediaId && idStrings.has(a.heroImage.mediaId.toString())) {
      usages.push({
        entityType: "Attraction",
        entityId: a._id,
        entityTitle: a.name || "Attraction",
        role: "Hero Image",
        mediaId: a.heroImage.mediaId,
      });
    }
    a.gallery?.forEach((g) => {
      if (g.mediaId && idStrings.has(g.mediaId.toString())) {
        usages.push({
          entityType: "Attraction",
          entityId: a._id,
          entityTitle: a.name || "Attraction",
          role: "Gallery Image",
          mediaId: g.mediaId,
        });
      }
    });
  });

  // Countries
  countries.forEach((c) => {
    if (c.heroImage && idStrings.has(c.heroImage.toString())) {
      usages.push({
        entityType: "Country",
        entityId: c._id,
        entityTitle: c.name || "Country",
        role: "Hero Image",
        mediaId: c.heroImage,
      });
    }
    c.gallery?.forEach((g) => {
      if (g.mediaId && idStrings.has(g.mediaId.toString())) {
        usages.push({
          entityType: "Country",
          entityId: c._id,
          entityTitle: c.name || "Country",
          role: "Gallery Image",
          mediaId: g.mediaId,
        });
      }
    });
  });

  // States
  states.forEach((s) => {
    if (s.heroImage?.mediaId && idStrings.has(s.heroImage.mediaId.toString())) {
      usages.push({
        entityType: "State",
        entityId: s._id,
        entityTitle: s.name || "State",
        role: "Hero Image",
        mediaId: s.heroImage.mediaId,
      });
    }
    s.gallery?.forEach((g) => {
      if (g.mediaId && idStrings.has(g.mediaId.toString())) {
        usages.push({
          entityType: "State",
          entityId: s._id,
          entityTitle: s.name || "State",
          role: "Gallery Image",
          mediaId: g.mediaId,
        });
      }
    });
  });

  // Cities
  cities.forEach((c) => {
    if (c.heroImage?.mediaId && idStrings.has(c.heroImage.mediaId.toString())) {
      usages.push({
        entityType: "City",
        entityId: c._id,
        entityTitle: c.name || "City",
        role: "Hero Image",
        mediaId: c.heroImage.mediaId,
      });
    }
    c.gallery?.forEach((g) => {
      if (g.mediaId && idStrings.has(g.mediaId.toString())) {
        usages.push({
          entityType: "City",
          entityId: c._id,
          entityTitle: c.name || "City",
          role: "Gallery Image",
          mediaId: g.mediaId,
        });
      }
    });
  });

  // Hero Slides & Showcase
  heroes.forEach((h) => {
    h.slides?.forEach((s, idx) => {
      if (s.image?.mediaId && idStrings.has(s.image.mediaId.toString())) {
        usages.push({
          entityType: "Hero Slide",
          entityId: h._id,
          entityTitle: s.tagline || `Slide #${idx + 1}`,
          role: "Main Slide Image",
          mediaId: s.image.mediaId,
        });
      }
      if (s.thumbnail?.mediaId && idStrings.has(s.thumbnail.mediaId.toString())) {
        usages.push({
          entityType: "Hero Slide",
          entityId: h._id,
          entityTitle: s.tagline || `Slide #${idx + 1}`,
          role: "Slide Thumbnail",
          mediaId: s.thumbnail.mediaId,
        });
      }
    });
    h.showcase?.forEach((sc) => {
      if (sc.image?.mediaId && idStrings.has(sc.image.mediaId.toString())) {
        usages.push({
          entityType: "Hero Showcase",
          entityId: h._id,
          entityTitle: sc.label || "Showcase Item",
          role: "Showcase Image",
          mediaId: sc.image.mediaId,
        });
      }
    });
    h.trustCard?.avatars?.forEach((av, idx) => {
      if (av.mediaId && idStrings.has(av.mediaId.toString())) {
        usages.push({
          entityType: "Hero Trust Card",
          entityId: h._id,
          entityTitle: `Trust Avatar #${idx + 1}`,
          role: "Avatar",
          mediaId: av.mediaId,
        });
      }
    });
  });

  // Reviews
  reviews.forEach((r) => {
    r.images?.forEach((img) => {
      if (img.mediaId && idStrings.has(img.mediaId.toString())) {
        usages.push({
          entityType: "Review",
          entityId: r._id,
          entityTitle: r.userName || r.title || "Review",
          role: "Review Photo",
          mediaId: img.mediaId,
        });
      }
    });
  });

  // AboutUs
  if (aboutDoc) {
    const checkRef = (ref, role) => {
      if (ref && ref.mediaId && idStrings.has(ref.mediaId.toString())) {
        usages.push({
          entityType: "About Us",
          entityId: aboutDoc._id,
          entityTitle: "About Us Page",
          role,
          mediaId: ref.mediaId,
        });
      }
    };
    checkRef(aboutDoc.whoWeAre?.image, "Who We Are Image");
    checkRef(aboutDoc.ourMission?.image, "Mission Image");
    checkRef(aboutDoc.ourVision?.image, "Vision Image");
    checkRef(aboutDoc.ourFleet?.mainImage, "Fleet Main Image");
    aboutDoc.whyChooseUs?.sideImages?.forEach((img, idx) => checkRef(img, `Why Choose Us #${idx + 1}`));
    aboutDoc.ourFleet?.sideImages?.forEach((img, idx) => checkRef(img, `Fleet Side Image #${idx + 1}`));
    aboutDoc.team?.forEach((t) => checkRef(t.image, `Team Member (${t.name || "Member"})`));
  }

  return {
    totalUsages: usages.length,
    usages,
  };
};

// ============================================================
// CASCADE CLEANUP MEDIA REFERENCES FROM ALL ENTITIES
// ============================================================

export const cleanupMediaReferences = async (mediaIds) => {
  const objectIds = mediaIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (!objectIds.length) return 0;

  const results = await Promise.allSettled([
    // Package
    Package.updateMany(
      { "heroImage.mediaId": { $in: objectIds } },
      { $unset: { heroImage: 1 } }
    ),
    Package.updateMany(
      { "gallery.mediaId": { $in: objectIds } },
      { $pull: { gallery: { mediaId: { $in: objectIds } } } }
    ),

    // Hotel
    Hotel.updateMany(
      { "heroImage.mediaId": { $in: objectIds } },
      { $unset: { heroImage: 1 } }
    ),
    Hotel.updateMany(
      { "gallery.mediaId": { $in: objectIds } },
      { $pull: { gallery: { mediaId: { $in: objectIds } } } }
    ),
    Hotel.updateMany(
      { "roomTypes.images.mediaId": { $in: objectIds } },
      { $pull: { "roomTypes.$[].images": { mediaId: { $in: objectIds } } } }
    ),
    Hotel.updateMany(
      { ogImage: { $in: objectIds } },
      { $set: { ogImage: null } }
    ),

    // Vehicle
    Vehicle.updateMany(
      { "heroImage.mediaId": { $in: objectIds } },
      { $unset: { heroImage: 1 } }
    ),
    Vehicle.updateMany(
      { "gallery.mediaId": { $in: objectIds } },
      { $pull: { gallery: { mediaId: { $in: objectIds } } } }
    ),

    // Activity
    Activity.updateMany(
      { "heroImage.mediaId": { $in: objectIds } },
      { $unset: { heroImage: 1 } }
    ),
    Activity.updateMany(
      { "gallery.mediaId": { $in: objectIds } },
      { $pull: { gallery: { mediaId: { $in: objectIds } } } }
    ),

    // Attraction
    Attraction.updateMany(
      { "heroImage.mediaId": { $in: objectIds } },
      { $unset: { heroImage: 1 } }
    ),
    Attraction.updateMany(
      { "gallery.mediaId": { $in: objectIds } },
      { $pull: { gallery: { mediaId: { $in: objectIds } } } }
    ),

    // Country
    Country.updateMany(
      { heroImage: { $in: objectIds } },
      { $set: { heroImage: null } }
    ),
    Country.updateMany(
      { "gallery.mediaId": { $in: objectIds } },
      { $pull: { gallery: { mediaId: { $in: objectIds } } } }
    ),

    // State
    State.updateMany(
      { "heroImage.mediaId": { $in: objectIds } },
      { $unset: { heroImage: 1 } }
    ),
    State.updateMany(
      { "gallery.mediaId": { $in: objectIds } },
      { $pull: { gallery: { mediaId: { $in: objectIds } } } }
    ),

    // City
    City.updateMany(
      { "heroImage.mediaId": { $in: objectIds } },
      { $unset: { heroImage: 1 } }
    ),
    City.updateMany(
      { "gallery.mediaId": { $in: objectIds } },
      { $pull: { gallery: { mediaId: { $in: objectIds } } } }
    ),

    // Hero
    Hero.updateMany(
      { "slides.image.mediaId": { $in: objectIds } },
      { $pull: { slides: { "image.mediaId": { $in: objectIds } } } }
    ),
    Hero.updateMany(
      { "slides.thumbnail.mediaId": { $in: objectIds } },
      { $set: { "slides.$[elem].thumbnail": null } },
      { arrayFilters: [{ "elem.thumbnail.mediaId": { $in: objectIds } }] }
    ),
    Hero.updateMany(
      { "showcase.image.mediaId": { $in: objectIds } },
      { $pull: { showcase: { "image.mediaId": { $in: objectIds } } } }
    ),
    Hero.updateMany(
      { "trustCard.avatars.mediaId": { $in: objectIds } },
      { $pull: { "trustCard.avatars": { mediaId: { $in: objectIds } } } }
    ),

    // Reviews
    Review.updateMany(
      { "images.mediaId": { $in: objectIds } },
      { $pull: { images: { mediaId: { $in: objectIds } } } }
    ),

    // About Us
    AboutUs.updateMany(
      { "whoWeAre.image.mediaId": { $in: objectIds } },
      { $set: { "whoWeAre.image": null } }
    ),
    AboutUs.updateMany(
      { "ourMission.image.mediaId": { $in: objectIds } },
      { $set: { "ourMission.image": null } }
    ),
    AboutUs.updateMany(
      { "ourVision.image.mediaId": { $in: objectIds } },
      { $set: { "ourVision.image": null } }
    ),
    AboutUs.updateMany(
      { "ourFleet.mainImage.mediaId": { $in: objectIds } },
      { $set: { "ourFleet.mainImage": null } }
    ),
    AboutUs.updateMany(
      { "whyChooseUs.sideImages.mediaId": { $in: objectIds } },
      { $pull: { "whyChooseUs.sideImages": { mediaId: { $in: objectIds } } } }
    ),
    AboutUs.updateMany(
      { "ourFleet.sideImages.mediaId": { $in: objectIds } },
      { $pull: { "ourFleet.sideImages": { mediaId: { $in: objectIds } } } }
    ),
  ]);

  let totalModified = 0;
  for (const r of results) {
    if (r.status === "fulfilled" && r.value?.modifiedCount) {
      totalModified += r.value.modifiedCount;
    }
  }

  return totalModified;
};

// ============================================================
// CHECK MEDIA USAGES (Pre-delete confirmation info)
// ============================================================

export const checkMediaUsage = async (req, res) => {
  try {
    const rawIds = req.body?.ids || req.body?.mediaIds || (req.query?.id ? [req.query.id] : []);
    const ids = Array.isArray(rawIds) ? rawIds : [rawIds];
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (!validIds.length) {
      return sendResponse(res, HTTP_STATUS_CODES.OK, "No valid media IDs to check", {
        totalUsages: 0,
        usages: [],
      });
    }

    const usageData = await findMediaUsages(validIds);
    return sendResponse(res, HTTP_STATUS_CODES.OK, "Media usages checked successfully", usageData);
  } catch (error) {
    console.error("Check Media Usage Error:", error);
    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};

// ============================================================
// DELETE SINGLE MEDIA (With Cascade Cleanup & Cloudinary Deletion)
// ============================================================

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, "Invalid media ID");
    }

    const media = await Media.findOne({ _id: id });
    if (!media) {
      return sendError(res, HTTP_STATUS_CODES.NOT_FOUND, "Media not found");
    }

    // 1. Cascade cleanup references from all entities where this media is used
    const cleanedReferences = await cleanupMediaReferences([id]);

    // 2. Delete from Cloudinary CDN
    if (media.publicId) {
      try {
        await deleteFromCloudinary(media.publicId, media.resourceType);
      } catch (cErr) {
        console.warn("Could not delete from Cloudinary:", cErr.message);
      }
    }

    // 3. Mark media inactive in database
    media.isActive = false;
    media.deletedAt = new Date();
    await media.save();

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "Media deleted and unlinked successfully",
      {
        id: media._id,
        cleanedReferences,
      }
    );
  } catch (error) {
    console.error("Delete Media Error:", error);
    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};

// ============================================================
// BULK DELETE MEDIA (Multiple select)
// ============================================================

export const bulkDeleteMedia = async (req, res) => {
  try {
    const ids = req.body?.ids || req.body?.mediaIds || [];
    if (!Array.isArray(ids) || !ids.length) {
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, "No media IDs provided for bulk delete");
    }

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (!validIds.length) {
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, "No valid media IDs provided");
    }

    const mediaList = await Media.find({ _id: { $in: validIds } });
    if (!mediaList.length) {
      return sendError(res, HTTP_STATUS_CODES.NOT_FOUND, "No matching media items found to delete");
    }

    // 1. Cascade cleanup from all entities
    const cleanedReferences = await cleanupMediaReferences(validIds);

    // 2. Delete from Cloudinary in parallel
    await Promise.allSettled(
      mediaList.map((m) =>
        m.publicId ? deleteFromCloudinary(m.publicId, m.resourceType).catch(() => null) : Promise.resolve()
      )
    );

    // 3. Mark all as deleted
    await Media.updateMany(
      { _id: { $in: validIds } },
      { $set: { isActive: false, deletedAt: new Date() } }
    );

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      `${mediaList.length} media items deleted and unlinked successfully`,
      {
        deletedCount: mediaList.length,
        cleanedReferences,
      }
    );
  } catch (error) {
    console.error("Bulk Delete Media Error:", error);
    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
    );
  }
};

// ============================================================
// DOWNLOAD MEDIA AS ZIP (Selected assets or Full media library)
// ============================================================

export const downloadMediaZip = async (req, res) => {
  try {
    const rawIds = req.body?.ids || req.body?.mediaIds || (req.query?.ids ? req.query.ids.split(",") : []);
    const isAll = req.body?.all === true || req.query?.all === "true";

    let mediaItems = [];
    if (isAll) {
      mediaItems = await Media.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    } else {
      const validIds = (Array.isArray(rawIds) ? rawIds : [rawIds]).filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );
      if (!validIds.length) {
        return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, "Please specify media IDs or select all=true");
      }
      mediaItems = await Media.find({ _id: { $in: validIds }, isActive: true }).lean();
    }

    if (!mediaItems.length) {
      return sendError(res, HTTP_STATUS_CODES.NOT_FOUND, "No media files found to download");
    }

    // Download media buffers
    const files = await fetchMediaBuffers(mediaItems);
    if (!files.length) {
      return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, "Could not retrieve media assets for download");
    }

    const zipBuffer = buildZipBuffer(files);
    const filename = isAll
      ? `full-media-library-${Date.now()}.zip`
      : `selected-media-${files.length}-files-${Date.now()}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", zipBuffer.length);

    return res.end(zipBuffer);
  } catch (error) {
    console.error("Download Media Zip Error:", error);
    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Failed to package media zip archive"
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