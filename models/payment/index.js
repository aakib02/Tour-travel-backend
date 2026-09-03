import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    // ============================================================
    // QUOTATION
    // ============================================================

    quotationId: {
      type: Schema.Types.ObjectId,
      ref: "Quotation",
      required: [true, "Quotation is required"],
      index: true,
    },

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
    // PAYMENT NUMBER
    // ============================================================

    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    // ============================================================
    // AMOUNT
    // ============================================================

    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [1, "Payment amount must be greater than 0"],
    },

    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "INR",
      maxlength: 3,
    },

    // ============================================================
    // PAYMENT TYPE
    // ============================================================

    paymentType: {
      type: String,
      enum: [
        "full",
        "partial",
      ],
      default: "full",
      index: true,
    },

    // ============================================================
    // PAYMENT STATUS
    // ============================================================

    status: {
      type: String,
      enum: [
        "created",
        "pending",
        "processing",
        "paid",
        "failed",
        "cancelled",
        "refunded",
        "partially-refunded",
      ],
      default: "created",
      index: true,
    },

    // ============================================================
    // RAZORPAY
    // ============================================================

    razorpayOrderId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    razorpaySignature: {
      type: String,
      trim: true,
      select: false,
      default: null,
    },

    // ============================================================
    // PAYMENT LINK
    // ============================================================

    paymentLink: {
      type: String,
      trim: true,
      default: null,
    },

    paymentLinkId: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    paymentLinkExpiresAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // PAYMENT DATES
    // ============================================================

    paidAt: {
      type: Date,
      default: null,
      index: true,
    },

    failedAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // REFUND
    // ============================================================

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },

    // ============================================================
    // PAYMENT CUSTOMER DETAILS
    // ============================================================

    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 255,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20,
      },
    },

    // ============================================================
    // PAYMENT METHOD
    // ============================================================

    paymentMethod: {
      type: String,
      enum: [
        "upi",
        "card",
        "netbanking",
        "wallet",
        "emi",
        "other",
      ],
      default: null,
    },

    // ============================================================
    // ADMIN
    // ============================================================

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
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

paymentSchema.index({
  quotationId: 1,
  createdAt: -1,
});

paymentSchema.index({
  customizePackageId: 1,
  createdAt: -1,
});

paymentSchema.index({
  status: 1,
  createdAt: -1,
});

paymentSchema.index({
  "customer.email": 1,
  createdAt: -1,
});


// ================================================================
// MODEL
// ================================================================

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;