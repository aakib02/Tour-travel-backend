import mongoose from "mongoose";

const { Schema } = mongoose;

const attractionSchema = new Schema(
  {
    // ============================================================
    // BASIC IDENTITY
    // ============================================================

    name: {
      type: String,
      required: [true, "Attraction name is required"],
      trim: true,
      minlength: [2, "Attraction name must be at least 2 characters"],
      maxlength: [150, "Attraction name cannot exceed 150 characters"],
    },

    slug: {
      type: String,
      required: [true, "Attraction slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only contain lowercase letters, numbers and hyphens",
      ],
    },

    // ============================================================
    // LOCATION RELATION
    // ============================================================

    stateId: {
      type: Schema.Types.ObjectId,
      ref: "State",
      required: [true, "State is required"],
      index: true,
    },

    cityId: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: [true, "City is required"],
      index: true,
    },

    // ============================================================
    // BASIC CONTENT
    // ============================================================

    shortDescription: {
      type: String,
      trim: true,
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [10000, "Description cannot exceed 10000 characters"],
    },

    history: {
      type: String,
      trim: true,
      maxlength: [10000, "History cannot exceed 10000 characters"],
    },

    // ============================================================
    // CATEGORY
    // ============================================================

    category: {
      type: String,
      required: [true, "Attraction category is required"],
      enum: {
        values: [
          "heritage",
          "monument",
          "fort",
          "palace",
          "temple",
          "mosque",
          "church",
          "museum",
          "wildlife",
          "national-park",
          "beach",
          "lake",
          "waterfall",
          "hill-station",
          "viewpoint",
          "market",
          "garden",
          "cultural",
          "religious",
          "adventure",
          "other",
        ],
        message: "{VALUE} is not a valid attraction category",
      },
      index: true,
    },

    subCategories: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 50,
      },
    ],

    // ============================================================
    // HIGHLIGHTS
    // ============================================================

    highlights: [
      {
        type: String,
        trim: true,
        maxlength: 300,
      },
    ],

    // ============================================================
    // VISIT INFORMATION
    // ============================================================

    recommendedDuration: {
      minMinutes: {
        type: Number,
        min: 1,
      },

      maxMinutes: {
        type: Number,
        min: 1,
      },
    },

    bestTimeToVisit: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    bestFor: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 50,
      },
    ],

    // ============================================================
    // TIMINGS
    // ============================================================

    visitingHours: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },

        isOpen: {
          type: Boolean,
          default: true,
        },

        openingTime: {
          type: String,
          trim: true,
        },

        closingTime: {
          type: String,
          trim: true,
        },

        note: {
          type: String,
          trim: true,
          maxlength: 300,
        },
      },
    ],

    // ============================================================
    // TICKET / ENTRY
    // ============================================================

    ticket: {
      required: {
        type: Boolean,
        default: false,
      },

      onlineBookingAvailable: {
        type: Boolean,
        default: false,
      },

      bookingUrl: {
        type: String,
        trim: true,
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
    },

    // ============================================================
    // LOCATION / MAP
    // ============================================================

    location: {
      address: {
        type: String,
        trim: true,
        maxlength: 1000,
      },

      landmark: {
        type: String,
        trim: true,
        maxlength: 300,
      },

      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },

      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },

      googleMapsUrl: {
        type: String,
        trim: true,
      },
    },

    // ============================================================
    // IMAGES
    // ============================================================

heroImage: {
  mediaId: {
    type: Schema.Types.ObjectId,
    ref: "Media",
    required: false,
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
},

// ============================================================
// GALLERY
// ============================================================

gallery: [
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
    // FACILITIES
    // ============================================================

    facilities: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 100,
      },
    ],

    accessibility: {
      wheelchairAccessible: {
        type: Boolean,
        default: false,
      },

      elderlyFriendly: {
        type: Boolean,
        default: false,
      },

      childFriendly: {
        type: Boolean,
        default: true,
      },

      accessibilityNotes: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
    },

    // ============================================================
    // VISITOR GUIDELINES
    // ============================================================

    visitorInformation: {
      dressCode: {
        type: String,
        trim: true,
        maxlength: 500,
      },

      photographyAllowed: {
        type: Boolean,
        default: true,
      },

      videographyAllowed: {
        type: Boolean,
        default: true,
      },

      restrictions: [
        {
          type: String,
          trim: true,
          maxlength: 300,
        },
      ],

      tips: [
        {
          type: String,
          trim: true,
          maxlength: 500,
        },
      ],
    },

    // ============================================================
    // FAQ
    // ============================================================

    faqs: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },

        answer: {
          type: String,
          required: true,
          trim: true,
          maxlength: 2000,
        },

        sortOrder: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    // ============================================================
    // RATINGS
    // ============================================================

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // ============================================================
    // STATISTICS
    // ============================================================

    stats: {
      viewCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      reviewCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      packageCount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // ============================================================
    // SEO
    // ============================================================

    seo: {
      title: {
        type: String,
        trim: true,
        maxlength: 60,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 160,
      },

      keywords: [
        {
          type: String,
          trim: true,
          lowercase: true,
          maxlength: 100,
        },
      ],

      canonicalUrl: {
        type: String,
        trim: true,
      },

      ogTitle: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      ogDescription: {
        type: String,
        trim: true,
        maxlength: 300,
      },

      ogImage: {
        type: String,
        trim: true,
      },

      noIndex: {
        type: Boolean,
        default: false,
      },
    },

    // ============================================================
    // DISCOVERY
    // ============================================================

    isPopular: {
      type: Boolean,
      default: false,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    // ============================================================
    // PUBLISHING
    // ============================================================

    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived"],
        message: "{VALUE} is not a valid attraction status",
      },
      default: "draft",
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
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

attractionSchema.index({
  cityId: 1,
  status: 1,
  isActive: 1,
});

attractionSchema.index({
  stateId: 1,
  status: 1,
  isActive: 1,
});

attractionSchema.index({
  category: 1,
  status: 1,
  isActive: 1,
});

attractionSchema.index({
  cityId: 1,
  category: 1,
});

attractionSchema.index({
  isPopular: 1,
  sortOrder: 1,
});

attractionSchema.index({
  isFeatured: 1,
  sortOrder: 1,
});

attractionSchema.index({
  name: "text",
  shortDescription: "text",
  description: "text",
  history: "text",
});


// ================================================================
// MODEL
// ================================================================

const Attraction = mongoose.model(
  "Attraction",
  attractionSchema
);

export default Attraction;