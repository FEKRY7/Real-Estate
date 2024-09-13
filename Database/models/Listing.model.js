const mongoose = require("mongoose");
const slugify = require("slugify");

const { Types } = mongoose;

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String },
    category: {
      type: String,
      enum: ["Apartment", "House", "Office", "Land", "Commercial"],
      required: true
    },
    description: { type: String, required: true },
    address: { type: String, required: true },
    price: { type: Number, required: true }, // Changed to Number
    discount: { type: Number }, // Changed to Number
    bathrooms: { type: Number, required: true }, // Changed to Number
    bedrooms: { type: Number, required: true }, // Changed to Number
    furnished: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    purpose: { type: String, enum: ["For Rent", "For Sale"], required: true },
    images: [
      {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    createdBy: { type: Types.ObjectId, ref: "User", required: true }, // Added required and ref
  },
  { timestamps: true, strict: true } // Changed strictQuery to strict
);

// Middleware to generate slug before saving
listingSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

const listingModel = mongoose.model("Listing", listingSchema);

module.exports = listingModel;
