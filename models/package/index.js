import mongoose from "mongoose";

const { Schema } = mongoose;


// ================================================================
// PACKAGE SCHEMA
// ================================================================

const packageSchema = new Schema(
  {
    // ============================================================
    // BASIC IDENTITY
    // ============================================================

    title: {
      type: String,
      required: [true, "Package title is required"],
      trim: true,
      minlength: [3, "Package title must be at least 3 characters"],
      maxlength: [200, "Package title cannot exceed 200 characters"],
    },

    slug: {
      type: String,
      required: [true, "Package slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only contain lowercase letters, numbers and hyphens",
      ],
    },

    packageCode: {
      type: String,
      required: [true, "Package code is required"],
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
      maxlength: 50,
    },

    tagline: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 700,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 15000,
    },


    // ============================================================
    // PACKAGE TYPE / THEMES
    // ============================================================

    packageType: {
      type: String,
      enum: [
        "fixed-departure",
        "private",
        "group",
        "customizable",
        "honeymoon",
        "family",
        "luxury",
      ],
      default: "private",
      index: true,
    },

    themes: [
      {
        type: String,
        enum: [
          "heritage",
          "culture",
          "adventure",
          "wildlife",
          "spiritual",
          "pilgrimage",
          "honeymoon",
          "family",
          "luxury",
          "beach",
          "hill-station",
          "desert",
          "nature",
          "wellness",
          "food",
          "photography",
          "weekend",
          "road-trip",
          "trekking",
          "other",
        ],
      },
    ],


    // ============================================================
    // REGION / DESTINATIONS
    // ============================================================

    regions: [
      {
        type: String,
        enum: [
          "north",
          "south",
          "east",
          "west",
          "central",
          "north-east",
        ],
      },
    ],

    states: [
      {
        type: Schema.Types.ObjectId,
        ref: "State",
      },
    ],

    cities: [
      {
        type: Schema.Types.ObjectId,
        ref: "City",
      },
    ],

    attractions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Attraction",
      },
    ],

    activities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Activity",
      },
    ],


    // ============================================================
    // START / END LOCATION
    // ============================================================

    startLocation: {
      cityId: {
        type: Schema.Types.ObjectId,
        ref: "City",
      },

      name: {
        type: String,
        trim: true,
        maxlength: 150,
      },
    },

    endLocation: {
      cityId: {
        type: Schema.Types.ObjectId,
        ref: "City",
      },

      name: {
        type: String,
        trim: true,
        maxlength: 150,
      },
    },


    // ============================================================
    // DURATION
    // ============================================================

    duration: {
      days: {
        type: Number,
        required: [true, "Package duration days are required"],
        min: 1,
        max: 365,
      },

      nights: {
        type: Number,
        required: [true, "Package duration nights are required"],
        min: 0,
        max: 364,
      },

      displayText: {
        type: String,
        trim: true,
        maxlength: 100,
      },
    },


    // ============================================================
    // PACKAGE HIGHLIGHTS
    // ============================================================

    highlights: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],


    // ============================================================
    // DAY-WISE ITINERARY
    // ============================================================

    itinerary: [
      {
        day: {
          type: Number,
          required: true,
          min: 1,
        },

        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: 300,
        },

        description: {
          type: String,
          trim: true,
          maxlength: 5000,
        },

        cityId: {
          type: Schema.Types.ObjectId,
          ref: "City",
        },

        attractions: [
          {
            type: Schema.Types.ObjectId,
            ref: "Attraction",
          },
        ],

        activities: [
          {
            type: Schema.Types.ObjectId,
            ref: "Activity",
          },
        ],

        hotel: {
          hotelId: {
            type: Schema.Types.ObjectId,
            ref: "Hotel",
          },

          roomType: {
            type: String,
            trim: true,
            maxlength: 150,
          },

          mealPlan: {
            type: String,
            enum: [
              "room_only",
              "breakfast",
              "half_board",
              "full_board",
              "all_inclusive",
            ],
          },

          nights: {
            type: Number,
            min: 0,
          },
        },

        transport: {
          vehicleId: {
            type: Schema.Types.ObjectId,
            ref: "Vehicle",
          },

          from: {
            type: String,
            trim: true,
            maxlength: 200,
          },

          to: {
            type: String,
            trim: true,
            maxlength: 200,
          },

          distanceKm: {
            type: Number,
            min: 0,
          },

          estimatedDurationMinutes: {
            type: Number,
            min: 0,
          },
        },

        meals: {
          breakfast: {
            type: Boolean,
            default: false,
          },

          lunch: {
            type: Boolean,
            default: false,
          },

          dinner: {
            type: Boolean,
            default: false,
          },
        },

        overnightStay: {
          type: Boolean,
          default: true,
        },

        notes: [
          {
            type: String,
            trim: true,
            maxlength: 500,
          },
        ],
      },
    ],


    // ============================================================
    // ACCOMMODATION
    // Overall hotel summary for the package
    // ============================================================

    accommodation: [
      {
        cityId: {
          type: Schema.Types.ObjectId,
          ref: "City",
          required: true,
        },

        hotelId: {
          type: Schema.Types.ObjectId,
          ref: "Hotel",
          required: true,
        },

        nights: {
          type: Number,
          required: true,
          min: 1,
        },

        roomType: {
          type: String,
          trim: true,
          maxlength: 150,
        },

        mealPlan: {
          type: String,
          enum: [
            "room_only",
            "breakfast",
            "half_board",
            "full_board",
            "all_inclusive",
          ],
          default: "breakfast",
        },
      },
    ],


    // ============================================================
    // TRANSPORT
    // ============================================================

    transport: {
      included: {
        type: Boolean,
        default: true,
      },

      vehicles: [
        {
          type: Schema.Types.ObjectId,
          ref: "Vehicle",
        },
      ],

      airportPickup: {
        type: Boolean,
        default: false,
      },

      airportDrop: {
        type: Boolean,
        default: false,
      },

      railwayPickup: {
        type: Boolean,
        default: false,
      },

      railwayDrop: {
        type: Boolean,
        default: false,
      },

      intercityTransfer: {
        type: Boolean,
        default: true,
      },

      localSightseeing: {
        type: Boolean,
        default: true,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
    },



    // ============================================================
    // GROUP SIZE
    // ============================================================

    groupSize: {
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
    },


    // ============================================================
    // DIFFICULTY
    // ============================================================

    difficulty: {
      type: String,
      enum: [
        "easy",
        "moderate",
        "challenging",
        "difficult",
      ],
      default: "easy",
      index: true,
    },


    // ============================================================
    // BEST TIME / SEASON
    // ============================================================

    bestTimeToVisit: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    suitableMonths: [
      {
        type: Number,
        min: 1,
        max: 12,
      },
    ],


    // ============================================================
    // INCLUSIONS
    // ============================================================

    inclusions: [
      {
        type: String,
        trim: true,
        maxlength: 1000,
      },
    ],


    // ============================================================
    // EXCLUSIONS
    // ============================================================

    exclusions: [
      {
        type: String,
        trim: true,
        maxlength: 1000,
      },
    ],



    // ============================================================
    // TERMS / IMPORTANT INFORMATION
    // ============================================================

    importantInformation: [
      {
        type: String,
        trim: true,
        maxlength: 1000,
      },
    ],

    termsAndConditions: {
      type: String,
      trim: true,
      maxlength: 10000,
    },


    countries: [
  {
    type: Schema.Types.ObjectId,
    ref: "Country",
  },
],


    // ============================================================
    // IMAGES
    // ============================================================

heroImage: {
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
          maxlength: 3000,
        },

        sortOrder: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],


    // ============================================================
    // RATING
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

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isPopular: {
      type: Boolean,
      default: false,
      index: true,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
      index: true,
    },

    isRecommended: {
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
        message: "{VALUE} is not a valid package status",
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

// Public package listing
packageSchema.index({
  status: 1,
  isActive: 1,
  sortOrder: 1,
});

// State filters
packageSchema.index({
  states: 1,
  status: 1,
  isActive: 1,
});

// City filters
packageSchema.index({
  cities: 1,
  status: 1,
  isActive: 1,
});

// Region filters
packageSchema.index({
  regions: 1,
  status: 1,
  isActive: 1,
});

// Theme filters
packageSchema.index({
  themes: 1,
  status: 1,
  isActive: 1,
});

// Package type
packageSchema.index({
  packageType: 1,
  status: 1,
  isActive: 1,
});



// Duration filtering
packageSchema.index({
  "duration.days": 1,
});

// Rating sorting
packageSchema.index({
  "rating.average": -1,
});

// Featured listing
packageSchema.index({
  isFeatured: 1,
  sortOrder: 1,
});

// Popular listing
packageSchema.index({
  isPopular: 1,
  sortOrder: 1,
});

// Bestseller listing
packageSchema.index({
  isBestSeller: 1,
  sortOrder: 1,
});

// Search
packageSchema.index({
  title: "text",
  tagline: "text",
  shortDescription: "text",
  description: "text",
  highlights: "text",
});


// ================================================================
// MODEL
// ================================================================

const Package = mongoose.model(
  "Package",
  packageSchema
);

export default Package;