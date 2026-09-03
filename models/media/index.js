import mongoose from "mongoose";

const { Schema } = mongoose;

const mediaSchema = new Schema(
  {
    // ============================================================
    // BASIC INFORMATION
    // ============================================================

    name: {
      type: String,
      required: [true, "Media name is required"],
      trim: true,
      maxlength: 255,
    },

    originalName: {
      type: String,
      trim: true,
      maxlength: 255,
    },

    // ============================================================
    // CLOUDINARY INFORMATION
    // ============================================================

    url: {
      type: String,
      required: [true, "Media URL is required"],
      trim: true,
    },

    secureUrl: {
      type: String,
      required: [true, "Secure media URL is required"],
      trim: true,
    },

    publicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
      trim: true,
      unique: true,
      index: true,
    },

    resourceType: {
      type: String,
      enum: [
        "image",
        "video",
        "raw",
        "auto",
      ],
      default: "image",
      index: true,
    },

    format: {
      type: String,
      trim: true,
      lowercase: true,
    },

    mimeType: {
      type: String,
      trim: true,
      lowercase: true,
    },

    folder: {
      type: String,
      trim: true,
      index: true,
    },

    // ============================================================
    // FILE INFORMATION
    // ============================================================

    size: {
      type: Number,
      min: 0,
    },

    width: {
      type: Number,
      min: 0,
    },

    height: {
      type: Number,
      min: 0,
    },

    duration: {
      type: Number,
      min: 0,
    },

    // ============================================================
    // IMAGE INFORMATION
    // ============================================================

    alt: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    caption: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    // ============================================================
    // FILE HASH
    // Used to detect duplicate uploads
    // ============================================================

    fileHash: {
      type: String,
      trim: true,
      index: true,
    },

    clientUploadId: {
  type: String,
  trim: true,
  unique: true,
  sparse: true,
  index: true,
},

uploadSessionId: {
  type: String,
  trim: true,
  index: true,
},

    // ============================================================
    // USAGE
    // ============================================================

    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ============================================================
    // TAGS
    // ============================================================

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 100,
      },
    ],

    // ============================================================
    // UPLOADER
    // ============================================================

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // ============================================================
    // STATUS
    // ============================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ============================================================
    // SOFT DELETE
    // ============================================================

    deletedAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);


// ================================================================
// INDEXES
// ================================================================

mediaSchema.index({
  resourceType: 1,
  isActive: 1,
});

mediaSchema.index({
  folder: 1,
  resourceType: 1,
});

mediaSchema.index({
  uploadedBy: 1,
  createdAt: -1,
});

mediaSchema.index({
  tags: 1,
});

mediaSchema.index({
  createdAt: -1,
});


// ================================================================
// MODEL
// ================================================================

const Media = mongoose.model("Media", mediaSchema);

export default Media;