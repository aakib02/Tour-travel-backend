import mongoose from "mongoose";

const { Schema } = mongoose;

const quotationSchema = new Schema(
  {
    // ============================================================
    // CUSTOMIZED PACKAGE
    // ============================================================

    customizePackageId: {
      type: Schema.Types.ObjectId,
      ref: "CustomizePackage",
      required: [true, "Customized package is required"],
      index: true,
    },

    // ============================================================
    // QUOTATION NUMBER
    // ============================================================

    quotationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    // ============================================================
    // QUOTATION VERSION
    // ============================================================

    version: {
      type: Number,
      default: 1,
      min: 1,
    },

    // ============================================================
    // AMOUNT
    // ============================================================

    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: 0,
    },

    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "INR",
      maxlength: 3,
    },

    // ============================================================
    // QUOTATION DETAILS
    // ============================================================

    title: {
      type: String,
      required: [true, "Quotation title is required"],
      trim: true,
      maxlength: 300,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: null,
    },

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
    // VALIDITY
    // ============================================================

    validUntil: {
      type: Date,
      default: null,
      index: true,
    },

    // ============================================================
    // STATUS
    // ============================================================

    status: {
      type: String,
      enum: {
        values: [
          "draft",
          "sent",
          "viewed",
          "accepted",
          "rejected",
          "expired",
          "cancelled",
        ],
        message: "{VALUE} is not a valid quotation status",
      },
      default: "draft",
      index: true,
    },

    // ============================================================
    // EMAIL
    // ============================================================

    sentAt: {
      type: Date,
      default: null,
    },

    viewedAt: {
      type: Date,
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // ADMIN
    // ============================================================

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
      index: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
  },

  {
    timestamps: true,
    versionKey: false,
  }
);


// ================================================================
// INDEXES
// ================================================================

quotationSchema.index({
  customizePackageId: 1,
  version: -1,
});

quotationSchema.index({
  status: 1,
  isActive: 1,
  createdAt: -1,
});

quotationSchema.index({
  validUntil: 1,
  status: 1,
});


// ================================================================
// MODEL
// ================================================================

const Quotation = mongoose.model("Quotation", quotationSchema);

export default Quotation;