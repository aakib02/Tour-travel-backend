import mongoose from "mongoose";

const { Schema } = mongoose;

const countrySchema = new Schema(
  {
    // ============================================================
    // BASIC INFORMATION
    // ============================================================

    name: {
      type: String,
      required: [true, "Country name is required"],
      trim: true,
      minlength: [2, "Country name must be at least 2 characters"],
      maxlength: [100, "Country name cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // ISO 3166-1 Alpha-2
    code: {
      type: String,
      required: [true, "Country code is required"],
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 2,
      unique: true,
      index: true,
    },

    // ============================================================
    // REGION
    // ============================================================

    region: {
      type: String,
      enum: [
        "South Asia",
        "Southeast Asia",
        "East Asia",
        "Central Asia",
        "Middle East",
        "Europe",
        "North America",
        "South America",
        "Africa",
        "Oceania",
        "Other",
      ],
      default: "Other",
      index: true,
    },

    // ============================================================
    // CURRENCY
    // ============================================================

    currency: {
      code: {
        type: String,
        uppercase: true,
        trim: true,
        maxlength: 3,
        default: null,
      },

      symbol: {
        type: String,
        trim: true,
        maxlength: 10,
        default: null,
      },

      name: {
        type: String,
        trim: true,
        maxlength: 100,
        default: null,
      },
    },

    // ============================================================
    // DESCRIPTION
    // ============================================================

    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
      default: null,
    },

    // ============================================================
    // HERO IMAGE
    // Global Media reference
    // ============================================================

    heroImage: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null,
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
    // SEO
    // ============================================================

    seo: {
      title: {
        type: String,
        trim: true,
        maxlength: 60,
        default: null,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 160,
        default: null,
      },

      keywords: [
        {
          type: String,
          trim: true,
          maxlength: 100,
        },
      ],

      canonicalUrl: {
        type: String,
        trim: true,
        default: null,
      },

      noIndex: {
        type: Boolean,
        default: false,
      },
    },

    // ============================================================
    // DISPLAY / STATUS
    // ============================================================

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "published",
        "archived",
      ],
      default: "draft",
      index: true,
    },

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

countrySchema.index({
  status: 1,
  isActive: 1,
  sortOrder: 1,
  name: 1,
});

countrySchema.index({
  region: 1,
  status: 1,
  isActive: 1,
});


// ================================================================
// MODEL
// ================================================================

const Country = mongoose.model("Country", countrySchema);

export default Country;