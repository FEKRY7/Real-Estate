const express = require("express");
const router = express.Router();

const isAuthenticated = require("../../middleware/authentication.middeleware.js");
const isAuthorized = require("../../middleware/authoriztion.middelware.js");
const { validation } = require("../../middleware/validation.middleware.js");

const { fileUpload, fileValidation } = require("../../utils/fileUpload.js");

const {
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  addAndRemoveFromFavorites,
} = require("./Listing.validators.js");

const {
  GetAllListings,
  GetListingById,
  CreateNewListing,
  UpdateListing,
  DeleteListing,
  ClearFavorites,
  AddAndRemoveFromFavorites,
} = require("./Listing.controller.js");

router.get("/", GetAllListings);

router.get("/:id", validation(getListingById), GetListingById);

router.post(
  "/",
  isAuthenticated,
  isAuthorized("User"),
  fileUpload(fileValidation.image).array("images", 6),
  validation(createListing),
  CreateNewListing
);

router.put(
  "/:id",
  isAuthenticated,
  isAuthorized("User"),
  fileUpload(fileValidation.image).array("images", 6),
  validation(updateListing),
  UpdateListing
);

router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("User"),
  validation(deleteListing),
  DeleteListing
);

router.patch(
  "/favorites/clear",
  isAuthenticated,
  isAuthorized("User"),
  ClearFavorites
);

router.patch(
  "/favorites/:id",
  isAuthenticated,
  isAuthorized("User"),
  validation(addAndRemoveFromFavorites),
  AddAndRemoveFromFavorites
);

module.exports = router;
