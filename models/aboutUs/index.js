import mongoose from "mongoose";

const { Schema } = mongoose;


// ======================================================
// MEDIA REFERENCE
// ======================================================

const mediaReferenceSchema = new Schema(
  {
    mediaId: {
      type: Schema.Types.ObjectId,
      ref: "Media",
      default: null
    },

    url: {
      type: String,
      trim: true,
      default: null
    },

    alt: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null
    },

    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null
    }
  },
  {
    _id: false
  }
);


// ======================================================
// BUTTON
// ======================================================

const buttonSchema = new Schema(
  {
    text: {
      type: String,
      trim: true,
      maxlength: 100
    },

    url: {
      type: String,
      trim: true,
      maxlength: 500
    },

    openInNewTab: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    _id: false
  }
);


// ======================================================
// INTRODUCTION FEATURE
// ======================================================

const featureSchema = new Schema(
  {
    icon: {
      type: String,
      trim: true,
      maxlength: 100
    },

    title: {
      type: String,
      trim: true,
      maxlength: 200
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    order: {
      type: Number,
      min: 1,
      default: 1
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    _id: true
  }
);


// ======================================================
// TIMELINE MILESTONE
// ======================================================

const milestoneSchema = new Schema(
  {
    year: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },

    step: {
      type: String,
      trim: true,
      maxlength: 10
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500
    },

    icon: {
      type: String,
      trim: true,
      maxlength: 100
    },

    order: {
      type: Number,
      required: true,
      min: 1
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    _id: true
  }
);


// ======================================================
// OFFICE
// ======================================================

const officeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    city: {
      type: String,
      trim: true,
      maxlength: 100
    },

    state: {
      type: String,
      trim: true,
      maxlength: 100
    },

    country: {
      type: String,
      trim: true,
      default: "India",
      maxlength: 100
    },

    address: {
      type: String,
      trim: true,
      maxlength: 500
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 255
    },

    mapUrl: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    image: {
      type: mediaReferenceSchema,
      default: null
    },

    order: {
      type: Number,
      min: 1,
      default: 1
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    _id: true
  }
);


// ======================================================
// ABOUT US SCHEMA
// ======================================================

const aboutUsSchema = new Schema(
  {

    // ==================================================
    // HERO
    // ==================================================

    hero: {
      image: {
        type: mediaReferenceSchema,
        default: null
      },

      eyebrow: {
        type: String,
        trim: true,
        maxlength: 200
      },

      title: {
        type: String,
        trim: true,
        maxlength: 300
      },

      highlightedTitle: {
        type: String,
        trim: true,
        maxlength: 200
      },

      description: {
        type: String,
        trim: true,
        maxlength: 1500
      }
    },


    // ==================================================
    // INTRODUCTION / ABOUT COMPANY
    // ==================================================

    introduction: {

      image: {
        type: mediaReferenceSchema,
        default: null
      },

      eyebrow: {
        type: String,
        trim: true,
        maxlength: 200
      },

      title: {
        type: String,
        trim: true,
        maxlength: 300
      },

      paragraphs: [
        {
          type: String,
          trim: true,
          maxlength: 3000
        }
      ],

      features: {
        type: [featureSchema],
        default: []
      },

      button: {
        type: buttonSchema,
        default: null
      }
    },


    // ==================================================
    // OUR STORY
    // ==================================================

    story: {

      mainImage: {
        type: mediaReferenceSchema,
        default: null
      },

      foundedYear: {
        type: String,
        trim: true,
        maxlength: 10
      },

      eyebrow: {
        type: String,
        trim: true,
        maxlength: 200
      },

      title: {
        type: String,
        trim: true,
        maxlength: 300
      },

      highlightedTitle: {
        type: String,
        trim: true,
        maxlength: 200
      },

      paragraphs: [
        {
          type: String,
          trim: true,
          maxlength: 3000
        }
      ],

      sideImages: {
        type: [mediaReferenceSchema],
        default: []
      }
    },


    // ==================================================
    // STATS
    // ==================================================

    stats: {

      happyTravelers: {
        type: Number,
        min: 0,
        default: 0
      },

      destinations: {
        type: Number,
        min: 0,
        default: 0
      },

      satisfactionRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },

      yearsExperience: {
        type: Number,
        min: 0,
        default: 0
      }
    },


    // ==================================================
    // TIMELINE
    // ==================================================

    timeline: {

      sectionEyebrow: {
        type: String,
        trim: true,
        maxlength: 200
      },

      title: {
        type: String,
        trim: true,
        maxlength: 300
      },

      description: {
        type: String,
        trim: true,
        maxlength: 1000
      },

      milestones: {
        type: [milestoneSchema],
        default: []
      }
    },


    // ==================================================
    // OFFICES
    // ==================================================

    offices: {

      sectionEyebrow: {
        type: String,
        trim: true,
        maxlength: 200
      },

      title: {
        type: String,
        trim: true,
        maxlength: 300
      },

      items: {
        type: [officeSchema],
        default: []
      }
    },


    // ==================================================
    // CTA
    // ==================================================

    cta: {

      badge: {
        type: String,
        trim: true,
        maxlength: 300
      },

      title: {
        type: String,
        trim: true,
        maxlength: 500
      },

      description: {
        type: String,
        trim: true,
        maxlength: 1500
      },

      primaryButton: {
        type: buttonSchema,
        default: null
      },

      whatsappButton: {
        type: buttonSchema,
        default: null
      },

      bottomText: {
        type: String,
        trim: true,
        maxlength: 500
      }
    },


    // ==================================================
    // COMMON
    // ==================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    deletedAt: {
      type: Date,
      default: null
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    }

  },
  {
    timestamps: true,
    versionKey: false
  }
);


// ======================================================
// INDEXES
// ======================================================

aboutUsSchema.index({
  isActive: 1,
  createdAt: -1
});

aboutUsSchema.index({
  "timeline.milestones.order": 1
});

aboutUsSchema.index({
  "introduction.features.order": 1
});

aboutUsSchema.index({
  "offices.items.order": 1
});


const AboutUs = mongoose.model("AboutUs", aboutUsSchema);

export default AboutUs;