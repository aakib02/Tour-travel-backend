import mongoose from "mongoose";

const { Schema } = mongoose;


// ======================================================
// PAGE SECTION
// ======================================================

const sectionSchema = new Schema(
  {
    key: {
      type: String,
      required: [true, "Section key is required"],
      trim: true,
      lowercase: true,
    },

    order: {
      type: Number,
      required: [true, "Section order is required"],
      min: [1, "Section order must be at least 1"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  }
);


// ======================================================
// PAGE CONFIG
// ======================================================

const pageConfigSchema = new Schema(
  {
    page: {
      type: String,
      required: [true, "Page name is required"],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },

    sections: {
      type: [sectionSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

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


// ======================================================
// INDEXES
// ======================================================

pageConfigSchema.index({
  page: 1,
  isActive: 1,
});


const PageConfig = mongoose.model(
  "PageConfig",
  pageConfigSchema
);

export default PageConfig;