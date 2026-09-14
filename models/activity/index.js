import mongoose from "mongoose";

const { Schema } = mongoose;

const activitySchema = new Schema(
  {
    // ============================================================
    // BASIC IDENTITY
    // ============================================================

    name: {
      type: String,
      required: [true, "Activity name is required"],
      trim: true,
      minlength: [2, "Activity name must be at least 2 characters"],
      maxlength: [150, "Activity name cannot exceed 150 characters"],
    },

    slug: {
      type: String,
      required: [true, "Activity slug is required"],
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

    // Optional:
    // Some activities are attached to a particular attraction,
    // while others are available throughout the city.
    attractionId: {
      type: Schema.Types.ObjectId,
      ref: "Attraction",
      default: null,
      index: true,
    },

    // ============================================================
    // DESCRIPTION
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

    // ============================================================
    // CATEGORY
    // ============================================================

    category: {
      type: String,
      required: [true, "Activity category is required"],
      enum: {
        values: [
          "adventure",
          "culture",
          "heritage",
          "wildlife",
          "water-sports",
          "trekking",
          "safari",
          "sightseeing",
          "food",
          "shopping",
          "wellness",
          "spiritual",
          "photography",
          "nightlife",
          "family",
          "romantic",
          "luxury",
          "local-experience",
          "art-and-craft",
          "other",
        ],
        message: "{VALUE} is not a valid activity category",
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
    // EXPERIENCE
    // ============================================================

    highlights: [
      {
        type: String,
        trim: true,
        maxlength: 300,
      },
    ],

    suitableFor: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 50,
      },
    ],

    requirements: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    importantInformation: [
      {
        type: String,
        trim: true,
        maxlength: 1000,
      },
    ],

    // ============================================================
    // DURATION
    // ============================================================

    duration: {
      minMinutes: {
        type: Number,
        required: true,
        min: 1,
      },

      maxMinutes: {
        type: Number,
        required: true,
        min: 1,
      },

      displayText: {
        type: String,
        trim: true,
        maxlength: 100,
      },
    },

    // ============================================================
    // AVAILABILITY
    // ============================================================

    availability: {
      availableDays: [
        {
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
      ],

      startTime: {
        type: String,
        trim: true,
      },

      endTime: {
        type: String,
        trim: true,
      },

      seasonalAvailability: {
        type: Boolean,
        default: false,
      },

      seasonStart: {
        type: String,
        trim: true,
      },

      seasonEnd: {
        type: String,
        trim: true,
      },

      advanceBookingRequired: {
        type: Boolean,
        default: false,
      },

      advanceBookingHours: {
        type: Number,
        min: 0,
      },
    },

    // ============================================================
    // PARTICIPANTS
    // ============================================================

    participants: {
      min: {
        type: Number,
        default: 1,
        min: 1,
      },

      max: {
        type: Number,
        default: 10,
        min: 1,
      },

      ageRestriction: {
        minAge: {
          type: Number,
          min: 0,
        },

        maxAge: {
          type: Number,
          min: 0,
        },
      },

      childrenAllowed: {
        type: Boolean,
        default: true,
      },

      infantsAllowed: {
        type: Boolean,
        default: true,
      },
    },

    // ============================================================
    // BOOKING
    // ============================================================

    booking: {
      available: {
        type: Boolean,
        default: true,
      },

      instantBooking: {
        type: Boolean,
        default: false,
      },

      confirmationType: {
        type: String,
        enum: [
          "instant",
          "manual",
          "request",
        ],
        default: "manual",
      },

      bookingCutoffHours: {
        type: Number,
        min: 0,
        default: 24,
      },

      cancellationAllowed: {
        type: Boolean,
        default: true,
      },

      cancellationHours: {
        type: Number,
        min: 0,
      },
    },

    // ============================================================
    // LOCATION DETAILS
    // ============================================================

    location: {
      meetingPoint: {
        type: String,
        trim: true,
        maxlength: 1000,
      },

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

      pickupAvailable: {
        type: Boolean,
        default: false,
      },

      pickupDescription: {
        type: String,
        trim: true,
        maxlength: 1000,
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
    // INCLUSIONS / EXCLUSIONS
    // ============================================================

    inclusions: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    exclusions: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    // ============================================================
    // SAFETY
    // ============================================================

    // ============================================================
// SAFETY
// ============================================================

safety: {
  safetyRequired: {
    type: Boolean,
    default: false,
  },

  safetyInstructions: [
    {
      type: String,
      trim: true,
      maxlength: 500,
    },
  ],

  equipmentProvided: [
    {
      type: String,
      trim: true,
      maxlength: 200,
    },
  ],

  equipmentRequired: [
    {
      type: String,
      trim: true,
      maxlength: 200,
    },
  ],
},

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

      bookingCount: {
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
        values: [
          "draft",
          "published",
          "archived",
        ],
        message: "{VALUE} is not a valid activity status",
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

activitySchema.index({
  cityId: 1,
  status: 1,
  isActive: 1,
});

activitySchema.index({
  stateId: 1,
  status: 1,
  isActive: 1,
});

activitySchema.index({
  attractionId: 1,
  status: 1,
  isActive: 1,
});

activitySchema.index({
  category: 1,
  status: 1,
  isActive: 1,
});

activitySchema.index({
  cityId: 1,
  category: 1,
});


activitySchema.index({
  isPopular: 1,
  sortOrder: 1,
});

activitySchema.index({
  isFeatured: 1,
  sortOrder: 1,
});

activitySchema.index({
  name: "text",
  shortDescription: "text",
  description: "text",
  highlights: "text",
});


// ================================================================
// MODEL
// ================================================================

const Activity = mongoose.model(
  "Activity",
  activitySchema
);

export default Activity;