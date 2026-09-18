import mongoose from "mongoose";

const { Schema } = mongoose;

const heroSchema = new Schema(
  {
    // ============================================================
    // BASIC INFORMATION
    // ============================================================

    name: {
      type: String,
      required: [true, "Hero name is required"],
      trim: true,
      maxlength: 200,
    },

    // ============================================================
    // HERO SLIDES
    // ============================================================

    slides: [
      {
        image: {
          mediaId: {
            type: Schema.Types.ObjectId,
            ref: "Media",
            required: [true, "Slide image is required"],
          },

          url: {
            type: String,
            trim: true,
          },

          alt: {
            type: String,
            trim: true,
            maxlength: 200,
          },
        },

        thumbnail: {
          mediaId: {
            type: Schema.Types.ObjectId,
            ref: "Media",
            default: null,
          },

          url: {
            type: String,
            trim: true,
          },
        },

        tagline: {
          type: String,
          required: [true, "Slide tagline is required"],
          trim: true,
          maxlength: 200,
        },

        headline: {
          type: String,
          required: [true, "Slide headline is required"],
          trim: true,
          maxlength: 500,
        },

        description: {
          type: String,
          required: [true, "Slide description is required"],
          trim: true,
          maxlength: 1000,
        },

        location: {
          type: String,
          trim: true,
          maxlength: 300,
        },

        order: {
          type: Number,
          required: true,
          min: 1,
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // ============================================================
    // SHOWCASE CARDS
    // ============================================================

    showcase: [
      {
        image: {
          mediaId: {
            type: Schema.Types.ObjectId,
            ref: "Media",
            required: true,
          },

          url: {
            type: String,
            trim: true,
          },

          alt: {
            type: String,
            trim: true,
            maxlength: 200,
          },
        },

        label: {
          type: String,
          required: true,
          trim: true,
          maxlength: 200,
        },

        order: {
          type: Number,
          required: true,
          min: 1,
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // ============================================================
    // TRUST / REVIEW CARD
    // ============================================================

    trustCard: {
      avatars: [
        {
          mediaId: {
            type: Schema.Types.ObjectId,
            ref: "Media",
            required: true,
          },

          url: {
            type: String,
            trim: true,
          },

          alt: {
            type: String,
            trim: true,
            maxlength: 200,
          },
        },
      ],

      rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },

      reviewCount: {
        type: Number,
        min: 0,
        default: 0,
      },

      travelerCount: {
        type: Number,
        min: 0,
        default: 0,
      },

      countryCount: {
        type: Number,
        min: 0,
        default: 0,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
    },

    // ============================================================
    // SLIDER SETTINGS
    // ============================================================

    settings: {
      autoPlay: {
        type: Boolean,
        default: true,
      },

      interval: {
        type: Number,
        default: 7500,
        min: 1000,
      },

      showNavigation: {
        type: Boolean,
        default: true,
      },

      showDots: {
        type: Boolean,
        default: true,
      },
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

// ============================================================
// INDEXES
// ============================================================

heroSchema.index({
  isActive: 1,
  createdAt: -1,
});

heroSchema.index({
  "slides.order": 1,
});

heroSchema.index({
  "showcase.order": 1,
});

const Hero = mongoose.model("Hero", heroSchema);

export default Hero;