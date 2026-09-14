import mongoose from "mongoose";

const { Schema } = mongoose;

const vehicleSchema = new Schema(
  {
    // ============================================================
    // BASIC IDENTITY
    // ============================================================

    name: {
      type: String,
      required: [true, "Vehicle name is required"],
      trim: true,
      minlength: [2, "Vehicle name must be at least 2 characters"],
      maxlength: [150, "Vehicle name cannot exceed 150 characters"],
    },

    slug: {
      type: String,
      required: [true, "Vehicle slug is required"],
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
    // VEHICLE TYPE
    // ============================================================

    type: {
      type: String,
      required: [true, "Vehicle type is required"],
      enum: {
        values: [
          "sedan",
          "suv",
          "luxury",
          "tempo-traveller",
          "mini-bus",
          "bus",
          "van",
          "other",
        ],
        message: "{VALUE} is not a valid vehicle type",
      },
      index: true,
    },

    category: {
      type: String,
      enum: {
        values: [
          "economy",
          "standard",
          "premium",
          "luxury",
          "group",
        ],
        message: "{VALUE} is not a valid vehicle category",
      },
      default: "standard",
      index: true,
    },

    // ============================================================
    // CAPACITY
    // ============================================================

    seatingCapacity: {
      type: Number,
      required: [true, "Seating capacity is required"],
      min: 1,
      max: 100,
    },

    luggageCapacity: {
      largeBags: {
        type: Number,
        default: 0,
        min: 0,
      },

      smallBags: {
        type: Number,
        default: 0,
        min: 0,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 300,
      },
    },

    // ============================================================
    // VEHICLE SPECIFICATIONS
    // ============================================================

    ac: {
      type: Boolean,
      default: true,
    },

    fuelType: {
      type: String,
      enum: [
        "petrol",
        "diesel",
        "cng",
        "electric",
        "hybrid",
        "petrol-diesel",
        "other",
      ],
      default: "diesel",
      index: true,
    },

    transmission: {
      type: String,
      enum: [
        "manual",
        "automatic",
        "both",
        "not-specified",
      ],
      default: "not-specified",
    },

    modelYear: {
      type: Number,
      min: 1990,
      max: new Date().getFullYear() + 1,
    },

    // ============================================================
    // DRIVER / SERVICE
    // ============================================================

    driverIncluded: {
      type: Boolean,
      default: true,
    },

    driverType: {
      type: String,
      enum: [
        "professional",
        "chauffeur",
        "verified",
        "standard",
        "not-included",
      ],
      default: "professional",
    },

    driverFeatures: [
      {
        type: String,
        trim: true,
        maxlength: 200,
      },
    ],

    // ============================================================
    // FEATURES
    // ============================================================

    features: [
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
    // DESCRIPTION
    // ============================================================

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

   

    // ============================================================
    // SERVICE / AVAILABILITY
    // ============================================================

    service: {
      available: {
        type: Boolean,
        default: true,
      },

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

      serviceAreas: [
        {
          type: String,
          trim: true,
          maxlength: 100,
        },
      ],

      airportTransfer: {
        type: Boolean,
        default: true,
      },

      intercityTravel: {
        type: Boolean,
        default: true,
      },

      localSightseeing: {
        type: Boolean,
        default: true,
      },

      outstation: {
        type: Boolean,
        default: true,
      },

      oneWay: {
        type: Boolean,
        default: true,
      },

      roundTrip: {
        type: Boolean,
        default: true,
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
        message: "{VALUE} is not a valid vehicle status",
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

vehicleSchema.index({
  type: 1,
  status: 1,
  isActive: 1,
});

vehicleSchema.index({
  category: 1,
  status: 1,
  isActive: 1,
});

vehicleSchema.index({
  seatingCapacity: 1,
});

// vehicleSchema.index({
//   fuelType: 1,
// });

vehicleSchema.index({
  "rating.average": -1,
});

vehicleSchema.index({
  isPopular: 1,
  sortOrder: 1,
});

vehicleSchema.index({
  isFeatured: 1,
  sortOrder: 1,
});

vehicleSchema.index({
  name: "text",
  shortDescription: "text",
  description: "text",
  features: "text",
});


// ================================================================
// MODEL
// ================================================================

const Vehicle = mongoose.model(
  "Vehicle",
  vehicleSchema
);

export default Vehicle;