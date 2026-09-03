import mongoose from "mongoose";

const { Schema } = mongoose;

const hotelSchema = new Schema(
  {
    // ============================================================
    // BASIC IDENTITY
    // ============================================================

    name: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
      minlength: [2, "Hotel name must be at least 2 characters"],
      maxlength: [200, "Hotel name cannot exceed 200 characters"],
    },

    slug: {
      type: String,
      required: [true, "Hotel slug is required"],
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
    // HOTEL INFORMATION
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

    category: {
      type: String,
      required: [true, "Hotel category is required"],
      enum: {
        values: [
          "budget",
          "standard",
          "premium",
          "luxury",
          "heritage",
          "resort",
          "boutique",
          "villa",
          "homestay",
          "hostel",
          "camp",
          "eco-resort",
          "other",
        ],
        message: "{VALUE} is not a valid hotel category",
      },
      index: true,
    },

    starRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    // ============================================================
    // HOTEL FEATURES
    // ============================================================

    highlights: [
      {
        type: String,
        trim: true,
        maxlength: 300,
      },
    ],

    amenities: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 100,
      },
    ],



    // ============================================================
    // LOCATION DETAILS
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

      distanceFromAirportKm: {
        type: Number,
        min: 0,
      },

      distanceFromRailwayStationKm: {
        type: Number,
        min: 0,
      },

      distanceFromCityCenterKm: {
        type: Number,
        min: 0,
      },
    },

    // ============================================================
    // ROOMS
    // ============================================================

    rooms: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
          maxlength: 150,
        },

        slug: {
          type: String,
          trim: true,
          lowercase: true,
          maxlength: 200,
        },

        description: {
          type: String,
          trim: true,
          maxlength: 2000,
        },

        maxAdults: {
          type: Number,
          min: 1,
          default: 2,
        },

        maxChildren: {
          type: Number,
          min: 0,
          default: 0,
        },

        bedType: {
          type: String,
          trim: true,
          maxlength: 100,
        },

        roomSize: {
          value: {
            type: Number,
            min: 0,
          },

          unit: {
            type: String,
            enum: ["sqft", "sqm"],
            default: "sqft",
          },
        },

        amenities: [
          {
            type: String,
            trim: true,
            lowercase: true,
            maxlength: 100,
          },
        ],

   images: [
  {
    mediaId: {
      type: Schema.Types.ObjectId,
      ref: "Media",
    //   required: true,
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


        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],


    // ============================================================
    // CHECK-IN / CHECK-OUT
    // ============================================================

    policies: {
      checkIn: {
        type: String,
        trim: true,
        default: "14:00",
      },

      checkOut: {
        type: String,
        trim: true,
        default: "11:00",
      },

      earlyCheckInAvailable: {
        type: Boolean,
        default: false,
      },

      lateCheckOutAvailable: {
        type: Boolean,
        default: false,
      },

      cancellationPolicy: {
        type: String,
        trim: true,
        maxlength: 3000,
      },

      childPolicy: {
        type: String,
        trim: true,
        maxlength: 2000,
      },

      petPolicy: {
        type: String,
        trim: true,
        maxlength: 1000,
      },

      smokingAllowed: {
        type: Boolean,
        default: false,
      },
    },

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
  type: Schema.Types.ObjectId,
  ref: "Media",
  default: null,
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
        message: "{VALUE} is not a valid hotel status",
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

hotelSchema.index({
  cityId: 1,
  status: 1,
  isActive: 1,
});

hotelSchema.index({
  stateId: 1,
  status: 1,
  isActive: 1,
});

hotelSchema.index({
  category: 1,
  status: 1,
  isActive: 1,
});

hotelSchema.index({
  starRating: 1,
});

hotelSchema.index({
  "rating.average": -1,
});


hotelSchema.index({
  isPopular: 1,
  sortOrder: 1,
});

hotelSchema.index({
  isFeatured: 1,
  sortOrder: 1,
});

hotelSchema.index({
  name: "text",
  shortDescription: "text",
  description: "text",
});


// ================================================================
// MODEL
// ================================================================

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;