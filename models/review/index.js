import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    // ============================================================
    // USER
    // ============================================================

customer: {
  name: {
    type: String,
    required: [true, "Customer name is required"],
    trim: true,
    maxlength: 150,
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 255,
  },

  phone: {
    type: String,
    trim: true,
    maxlength: 20,
  },
},

    // ============================================================
    // REVIEW TARGET
    // Package / Hotel / Activity / Attraction / City / State
    // ============================================================

    targetType: {
      type: String,
      required: [true, "Review target type is required"],
      enum: {
        values: [
          "Package",
          "Hotel",
          "Activity",
          "Attraction",
          "City",
          "State",
        ],
        message: "{VALUE} is not a valid review target",
      },
      index: true,
    },

    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, "Review target is required"],
      refPath: "targetType",
      index: true,
    },

    // ============================================================
    // RATING
    // ============================================================

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    // ============================================================
    // REVIEW CONTENT
    // ============================================================

    title: {
      type: String,
      trim: true,
      maxlength: [200, "Review title cannot exceed 200 characters"],
    },

    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [5, "Review must contain at least 5 characters"],
      maxlength: [5000, "Review cannot exceed 5000 characters"],
    },

    // ============================================================
    // USER EXPERIENCE
    // ============================================================

    travelDate: {
      type: Date,
      default: null,
    },

    tripType: {
      type: String,
      enum: [
        "solo",
        "couple",
        "family",
        "friends",
        "business",
        "group",
        "honeymoon",
        "other",
      ],
      default: "other",
    },

    // ============================================================
    // REVIEW IMAGES
    // ============================================================

images: [
  {
    mediaId: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      required: true,
    },

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

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
],

    // ============================================================
    // VERIFIED REVIEW
    // ============================================================

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    verificationSource: {
      type: String,
      enum: [
        "booking",
        "manual",
        "admin",
        "none",
      ],
      default: "none",
    },

    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },

    // ============================================================
    // REVIEW STATUS
    // ============================================================

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "hidden",
      ],
      default: "pending",
      index: true,
    },

    // ============================================================
    // ADMIN MODERATION
    // ============================================================

    moderation: {
      moderatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      moderatedAt: {
        type: Date,
        default: null,
      },

      reason: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
    },

    // ============================================================
    // REVIEW HELPFULNESS
    // ============================================================

    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ============================================================
    // ADMIN FEATURE
    // ============================================================

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ============================================================
    // SOFT DELETE
    // ============================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // AUDIT
    // ============================================================

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

// Get reviews for a particular target
reviewSchema.index({
  targetType: 1,
  targetId: 1,
  status: 1,
  isActive: 1,
});

// Get user's reviews
reviewSchema.index({
  userId: 1,
  createdAt: -1,
});

// Latest approved reviews
reviewSchema.index({
  status: 1,
  isActive: 1,
  createdAt: -1,
});

// Featured reviews
reviewSchema.index({
  isFeatured: 1,
  status: 1,
  sortOrder: 1,
});

// Verified reviews
reviewSchema.index({
  isVerified: 1,
  status: 1,
  createdAt: -1,
});

// Rating sorting/filtering
reviewSchema.index({
  rating: -1,
});


// ================================================================
// MODEL
// ================================================================

const Review = mongoose.model("Review", reviewSchema);

export default Review;