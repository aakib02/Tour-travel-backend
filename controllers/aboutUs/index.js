// import mongoose from "mongoose";

// import AboutUs from "../../models/aboutUs/index.js";

// import {
//   HTTP_STATUS_CODES,
//   RESPONSE_MESSAGES
// } from "../../helpers/response.js";

// import {
//   sendResponse,
//   sendError
// } from "../../helpers/responseHelper.js";


// // ======================================================
// // CREATE ABOUT US
// // ======================================================

// export const createAboutUs = async (req, res) => {
//   try {
//     const {
//       hero = {},
//       introduction = {},
//       story = {},
//       stats = {},
//       timeline = {},
//       offices = {},
//       cta = {}
//     } = req.body;

//     // -----------------------------------------------
//     // Check if active About Us already exists
//     // -----------------------------------------------

//     const existingAboutUs = await AboutUs.findOne({
//       isActive: true,
//       deletedAt: null
//     }).lean();

//     if (existingAboutUs) {
//       return sendError(
//         res,
//         HTTP_STATUS_CODES.CONFLICT,
//         "Active About Us content already exists"
//       );
//     }

//     // -----------------------------------------------
//     // Validate timeline order
//     // -----------------------------------------------

//     if (
//       timeline.milestones &&
//       Array.isArray(timeline.milestones)
//     ) {
//       const orders = timeline.milestones.map(
//         (item) => item.order
//       );

//       if (new Set(orders).size !== orders.length) {
//         return sendError(
//           res,
//           HTTP_STATUS_CODES.BAD_REQUEST,
//           "Timeline milestone order must be unique"
//         );
//       }
//     }

//     // -----------------------------------------------
//     // Validate feature order
//     // -----------------------------------------------

//     if (
//       introduction.features &&
//       Array.isArray(introduction.features)
//     ) {
//       const orders = introduction.features.map(
//         (item) => item.order
//       );

//       if (new Set(orders).size !== orders.length) {
//         return sendError(
//           res,
//           HTTP_STATUS_CODES.BAD_REQUEST,
//           "Introduction feature order must be unique"
//         );
//       }
//     }

//     // -----------------------------------------------
//     // Validate office order
//     // -----------------------------------------------

//     if (
//       offices.items &&
//       Array.isArray(offices.items)
//     ) {
//       const orders = offices.items.map(
//         (item) => item.order
//       );

//       if (new Set(orders).size !== orders.length) {
//         return sendError(
//           res,
//           HTTP_STATUS_CODES.BAD_REQUEST,
//           "Office order must be unique"
//         );
//       }
//     }

//     // -----------------------------------------------
//     // Create
//     // -----------------------------------------------

//     const aboutUs = await AboutUs.create({
//       hero,
//       introduction,
//       story,
//       stats,
//       timeline,
//       offices,
//       cta,

//       isActive: true,
//       deletedAt: null,

//       createdBy:
//         req.admin?._id ||
//         req.user?.id ||
//         null,

//       updatedBy:
//         req.admin?._id ||
//         req.user?.id ||
//         null
//     });

//     return sendResponse(
//       res,
//       HTTP_STATUS_CODES.CREATED,
//       RESPONSE_MESSAGES.ABOUT_US.CREATED,
//       aboutUs
//     );

//   } catch (error) {
//     console.error("Create About Us Error:", error);

//     return sendError(
//       res,
//       HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
//       RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
//     );
//   }
// };


// // ======================================================
// // GET ABOUT US
// //
// // GET /api/about-us/get
// // GET /api/about-us/get?id=ABOUT_US_ID
// // ======================================================

// export const getAboutUs = async (req, res) => {
//   try {
//     const {
//       id,
//       isActive,
//       search,
//       page = 1,
//       limit = 10,
//       sort = "-createdAt"
//     } = req.query;


//     // ==================================================
//     // GET SINGLE BY ID
//     // ==================================================

//     if (id) {

//       if (!mongoose.Types.ObjectId.isValid(id)) {
//         return sendError(
//           res,
//           HTTP_STATUS_CODES.BAD_REQUEST,
//           RESPONSE_MESSAGES.ABOUT_US.INVALID_ID
//         );
//       }

//       const aboutUs = await AboutUs.findOne({
//         _id: id,
//         isActive: true,
//         deletedAt: null
//       })
//         .populate("hero.image.mediaId")
//         .populate("introduction.image.mediaId")
//         .populate("story.mainImage.mediaId")
//         .populate("story.sideImages.mediaId")
//         .populate("offices.items.image.mediaId")
//         .lean();

//       if (!aboutUs) {
//         return sendError(
//           res,
//           HTTP_STATUS_CODES.NOT_FOUND,
//           RESPONSE_MESSAGES.ABOUT_US.NOT_FOUND
//         );
//       }

//       return sendResponse(
//         res,
//         HTTP_STATUS_CODES.OK,
//         RESPONSE_MESSAGES.ABOUT_US.FETCHED_SINGLE,
//         aboutUs
//       );
//     }


//     // ==================================================
//     // GET ALL
//     // ==================================================

//     const currentPage = Math.max(
//       Number(page) || 1,
//       1
//     );

//     const perPage = Math.min(
//       Math.max(Number(limit) || 10, 1),
//       100
//     );

//     const skip =
//       (currentPage - 1) * perPage;


//     // ==================================================
//     // QUERY
//     // ==================================================

//     const query = {};


//     // Active filter

//     if (isActive !== undefined) {
//       query.isActive =
//         isActive === "true";
//     }


//     // Search

//     if (search?.trim()) {
//       query.$or = [
//         {
//           "hero.title": {
//             $regex: search.trim(),
//             $options: "i"
//           }
//         },
//         {
//           "introduction.title": {
//             $regex: search.trim(),
//             $options: "i"
//           }
//         },
//         {
//           "story.title": {
//             $regex: search.trim(),
//             $options: "i"
//           }
//         }
//       ];
//     }


//     // ==================================================
//     // FETCH
//     // ==================================================

//     const [aboutUs, total] =
//       await Promise.all([

//         AboutUs.find(query)
//           .populate("hero.image.mediaId")
//           .populate("introduction.image.mediaId")
//           .populate("story.mainImage.mediaId")
//           .populate("story.sideImages.mediaId")
//           .populate("offices.items.image.mediaId")
//           .sort(sort)
//           .skip(skip)
//           .limit(perPage)
//           .lean(),

//         AboutUs.countDocuments(query)
//       ]);


//     return sendResponse(
//       res,
//       HTTP_STATUS_CODES.OK,
//       RESPONSE_MESSAGES.ABOUT_US.FETCHED,
//       {
//         aboutUs,
//         pagination: {
//           total,
//           page: currentPage,
//           limit: perPage,
//           totalPages: Math.ceil(
//             total / perPage
//           ),
//           hasNextPage:
//             currentPage <
//             Math.ceil(total / perPage),

//           hasPreviousPage:
//             currentPage > 1
//         }
//       }
//     );

//   } catch (error) {

//     console.error(
//       "Get About Us Error:",
//       error
//     );

//     return sendError(
//       res,
//       HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
//       RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
//     );
//   }
// };



// // ======================================================
// // GET ACTIVE ABOUT US - PUBLIC WEBSITE
// // GET /api/about-us/active
// // ======================================================

// export const getActiveAboutUs = async (req, res) => {
//   try {

//     // --------------------------------------------------
//     // FETCH ACTIVE ABOUT US
//     // --------------------------------------------------

//     const aboutUs = await AboutUs.findOne({
//       isActive: true,
//     })

//       // Hero
//       .populate("hero.image.mediaId")

//       // Introduction
//       .populate("introduction.image.mediaId")

//       // Story
//       .populate("story.mainImage.mediaId")
//       .populate("story.sideImages.mediaId")

//       // Offices
//       .populate("offices.items.image.mediaId")

//       .lean();


//     // --------------------------------------------------
//     // NOT FOUND
//     // --------------------------------------------------

//     if (!aboutUs) {
//       return sendError(
//         res,
//         HTTP_STATUS_CODES.NOT_FOUND,
//         RESPONSE_MESSAGES.ABOUT_US?.NOT_FOUND ||
//           "Active About Us not found"
//       );
//     }


//     // --------------------------------------------------
//     // FILTER + SORT INTRODUCTION FEATURES
//     // --------------------------------------------------

//     if (aboutUs.introduction?.features) {
//       aboutUs.introduction.features =
//         aboutUs.introduction.features
//           .filter(
//             (feature) =>
//               feature.isActive !== false
//           )
//           .sort(
//             (a, b) =>
//               (a.order || 0) -
//               (b.order || 0)
//           );
//     }


//     // --------------------------------------------------
//     // FILTER + SORT TIMELINE MILESTONES
//     // --------------------------------------------------

//     if (aboutUs.timeline?.milestones) {
//       aboutUs.timeline.milestones =
//         aboutUs.timeline.milestones
//           .filter(
//             (milestone) =>
//               milestone.isActive !== false
//           )
//           .sort(
//             (a, b) =>
//               (a.order || 0) -
//               (b.order || 0)
//           );
//     }


//     // --------------------------------------------------
//     // FILTER + SORT OFFICES
//     // --------------------------------------------------

//     if (aboutUs.offices?.items) {
//       aboutUs.offices.items =
//         aboutUs.offices.items
//           .filter(
//             (office) =>
//               office.isActive !== false
//           )
//           .sort(
//             (a, b) =>
//               (a.order || 0) -
//               (b.order || 0)
//           );
//     }


//     // --------------------------------------------------
//     // RESPONSE
//     // --------------------------------------------------

//     return sendResponse(
//       res,
//       HTTP_STATUS_CODES.OK,
//       RESPONSE_MESSAGES.ABOUT_US?.FETCHED ||
//         "About Us fetched successfully",
//       aboutUs
//     );

//   } catch (error) {

//     console.error(
//       "Get Active About Us Error:",
//       error
//     );

//     return sendError(
//       res,
//       HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
//       RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
//     );
//   }
// };
// // ======================================================
// // UPDATE ABOUT US
// // ======================================================

// export const updateAboutUs = async (req, res) => {
//   try {

//     const { id } = req.params;


//     // -----------------------------------------------
//     // Validate ID
//     // -----------------------------------------------

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return sendError(
//         res,
//         HTTP_STATUS_CODES.BAD_REQUEST,
//         RESPONSE_MESSAGES.ABOUT_US.INVALID_ID
//       );
//     }


//     // -----------------------------------------------
//     // Allowed fields
//     // -----------------------------------------------

//     const allowedFields = [
//       "hero",
//       "introduction",
//       "story",
//       "stats",
//       "timeline",
//       "offices",
//       "cta",
//       "isActive"
//     ];


//     const updateData = {};


//     allowedFields.forEach((field) => {

//       if (
//         req.body[field] !== undefined
//       ) {
//         updateData[field] =
//           req.body[field];
//       }

//     });


//     if (
//       Object.keys(updateData).length === 0
//     ) {
//       return sendError(
//         res,
//         HTTP_STATUS_CODES.BAD_REQUEST,
//         "No valid fields provided for update"
//       );
//     }


//     // -----------------------------------------------
//     // Validate timeline order
//     // -----------------------------------------------

//     if (
//       updateData.timeline?.milestones &&
//       Array.isArray(
//         updateData.timeline.milestones
//       )
//     ) {

//       const orders =
//         updateData.timeline.milestones.map(
//           (item) => item.order
//         );

//       if (
//         new Set(orders).size !==
//         orders.length
//       ) {
//         return sendError(
//           res,
//           HTTP_STATUS_CODES.BAD_REQUEST,
//           "Timeline milestone order must be unique"
//         );
//       }
//     }


//     // -----------------------------------------------
//     // Validate feature order
//     // -----------------------------------------------

//     if (
//       updateData.introduction?.features &&
//       Array.isArray(
//         updateData.introduction.features
//       )
//     ) {

//       const orders =
//         updateData.introduction.features.map(
//           (item) => item.order
//         );

//       if (
//         new Set(orders).size !==
//         orders.length
//       ) {
//         return sendError(
//           res,
//           HTTP_STATUS_CODES.BAD_REQUEST,
//           "Introduction feature order must be unique"
//         );
//       }
//     }


//     // -----------------------------------------------
//     // Validate office order
//     // -----------------------------------------------

//     if (
//       updateData.offices?.items &&
//       Array.isArray(
//         updateData.offices.items
//       )
//     ) {

//       const orders =
//         updateData.offices.items.map(
//           (item) => item.order
//         );

//       if (
//         new Set(orders).size !==
//         orders.length
//       ) {
//         return sendError(
//           res,
//           HTTP_STATUS_CODES.BAD_REQUEST,
//           "Office order must be unique"
//         );
//       }
//     }


//     // -----------------------------------------------
//     // Audit
//     // -----------------------------------------------

//     updateData.updatedBy =
//       req.admin?._id ||
//       req.user?.id ||
//       null;


//     // -----------------------------------------------
//     // Update
//     // -----------------------------------------------

//     const aboutUs =
//       await AboutUs.findOneAndUpdate(
//         {
//           _id: id,
//           isActive: true,
//           deletedAt: null
//         },

//         {
//           $set: updateData
//         },

//         {
//           new: true,
//           runValidators: true
//         }
//       )
//         .populate("hero.image.mediaId")
//         .populate("introduction.image.mediaId")
//         .populate("story.mainImage.mediaId")
//         .populate("story.sideImages.mediaId")
//         .populate("offices.items.image.mediaId");


//     if (!aboutUs) {
//       return sendError(
//         res,
//         HTTP_STATUS_CODES.NOT_FOUND,
//         RESPONSE_MESSAGES.ABOUT_US.NOT_FOUND
//       );
//     }


//     return sendResponse(
//       res,
//       HTTP_STATUS_CODES.OK,
//       RESPONSE_MESSAGES.ABOUT_US.UPDATED,
//       aboutUs
//     );

//   } catch (error) {

//     console.error(
//       "Update About Us Error:",
//       error
//     );

//     return sendError(
//       res,
//       HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
//       RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
//     );
//   }
// };


// // ======================================================
// // DELETE ABOUT US
// // ======================================================

// export const deleteAboutUs = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return sendError(
//         res,
//         HTTP_STATUS_CODES.BAD_REQUEST,
//         "Invalid About Us ID"
//       );
//     }

//     const aboutUs = await AboutUs.findByIdAndDelete(id);

//     if (!aboutUs) {
//       return sendError(
//         res,
//         HTTP_STATUS_CODES.NOT_FOUND,
//         "About Us not found"
//       );
//     }

//     return sendResponse(
//       res,
//       HTTP_STATUS_CODES.OK,
//       RESPONSE_MESSAGES.ABOUT_US?.DELETED ||
//         "About Us deleted successfully",
//       {
//         _id: aboutUs._id,
//       }
//     );

//   } catch (error) {
//     console.error(
//       "Delete About Us Error:",
//       error
//     );

//     return sendError(
//       res,
//       HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
//       RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
//     );
//   }
// };


// // ======================================================
// // RESTORE ABOUT US
// // ======================================================

// export const restoreAboutUs = async (req, res) => {
//   try {

//     const { id } = req.params;


//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return sendError(
//         res,
//         HTTP_STATUS_CODES.BAD_REQUEST,
//         RESPONSE_MESSAGES.ABOUT_US.INVALID_ID
//       );
//     }


//     const aboutUs =
//       await AboutUs.findOneAndUpdate(

//         {
//           _id: id,
//           isActive: false
//         },

//         {
//           $set: {
//             isActive: true,
//             deletedAt: null,

//             updatedBy:
//               req.admin?._id ||
//               req.user?.id ||
//               null
//           }
//         },

//         {
//           new: true
//         }
//       );


//     if (!aboutUs) {
//       return sendError(
//         res,
//         HTTP_STATUS_CODES.NOT_FOUND,
//         RESPONSE_MESSAGES.ABOUT_US.NOT_FOUND
//       );
//     }


//     return sendResponse(
//       res,
//       HTTP_STATUS_CODES.OK,
//       RESPONSE_MESSAGES.ABOUT_US.RESTORED,
//       aboutUs
//     );

//   } catch (error) {

//     console.error(
//       "Restore About Us Error:",
//       error
//     );

//     return sendError(
//       res,
//       HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
//       RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
//     );
//   }
// };


import mongoose from "mongoose";
import AboutUs from "../../models/aboutUs/index.js";
import {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} from "../../helpers/response.js";
import {
  sendResponse,
  sendError,
} from "../../helpers/responseHelper.js";

// ============================================================================
// PRIVATE UTILITIES & DTO BUILDERS
// ============================================================================

/**
 * Standardized Query Populator with Selective Projection
 */
const applyPopulatePipeline = (query) => {
  return query
    .populate({
      path: "hero.image.mediaId",
      select: "name url secureUrl alt originalName width height mimeType",
    })
    .populate({
      path: "introduction.image.mediaId",
      select: "name url secureUrl alt originalName width height mimeType",
    })
    .populate({
      path: "introduction.sideImages.mediaId",
      select: "name url secureUrl alt originalName width height mimeType",
    })
    .populate({
      path: "story.mainImage.mediaId",
      select: "name url secureUrl alt originalName width height mimeType",
    })
    .populate({
      path: "story.sideImages.mediaId",
      select: "name url secureUrl alt originalName width height mimeType",
    })
    .populate({
      path: "offices.items.image.mediaId",
      select: "name url secureUrl alt originalName width height mimeType",
    })
    .populate('cta.image.mediaId');
};

/**
 * Validates ObjectId format
 */
const isValidObjectId = (id) => {
  return id && mongoose.Types.ObjectId.isValid(id);
};

/**
 * Extracts Authenticated Actor Identity
 */
const extractActorId = (req) => {
  const actor = req.admin?._id || req.user?.id || req.user?._id;
  return isValidObjectId(actor) ? new mongoose.Types.ObjectId(actor) : null;
};

/**
 * Cleans Media Reference Structure
 */
const sanitizeMediaRef = (ref) => {
  if (!ref) return null;
  const mediaId = typeof ref === "object" ? ref.mediaId || ref._id : ref;
  if (!isValidObjectId(mediaId)) return null;

  return {
    mediaId: new mongoose.Types.ObjectId(mediaId),
    url: typeof ref === "object" && typeof ref.url === "string" ? ref.url.trim() : null,
    alt: typeof ref === "object" && typeof ref.alt === "string" ? ref.alt.trim() : null,
    title: typeof ref === "object" && typeof ref.title === "string" ? ref.title.trim() : null,
  };
};

/**
 * Validates strictly ordered entity collections
 */
const validateSequentialOrders = (items, entityName = "Item") => {
  if (!Array.isArray(items) || items.length === 0) return null;
  const orders = items.map((i) => i.order);

  if (orders.some((ord) => !Number.isInteger(ord) || ord < 1)) {
    return `${entityName} orders must be positive integers.`;
  }
  if (new Set(orders).size !== orders.length) {
    return `Duplicate orders detected in ${entityName}. Each order must be distinct.`;
  }
  return null;
};

/**
 * Enforces Strict Schema Serialization (DTO Filtering)
 */
const sanitizeAboutUsPayload = (body, actorId) => {
  const sanitized = {};

  // 1. HERO
  if (body.hero && typeof body.hero === "object") {
    sanitized.hero = {
      image: sanitizeMediaRef(body.hero.image),
      eyebrow: typeof body.hero.eyebrow === "string" ? body.hero.eyebrow.trim() : undefined,
      title: typeof body.hero.title === "string" ? body.hero.title.trim() : undefined,
      highlightedTitle: typeof body.hero.highlightedTitle === "string" ? body.hero.highlightedTitle.trim() : undefined,
      description: typeof body.hero.description === "string" ? body.hero.description.trim() : undefined,
    };
  }

  // 2. INTRODUCTION
  if (body.introduction && typeof body.introduction === "object") {
    sanitized.introduction = {
      image: sanitizeMediaRef(body.introduction.image),
      eyebrow: typeof body.introduction.eyebrow === "string" ? body.introduction.eyebrow.trim() : undefined,
      title: typeof body.introduction.title === "string" ? body.introduction.title.trim() : undefined,
      paragraphs: Array.isArray(body.introduction.paragraphs)
        ? body.introduction.paragraphs.map((p) => String(p).trim()).filter(Boolean)
        : [],
      sideImages: Array.isArray(body.introduction.sideImages)
        ? body.introduction.sideImages.map(sanitizeMediaRef).filter(Boolean)
        : [],
      features: Array.isArray(body.introduction.features)
        ? body.introduction.features.map((f, idx) => ({
            icon: typeof f.icon === "string" ? f.icon.trim() : "compass",
            title: typeof f.title === "string" ? f.title.trim() : "",
            description: typeof f.description === "string" ? f.description.trim() : "",
            order: Number.isInteger(f.order) ? f.order : idx + 1,
            isActive: f.isActive !== false,
          }))
        : [],
      button: body.introduction.button && typeof body.introduction.button === "object"
        ? {
            text: typeof body.introduction.button.text === "string" ? body.introduction.button.text.trim() : "",
            url: typeof body.introduction.button.url === "string" ? body.introduction.button.url.trim() : "",
            openInNewTab: Boolean(body.introduction.button.openInNewTab),
            isActive: body.introduction.button.isActive !== false,
          }
        : null,
    };
  }

  // 3. STORY
  if (body.story && typeof body.story === "object") {
    sanitized.story = {
      mainImage: sanitizeMediaRef(body.story.mainImage),
      foundedYear: typeof body.story.foundedYear === "string" ? body.story.foundedYear.trim() : "2009",
      eyebrow: typeof body.story.eyebrow === "string" ? body.story.eyebrow.trim() : undefined,
      title: typeof body.story.title === "string" ? body.story.title.trim() : undefined,
      highlightedTitle: typeof body.story.highlightedTitle === "string" ? body.story.highlightedTitle.trim() : undefined,
      paragraphs: Array.isArray(body.story.paragraphs)
        ? body.story.paragraphs.map((p) => String(p).trim()).filter(Boolean)
        : [],
      sideImages: Array.isArray(body.story.sideImages)
        ? body.story.sideImages.map(sanitizeMediaRef).filter(Boolean)
        : [],
    };
  }

  // 4. STATS
  if (body.stats && typeof body.stats === "object") {
    sanitized.stats = {
      happyTravelers: Math.max(0, parseInt(body.stats.happyTravelers, 10) || 0),
      destinations: Math.max(0, parseInt(body.stats.destinations, 10) || 0),
      satisfactionRate: Math.min(100, Math.max(0, parseInt(body.stats.satisfactionRate, 10) || 0)),
      yearsExperience: Math.max(0, parseInt(body.stats.yearsExperience, 10) || 0),
    };
  }

  // 5. TIMELINE
  if (body.timeline && typeof body.timeline === "object") {
    sanitized.timeline = {
      sectionEyebrow: typeof body.timeline.sectionEyebrow === "string" ? body.timeline.sectionEyebrow.trim() : undefined,
      title: typeof body.timeline.title === "string" ? body.timeline.title.trim() : undefined,
      description: typeof body.timeline.description === "string" ? body.timeline.description.trim() : undefined,
      milestones: Array.isArray(body.timeline.milestones)
        ? body.timeline.milestones.map((m, idx) => ({
            year: typeof m.year === "string" ? m.year.trim() : "",
            step: typeof m.step === "string" ? m.step.trim() : `0${idx + 1}`,
            title: typeof m.title === "string" ? m.title.trim() : "",
            description: typeof m.description === "string" ? m.description.trim() : "",
            icon: typeof m.icon === "string" ? m.icon.trim() : undefined,
            order: Number.isInteger(m.order) ? m.order : idx + 1,
            isActive: m.isActive !== false,
          }))
        : [],
    };
  }

  // 6. OFFICES
  if (body.offices && typeof body.offices === "object") {
    sanitized.offices = {
      sectionEyebrow: typeof body.offices.sectionEyebrow === "string" ? body.offices.sectionEyebrow.trim() : undefined,
      title: typeof body.offices.title === "string" ? body.offices.title.trim() : undefined,
      items: Array.isArray(body.offices.items)
        ? body.offices.items.map((o, idx) => ({
            name: typeof o.name === "string" ? o.name.trim() : "",
            city: typeof o.city === "string" ? o.city.trim() : "",
            state: typeof o.state === "string" ? o.state.trim() : "",
            country: typeof o.country === "string" && o.country.trim() ? o.country.trim() : "India",
            address: typeof o.address === "string" ? o.address.trim() : "",
            phone: typeof o.phone === "string" ? o.phone.trim() : "",
            email: typeof o.email === "string" ? o.email.trim().toLowerCase() : "",
            timing: typeof o.timing === "string" ? o.timing.trim() : "Mon – Sun: 9:00 AM – 9:00 PM",
            emergencySupport: typeof o.emergencySupport === "string" ? o.emergencySupport.trim() : "Emergency 24x7",
            mapUrl: typeof o.mapUrl === "string" ? o.mapUrl.trim() : "",
            image: sanitizeMediaRef(o.image || o.mediaId),
            order: Number.isInteger(o.order) ? o.order : idx + 1,
            isActive: o.isActive !== false,
          }))
        : [],
    };
  }

  // 7. CTA
  if (body.cta && typeof body.cta === "object") {
    sanitized.cta = {
      image: sanitizeMediaRef(body.cta.image || body.cta.mediaId),
      badge: typeof body.cta.badge === "string" ? body.cta.badge.trim() : undefined,
      title: typeof body.cta.title === "string" ? body.cta.title.trim() : undefined,
      description: typeof body.cta.description === "string" ? body.cta.description.trim() : undefined,
      phone: typeof body.cta.phone === "string" ? body.cta.phone.trim() : undefined,
      bottomText: typeof body.cta.bottomText === "string" ? body.cta.bottomText.trim() : undefined,
      primaryButton: body.cta.primaryButton && typeof body.cta.primaryButton === "object"
        ? {
            text: typeof body.cta.primaryButton.text === "string" ? body.cta.primaryButton.text.trim() : "",
            url: typeof body.cta.primaryButton.url === "string" ? body.cta.primaryButton.url.trim() : "",
            openInNewTab: Boolean(body.cta.primaryButton.openInNewTab),
            isActive: body.cta.primaryButton.isActive !== false,
          }
        : null,
      whatsappButton: body.cta.whatsappButton && typeof body.cta.whatsappButton === "object"
        ? {
            text: typeof body.cta.whatsappButton.text === "string" ? body.cta.whatsappButton.text.trim() : "",
            url: typeof body.cta.whatsappButton.url === "string" ? body.cta.whatsappButton.url.trim() : "",
            openInNewTab: Boolean(body.cta.whatsappButton.openInNewTab),
            isActive: body.cta.whatsappButton.isActive !== false,
          }
        : null,
    };
  }

  sanitized.updatedBy = actorId;
  return sanitized;
};

// ============================================================================
// CONTROLLER HANDLERS
// ============================================================================

/**
 * @desc    Atomic Create or Update (Upsert) Active About Us Configuration
 * @route   POST /api/about-us/create
 * @access  Private (Admin)
 */
export const createAboutUs = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const actorId = extractActorId(req);
    const sanitizedData = sanitizeAboutUsPayload(req.body, actorId);

    // Business Logic Validation
    const featureErr = validateSequentialOrders(sanitizedData.introduction?.features, "Introduction Feature");
    if (featureErr) {
      await session.abortTransaction();
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, featureErr);
    }

    const milestoneErr = validateSequentialOrders(sanitizedData.timeline?.milestones, "Timeline Milestone");
    if (milestoneErr) {
      await session.abortTransaction();
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, milestoneErr);
    }

    const officeErr = validateSequentialOrders(sanitizedData.offices?.items, "Office");
    if (officeErr) {
      await session.abortTransaction();
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, officeErr);
    }

    // Check for existing single active master configuration
    let aboutUsDoc = await AboutUs.findOne({ isActive: true, deletedAt: null }).session(session);

    if (aboutUsDoc) {
      // Overwrite/Update existing singleton doc safely
      Object.assign(aboutUsDoc, sanitizedData);
      aboutUsDoc.updatedBy = actorId;
      await aboutUsDoc.save({ session, runValidators: true });
    } else {
      // Create fresh document
      const [created] = await AboutUs.create(
        [
          {
            ...sanitizedData,
            isActive: true,
            deletedAt: null,
            createdBy: actorId,
            updatedBy: actorId,
          },
        ],
        { session }
      );
      aboutUsDoc = created;
    }

    await session.commitTransaction();

    const populatedResponse = await applyPopulatePipeline(
      AboutUs.findById(aboutUsDoc._id)
    ).lean();

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      "About Us configuration saved successfully",
      populatedResponse
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("[CRITICAL] Create/Update AboutUs Exception:", error);
    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error.message || "Failed to persist About Us settings"
    );
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Fetch Active About Us Configuration (Optimized for Customer Portal)
 * @route   GET /api/about-us/active
 * @access  Public
 */
export const getActiveAboutUs = async (req, res) => {
  try {
    const aboutUs = await applyPopulatePipeline(
      AboutUs.findOne({ isActive: true, deletedAt: null }).sort({ updatedAt: -1 })
    ).lean();

    if (!aboutUs) {
      return sendError(res, HTTP_STATUS_CODES.NOT_FOUND, "No active About Us configuration available.");
    }

    // Defensive client-friendly sorting & active filtering
    if (Array.isArray(aboutUs.introduction?.features)) {
      aboutUs.introduction.features = aboutUs.introduction.features
        .filter((f) => f.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    if (Array.isArray(aboutUs.timeline?.milestones)) {
      aboutUs.timeline.milestones = aboutUs.timeline.milestones
        .filter((m) => m.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    if (Array.isArray(aboutUs.offices?.items)) {
      aboutUs.offices.items = aboutUs.offices.items
        .filter((o) => o.isActive !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return sendResponse(
      res,
      HTTP_STATUS_CODES.OK,
      RESPONSE_MESSAGES.ABOUT_US?.FETCHED || "About Us fetched successfully",
      aboutUs
    );
  } catch (error) {
    console.error("[CRITICAL] GetActive AboutUs Exception:", error);
    return sendError(
      res,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      "Internal server error retrieving public about-us profile"
    );
  }
};

/**
 * @desc    Fetch Single by ID or Paginated List (Admin Panel)
 * @route   GET /api/about-us/get
 * @access  Private (Admin)
 */
export const getAboutUs = async (req, res) => {
  try {
    const { id, search, page = 1, limit = 10, isActive } = req.query;

    // Direct ID query
    if (id) {
      if (!isValidObjectId(id)) {
        return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, "Invalid About Us ID supplied");
      }

      const singleDoc = await applyPopulatePipeline(AboutUs.findById(id)).lean();
      if (!singleDoc) {
        return sendError(res, HTTP_STATUS_CODES.NOT_FOUND, "About Us document not found");
      }

      return sendResponse(res, HTTP_STATUS_CODES.OK, "About Us document retrieved", singleDoc);
    }

    // Query builder
    const query = { deletedAt: null };

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (search && typeof search === "string" && search.trim()) {
      const sanitizedRegex = { $regex: search.trim(),$options: "i" };
      query.$or = [
        { "hero.title": sanitizedRegex },
        { "introduction.title": sanitizedRegex },
        { "story.title": sanitizedRegex },
      ];
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (currentPage - 1) * perPage;

    const [documents, total] = await Promise.all([
      applyPopulatePipeline(AboutUs.find(query).sort("-createdAt").skip(skip).limit(perPage)).lean(),
      AboutUs.countDocuments(query),
    ]);

    return sendResponse(res, HTTP_STATUS_CODES.OK, "About Us list retrieved", {
      aboutUs: documents,
      pagination: {
        total,
        page: currentPage,
        limit: perPage,
        totalPages: Math.ceil(total / perPage),
        hasNextPage: currentPage < Math.ceil(total / perPage),
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("[CRITICAL] GetAboutUs Query Exception:", error);
    return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, "Server query failure");
  }
};

/**
 * @desc    Atomic Partial Update by ID
 * @route   PUT /api/about-us/:id
 * @access  Private (Admin)
 */
export const updateAboutUs = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, "Malformed target About Us ID");
    }

    const actorId = extractActorId(req);
    const updateData = sanitizeAboutUsPayload(req.body, actorId);

    if (Object.keys(updateData).length === 0) {
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, "No valid attributes provided for update");
    }

    const updatedDoc = await AboutUs.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedDoc) {
      return sendError(res, HTTP_STATUS_CODES.NOT_FOUND, "Target About Us entity does not exist");
    }

    const populatedDoc = await applyPopulatePipeline(AboutUs.findById(updatedDoc._id)).lean();

    return sendResponse(res, HTTP_STATUS_CODES.OK, "About Us entity updated successfully", populatedDoc);
  } catch (error) {
    console.error("[CRITICAL] UpdateAboutUs Exception:", error);
    return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, error.message || "Failed to update record");
  }
};

/**
 * @desc    Soft Delete About Us Configuration
 * @route   DELETE /api/about-us/:id
 * @access  Private (Admin)
 */
export const deleteAboutUs = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, "Invalid ID provided for deletion");
    }

    const actorId = extractActorId(req);

    const deleted = await AboutUs.findOneAndUpdate(
      { _id: id, deletedAt: null },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
          updatedBy: actorId,
        },
      },
      { new: true }
    );

    if (!deleted) {
      return sendError(res, HTTP_STATUS_CODES.NOT_FOUND, "Active record not found or already deleted");
    }

    return sendResponse(res, HTTP_STATUS_CODES.OK, "Record marked as deleted", { _id: id });
  } catch (error) {
    console.error("[CRITICAL] DeleteAboutUs Exception:", error);
    return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to delete record");
  }
};

/**
 * @desc    Restore Soft-Deleted About Us Configuration
 * @route   PATCH /api/about-us/:id/restore
 * @access  Private (Admin)
 */
export const restoreAboutUs = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      await session.abortTransaction();
      return sendError(res, HTTP_STATUS_CODES.BAD_REQUEST, "Invalid target ID");
    }

    const actorId = extractActorId(req);

    // Deactivate all others to preserve singleton invariant
    await AboutUs.updateMany({ _id: { $ne: id }, isActive: true }, {$set: { isActive: false } }).session(session);

    const restored = await AboutUs.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          isActive: true,
          deletedAt: null,
          updatedBy: actorId,
        },
      },
      { new: true, session }
    );

    if (!restored) {
      await session.abortTransaction();
      return sendError(res, HTTP_STATUS_CODES.NOT_FOUND, "Entity not found");
    }

    await session.commitTransaction();

    const populated = await applyPopulatePipeline(AboutUs.findById(id)).lean();
    return sendResponse(res, HTTP_STATUS_CODES.OK, "Record restored as active configuration", populated);
  } catch (error) {
    await session.abortTransaction();
    console.error("[CRITICAL] RestoreAboutUs Exception:", error);
    return sendError(res, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, "Restoration operation failed");
  } finally {
    session.endSession();
  }
};