import mongoose from "mongoose";

const { Schema } = mongoose;

const stateSchema = new Schema(
  {
    // ============================================================
    // BASIC IDENTITY
    // ============================================================

    name: {
      type: String,
      required: [true, "State name is required"],
      trim: true,
      minlength: [2, "State name must be at least 2 characters"],
      maxlength: [100, "State name cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      required: [true, "State slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only contain lowercase letters, numbers and hyphens",
      ],
    },

    code: {
      type: String,
      required: [true, "State code is required"],
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 3,
      unique: true,
      index: true,
    },

countryId: {
  type: Schema.Types.ObjectId,
  ref: "Country",
  required: [true, "Country is required"],
  index: true,
},

    // ============================================================
    // REGION
    // ============================================================

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
    // CONTENT
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

    bestTimeToVisit: {
      type: String,
      trim: true,
      maxlength: 500,
    },


    // ============================================================
    // IMAGES
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
    // GEOGRAPHICAL INFORMATION
    // ============================================================

    capital: {
      type: String,
      trim: true,
      maxlength: 100,
    },


    // ============================================================
    // TRAVEL INFORMATION
    // ============================================================

    popularFor: [
      {
        type: String,
        trim: true,
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
    // WEATHER / SEASON
    // ============================================================

    seasons: {
      summer: {
        months: [String],
        description: {
          type: String,
          trim: true,
          maxlength: 500,
        },
      },

      monsoon: {
        months: [String],
        description: {
          type: String,
          trim: true,
          maxlength: 500,
        },
      },

      winter: {
        months: [String],
        description: {
          type: String,
          trim: true,
          maxlength: 500,
        },
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
    // DISCOVERY / SORTING
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
      index: true,
    },

    // ============================================================
    // PUBLISHING
    // ============================================================

    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived"],
        message: "{VALUE} is not a valid state status",
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

stateSchema.index({
  region: 1,
  status: 1,
  isActive: 1,
});

stateSchema.index({
  isPopular: 1,
  sortOrder: 1,
});

stateSchema.index({
  isFeatured: 1,
  sortOrder: 1,
});

stateSchema.index({
  name: "text",
  shortDescription: "text",
  overview: "text",
});


// ================================================================
// VIRTUALS
// ================================================================

stateSchema.virtual("displayName").get(function () {
  return this.name;
});


// ================================================================
// MIDDLEWARE
// ================================================================

stateSchema.pre("save", function () {
  if (!this.isModified("status")) {
    return;
  }

  if (
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
    return;
  }

  if (this.status !== "published") {
    this.publishedAt = null;
  }
});


// ================================================================
// INSTANCE METHODS
// ================================================================

stateSchema.methods.publish = function () {
  this.status = "published";
  this.publishedAt = new Date();

  return this.save();
};

stateSchema.methods.archive = function () {
  this.status = "archived";

  return this.save();
};

stateSchema.methods.softDelete = function () {
  this.isActive = false;
  this.deletedAt = new Date();

  return this.save();
};

stateSchema.methods.restore = function () {
  this.isActive = true;
  this.deletedAt = null;

  return this.save();
};


// ================================================================
// STATIC METHODS
// ================================================================

stateSchema.statics.getPublished = function (filter = {}) {
  return this.find({
    ...filter,
    status: "published",
    isActive: true,
  }).sort({
    sortOrder: 1,
    name: 1,
  });
};


// ================================================================
// MODEL
// ================================================================

const State = mongoose.model("State", stateSchema);

export default State;