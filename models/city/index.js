import mongoose from "mongoose";

const { Schema } = mongoose;

const citySchema = new Schema(
  {
    // ============================================================
    // BASIC IDENTITY
    // ============================================================

    name: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
      minlength: [2, "City name must be at least 2 characters"],
      maxlength: [100, "City name cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      required: [true, "City slug is required"],
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
    // STATE RELATION
    // ============================================================

    stateId: {
      type: Schema.Types.ObjectId,
      ref: "State",
      required: [true, "State is required"],
      index: true,
    },
    countryId: {
  type: Schema.Types.ObjectId,
  ref: "Country",
  required: [true, "Country is required"],
  index: true,
},

    // Denormalized for faster filtering/listing.
    // Source of truth remains State document.
    region: {
      type: String,
      required: [true, "Region is required"],
      enum: {
        values: [
          "north",
          "south",
          "east",
          "west",
          "central",
          "north-east",
        ],
        message: "{VALUE} is not a valid region",
      },
      index: true,
    },

    // ============================================================
    // BASIC CITY INFORMATION
    // ============================================================

    shortDescription: {
      type: String,
      trim: true,
      maxlength: [500, "Short description cannot exceed 500 characters"],
    },

    overview: {
      type: String,
      trim: true,
      maxlength: [5000, "Overview cannot exceed 5000 characters"],
    },

    tagline: {
      type: String,
      trim: true,
      maxlength: [250, "Tagline cannot exceed 250 characters"],
    },

    // ============================================================
    // TRAVEL INFORMATION
    // ============================================================

    bestTimeToVisit: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    popularDuration: {
      minDays: {
        type: Number,
        min: 1,
        max: 365,
      },

      maxDays: {
        type: Number,
        min: 1,
        max: 365,
      },
    },

    howToReach: {
      airport: {
        type: String,
        trim: true,
        maxlength: 500,
      },

      railway: {
        type: String,
        trim: true,
        maxlength: 500,
      },

      road: {
        type: String,
        trim: true,
        maxlength: 1000,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
    },

    // ============================================================
    // LOCATION
    // ============================================================

    coordinates: {
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
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // ============================================================
    // CITY CATEGORY / DISCOVERY
    // ============================================================

    cityType: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 50,
      },
    ],

    popularFor: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 100,
      },
    ],

    travelThemes: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 50,
      },
    ],

    // ============================================================
    // HERO IMAGE
    // ============================================================

heroImage: {
  mediaId: {
    type: Schema.Types.ObjectId,
    ref: "Media",
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
    // LOCAL EXPERIENCES
    // ============================================================

    food: [
      {
        type: String,
        trim: true,
        maxlength: 200,
      },
    ],

    shopping: [
      {
        type: String,
        trim: true,
        maxlength: 200,
      },
    ],

    // ============================================================
    // WEATHER
    // ============================================================

    weather: {
      summer: {
        minTemperature: Number,
        maxTemperature: Number,
        description: {
          type: String,
          trim: true,
          maxlength: 500,
        },
      },

      monsoon: {
        minTemperature: Number,
        maxTemperature: Number,
        description: {
          type: String,
          trim: true,
          maxlength: 500,
        },
      },

      winter: {
        minTemperature: Number,
        maxTemperature: Number,
        description: {
          type: String,
          trim: true,
          maxlength: 500,
        },
      },
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
    // MAP
    // ============================================================

    map: {
      embedUrl: {
        type: String,
        trim: true,
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
    },

  

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
    // FEATURED / POPULAR
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
        message: "{VALUE} is not a valid city status",
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

    toJSON: {
      virtuals: false,
    },

    toObject: {
      virtuals: false,
    },
  }
);


// ================================================================
// INDEXES
// ================================================================

citySchema.index({
  stateId: 1,
  status: 1,
  isActive: 1,
});

citySchema.index({
  region: 1,
  status: 1,
  isActive: 1,
});

citySchema.index({
  stateId: 1,
  sortOrder: 1,
});

citySchema.index({
  isPopular: 1,
  sortOrder: 1,
});

citySchema.index({
  isFeatured: 1,
  sortOrder: 1,
});

citySchema.index({
  name: "text",
  shortDescription: "text",
  overview: "text",
  tagline: "text",
});


// ================================================================
// MODEL
// ================================================================

const City = mongoose.model("City", citySchema);

export default City;