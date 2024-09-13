const listingModel = require("../../../Database/models/Listing.model.js");
const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("../../utils/cloud.js");
const ApiFeatures = require("../../utils/apiFeatures.js");
const userModel = require("../../../Database/models/User.model.js");
const http = require("../../folderS,F,E/S,F,E.JS");
const { First, Second, Third } = require("../../utils/httperespons.js");

const GetAllListings = async (req, res, next) => {
  // Extracting query, pagination, and sorting features from ApiFeatures
  const { query, page, skip, limit, sort, fields, order } = ApiFeatures(
    req.query
  );

  // Log query parameters for debugging
  console.log("Query:", query);
  console.log("Page:", page);
  console.log("Limit:", limit);
  console.log("Sort:", sort);
  console.log("Order:", order);

  try {
    // Get total number of documents that match the query
    const totalDocuments = await listingModel.countDocuments(query);

    // Fetch listings based on query, pagination, and sorting
    const listings = await listingModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ [sort]: order })
      .select(fields);

    // Calculate total pages
    const totalPages = Math.ceil(totalDocuments / limit);

    // Return the response with listing details
    return Second(
      res,
      [totalDocuments, listings, totalPages],
      200,
      http.SUCCESS
    );
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const GetListingById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const listing = await listingModel.findById(id);
    if (!listing)
      return First(res, "Cannot Find This Document", 404, http.FAIL);

    return Second(res, listing, 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const CreateNewListing = async (req, res, next) => {
  try {
    // Handle file upload to Cloudinary
    if (req.files) {
      const images = [];
      for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          {
            folder: `Real-Estate/${req.body.title
              .split(" ")
              .slice(1, 2)}-${uuidv4()}`,
          }
        );
        images.push({ secure_url, public_id });
      }
      req.body.images = images;
    }

    // Apply discount if provided
    if (req.body.discount && req.body.price) {
      req.body.price =
        req.body.price - (req.body.discount * req.body.price) / 100;
    }

    // Default value for furnished
    req.body.furnished = req.body.furnished || false;
    req.body.createdBy = req.user._id;
    req.body.title = req.body.title.toLowerCase();
    req.body.description = req.body.description.toLowerCase();

    const listing = await listingModel.create(req.body);
    return Second(res, listing, 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const UpdateListing = async (req, res, next) => {
  const { id } = req.params;

  try {
    const listing = await listingModel.findById(id);
    if (!listing) return First(res, "Document not found", 404, http.FAIL);

    // Update slug if title is provided
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    // Handle file uploads if any images are provided
    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const { secure_url, public_id } = await cloudinary.uploader.upload(
            file.path,
            { folder: `Real-Estate/${req.body.name}-${uuidv4()}` }
          );
          return { secure_url, public_id };
        })
      );
      req.body.images = uploadedImages;

      // Remove old images from Cloudinary
      if (listing.images && listing.images.length > 0) {
        await Promise.all(
          listing.images.map(async (image) => {
            await cloudinary.uploader.destroy(image.public_id);
          })
        );
      }
    }

    // Apply discount logic
    if (req.body.discount && req.body.price) {
      const discountAmount = (req.body.discount * req.body.price) / 100;
      req.body.price -= discountAmount;
    }

    // Set default value for furnished if not provided
    req.body.furnished = req.body.furnished || false;

    // Update the listing
    const updatedListing = await listingModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    return Second(res, updatedListing, 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const DeleteListing = async (req, res, next) => {
  const { id } = req.params;

  try {
    const listing = await listingModel.findById(id);
    if (!listing)
      return First(res, "Cannot Find This Document", 404, http.FAIL);

    // Delete images from Cloudinary
    if (listing.images) {
      for (const image of listing.images) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    await listingModel.findByIdAndDelete(id);

    return Second(res, "Listing deleted", 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const AddAndRemoveFromFavorites = async (req, res, next) => {
  if (!req.user) {
    return First(res, "You must be logged in first", 401, http.FAIL);
  }

  const listingId = req.params.id;

  try {
    const listing = await listingModel.findById(listingId);
    if (!listing) return First(res, "No Listing Found", 404, http.FAIL);

    const isInFavorites = req.user.favorites.includes(listingId);

    if (isInFavorites) {
      await userModel.findByIdAndUpdate(req.user._id, {
        $pull: { favorites: listingId },
      });
      return res.status(200).json({
        success: true,
        message: `Listing ${listing.title} removed from favorites`,
      });
    }

    await userModel.findByIdAndUpdate(req.user._id, {
      $addToSet: { favorites: listingId },
    });

    return Second(
      res,
      `Listing ${listing.title} added to favorites`,
      200,
      http.SUCCESS
    );
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const ClearFavorites = async (req, res, next) => {
  if (!req.user) {
    return First(res, "You must be logged in first", 401, http.FAIL);
  }

  try {
    await userModel.findByIdAndUpdate(req.user._id, { favorites: [] });

    return Second(res, "Favorites cleared successfully", 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

module.exports = {
  GetAllListings,
  GetListingById,
  CreateNewListing,
  UpdateListing,
  DeleteListing,
  ClearFavorites,
  AddAndRemoveFromFavorites,
};
