import mongoose from "mongoose";

const { Schema } = mongoose;

const customizePackageSchema = new Schema(
  {
    // ============================================================
    // STEP 1 — TRAVELERS
    // ============================================================

    travelerType: {
      type: String,
      enum: {
        values: [
          "Solo",
          "Couple",
          "Family",
          "Group of Friends",
        ],
        message: "{VALUE} is not a valid traveler type",
      },
      required: [true, "Traveler type is required"],
    },

    adultsCount: {
      type: Number,
      required: [true, "Adults count is required"],
      min: [1, "At least one adult is required"],
    },

    childrenCount: {
      type: Number,
      default: 0,
      min: [0, "Children count cannot be negative"],
    },

    infantsCount: {
      type: Number,
      default: 0,
      min: [0, "Infants count cannot be negative"],
    },

    seniorsCount: {
      type: Number,
      default: 0,
      min: [0, "Seniors count cannot be negative"],
    },


    // ============================================================
    // STEP 2 — TRAVEL DATES
    // ============================================================

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    isFlexible: {
      type: Boolean,
      default: true,
    },


    // ============================================================
    // STEP 3 — DESTINATIONS
    // ============================================================

    destinations: [
      {
        cityId: {
          type: Schema.Types.ObjectId,
          ref: "City",
          required: [true, "City is required"],
        },

        order: {
          type: Number,
          required: [true, "Destination order is required"],
          min: [1, "Destination order must be at least 1"],
        },
      },
    ],


    // ============================================================
    // STEP 4 — DAYS PER CITY
    // ============================================================

    cityStays: [
      {
        cityId: {
          type: Schema.Types.ObjectId,
          ref: "City",
          required: [true, "City is required"],
        },

        nights: {
          type: Number,
          required: [true, "Number of nights is required"],
          min: [1, "At least one night is required"],
        },

        checkIn: {
          type: Date,
          default: null,
        },

        checkOut: {
          type: Date,
          default: null,
        },

        order: {
          type: Number,
          required: [true, "City stay order is required"],
          min: [1, "City stay order must be at least 1"],
        },
      },
    ],


    // ============================================================
    // STEP 5 — SIGHTSEEING & ACTIVITIES
    // ============================================================

    sightseeing: [
      {
        cityId: {
          type: Schema.Types.ObjectId,
          ref: "City",
          required: [true, "City is required"],
        },

        attractions: [
          {
            attractionId: {
              type: Schema.Types.ObjectId,
              ref: "Attraction",
              required: [true, "Attraction is required"],
            },

            duration: {
              type: Number,
              default: 0,
              min: [0, "Duration cannot be negative"],
            },
          },
        ],

        activities: [
          {
            activityId: {
              type: Schema.Types.ObjectId,
              ref: "Activity",
              required: [true, "Activity is required"],
            },

            duration: {
              type: Number,
              default: 0,
              min: [0, "Duration cannot be negative"],
            },
          },
        ],
      },
    ],


    // ============================================================
    // STEP 6 — HOTELS & MEALS
    // ============================================================

    hotels: [
      {
        cityId: {
          type: Schema.Types.ObjectId,
          ref: "City",
          required: [true, "City is required"],
        },

        hotelId: {
          type: Schema.Types.ObjectId,
          ref: "Hotel",
          required: [true, "Hotel is required"],
        },

        // Hotel rooms are embedded documents,
        // therefore roomId references the room sub-document.
        roomId: {
          type: Schema.Types.ObjectId,
          required: [true, "Room is required"],
        },

        mealPlan: {
          type: String,
          enum: {
            values: [
              "room_only",
              "breakfast",
              "half_board",
              "full_board",
              "all_inclusive",
            ],
            message: "{VALUE} is not a valid meal plan",
          },
          default: "breakfast",
        },

        checkIn: {
          type: Date,
          default: null,
        },

        checkOut: {
          type: Date,
          default: null,
        },
      },
    ],


    // ============================================================
    // STEP 7 — VEHICLES
    // ============================================================

    vehicles: [
      {
        vehicleId: {
          type: Schema.Types.ObjectId,
          ref: "Vehicle",
          required: [true, "Vehicle is required"],
        },

        quantity: {
          type: Number,
          required: [true, "Vehicle quantity is required"],
          min: [1, "Vehicle quantity must be at least 1"],
        },

        capacity: {
          type: Number,
          min: [1, "Vehicle capacity must be at least 1"],
        },
      },
    ],


    // ============================================================
    // STEP 8 — ADDONS / PREFERENCES
    // ============================================================

    addons: [
      {
        addonId: {
          type: Schema.Types.ObjectId,
          required: [true, "Addon is required"],
        },
      },
    ],

    specialNotes: {
      type: String,
      trim: true,
      maxlength: [
        3000,
        "Special notes cannot exceed 3000 characters",
      ],
      default: "",
    },


    // ============================================================
    // STEP 9 — CUSTOMER DETAILS
    // User does not need an account/login
    // ============================================================

    customer: {
      name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
        minlength: [
          2,
          "Customer name must be at least 2 characters",
        ],
        maxlength: [
          200,
          "Customer name cannot exceed 200 characters",
        ],
      },

      email: {
        type: String,
        required: [true, "Customer email is required"],
        lowercase: true,
        trim: true,
        maxlength: 254,
        match: [
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          "Please provide a valid email address",
        ],
      },

      phone: {
        type: String,
        required: [true, "Customer phone is required"],
        trim: true,
        maxlength: 30,
      },
    },


    // ============================================================
    // ITINERARY SUMMARY
    // ============================================================

    totalDays: {
      type: Number,
      required: [true, "Total days are required"],
      min: [1, "Total days must be at least 1"],
    },

    totalNights: {
      type: Number,
      required: [true, "Total nights are required"],
      min: [0, "Total nights cannot be negative"],
    },


    // ============================================================
    // CUSTOM PACKAGE STATUS
    // ============================================================

    status: {
      type: String,
      enum: {
        values: [
          "draft",
          "submitted",
          "itinerary-generated",
          "contacted",
          "confirmed",
          "cancelled",
        ],
        message: "{VALUE} is not a valid customize package status",
      },
      default: "draft",
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

// Admin: get submitted/customized packages
customizePackageSchema.index({
  status: 1,
  isActive: 1,
  createdAt: -1,
});

// Customer email lookup
customizePackageSchema.index({
  "customer.email": 1,
  createdAt: -1,
});

// Destination city lookup
customizePackageSchema.index({
  "destinations.cityId": 1,
});

// Hotel lookup
customizePackageSchema.index({
  "hotels.hotelId": 1,
});


// ================================================================
// MODEL
// ================================================================

const CustomizePackage = mongoose.model(
  "CustomizePackage",
  customizePackageSchema
);

export default CustomizePackage;