import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // ============================================================
    // BASIC INFORMATION
    // ============================================================

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [150, "Name cannot exceed 150 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      maxlength: 255,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      index: true,
    },

    // ============================================================
    // AUTHENTICATION
    // ============================================================

    password: {
      type: String,
      select: false,
      minlength: 8,
      maxlength: 128,
    },

    // ============================================================
    // ROLE
    // ============================================================

    role: {
      type: String,
      enum: {
        values: [
          "customer",
          "admin",
          "staff",
        ],
        message: "{VALUE} is not a valid user role",
      },
      default: "customer",
      index: true,
    },

    // ============================================================
    // PROFILE IMAGE
    // ============================================================

avatar: {
  url: String,
  publicId: String,
},

    // ============================================================
    // PROFILE
    // ============================================================

    gender: {
      type: String,
      enum: [
        "male",
        "female",
        "other",
        "prefer-not-to-say",
      ],
      default: "prefer-not-to-say",
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    // ============================================================
    // ADDRESS
    // ============================================================

    address: {
      addressLine1: {
        type: String,
        trim: true,
        maxlength: 300,
      },

      addressLine2: {
        type: String,
        trim: true,
        maxlength: 300,
      },

      city: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      state: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      country: {
        type: String,
        trim: true,
        default: "India",
        maxlength: 100,
      },

      postalCode: {
        type: String,
        trim: true,
        maxlength: 20,
      },
    },

    // ============================================================
    // ACCOUNT STATUS
    // ============================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    blockedAt: {
      type: Date,
      default: null,
    },

    blockReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // ============================================================
    // EMAIL VERIFICATION
    // ============================================================

    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    emailVerificationToken: {
      type: String,
      select: false,
      default: null,
    },

    emailVerificationExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },

    // ============================================================
    // PHONE VERIFICATION
    // ============================================================

    isPhoneVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    phoneVerifiedAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // PASSWORD RESET
    // ============================================================

    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },

    passwordResetExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },

    // ============================================================
    // LOGIN / SECURITY
    // ============================================================

    lastLoginAt: {
      type: Date,
      default: null,
    },

    lastLoginIp: {
      type: String,
      default: null,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },

    // ============================================================
    // SESSION / REFRESH TOKEN
    // ============================================================

    refreshToken: {
      type: String,
      select: false,
      default: null,
    },

    refreshTokenExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },

    // ============================================================
    // LOGIN CONTROL
    // ============================================================

    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },

    // ============================================================
    // PREFERENCES
    // ============================================================

    preferences: {
      language: {
        type: String,
        default: "en",
        trim: true,
      },

      currency: {
        type: String,
        default: "INR",
        uppercase: true,
        trim: true,
      },

      notifications: {
        email: {
          type: Boolean,
          default: true,
        },

        sms: {
          type: Boolean,
          default: true,
        },

        whatsapp: {
          type: Boolean,
          default: true,
        },
      },
    },

    // ============================================================
    // STATISTICS
    // ============================================================

    stats: {
      totalBookings: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalEnquiries: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalReviews: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalSpent: {
        type: Number,
        default: 0,
        min: 0,
      },
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


// ================================================================
// INDEXES
// ================================================================

userSchema.index({
  role: 1,
  isActive: 1,
});

userSchema.index({
  phone: 1,
  isActive: 1,
});

userSchema.index({
  isEmailVerified: 1,
  isActive: 1,
});

userSchema.index({
  createdAt: -1,
});


// ================================================================
// MODEL
// ================================================================

const User = mongoose.model("User", userSchema);

export default User;