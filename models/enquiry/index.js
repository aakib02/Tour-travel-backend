import mongoose from "mongoose";

const { Schema } = mongoose;

const enquirySchema = new Schema(
  {
    // ============================================================
    // CUSTOMER DETAILS
    // ============================================================

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [150, "Name cannot exceed 150 characters"],
    },

    company: {
      type: String,
      trim: true,
      maxlength: [150, "Company name cannot exceed 150 characters"],
      default: null,
    },

    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
      maxlength: 20,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 255,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: 100,
      default: "India",
    },

    // ============================================================
    // ENQUIRY DETAILS
    // ============================================================

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [300, "Subject cannot exceed 300 characters"],
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [5, "Message must be at least 5 characters"],
      maxlength: [3000, "Message cannot exceed 3000 characters"],
    },



    // ============================================================
    // STATUS
    // ============================================================

    status: {
      type: String,
      enum: {
        values: [
          "new",
          "active",
          "replied",
          "closed",
        ],
        message: "{VALUE} is not a valid enquiry status",
      },
      default: "new",
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

enquirySchema.index({
  status: 1,
  isActive: 1,
  createdAt: -1,
});

enquirySchema.index({
  email: 1,
  createdAt: -1,
});

enquirySchema.index({
  phone: 1,
  createdAt: -1,
});




// ================================================================
// MODEL
// ================================================================

const Enquiry = mongoose.model("Enquiry", enquirySchema);

export default Enquiry;