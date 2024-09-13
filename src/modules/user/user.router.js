const express = require("express");
const router = express.Router();
const isAuthenticated = require("../../middleware/authentication.middeleware.js");
const isAuthorized = require("../../middleware/authoriztion.middelware.js");
const { validation } = require("../../middleware/validation.middleware.js");

const { fileUpload, fileValidation } = require("../../utils/fileUpload.js");

const {
  getProfileById,
  updatePassword,
  deleteProfile,
  updateProfile,
} = require("./user.validators.js");

const {
  UpdatePassword,
  UpdateUserProfile,
  GetUserListings,
  DeleteUserProfile,
  GetProfileById,
  GetUserFavorites,
} = require("./user.controller.js");

router.get("/listings", isAuthenticated, isAuthorized("User"), GetUserListings);

router.get(
  "/favorites",
  isAuthenticated,
  isAuthorized("User"),
  GetUserFavorites
);

router.get(
  "/profile/:id",
  isAuthenticated,
  isAuthorized("User"),
  validation(getProfileById),
  GetProfileById
);

router.patch(
  "/updateProfile",
  isAuthenticated,
  isAuthorized("User"),
  fileUpload(fileValidation.image).single("image"),
  validation(updateProfile),
  UpdateUserProfile
);

router.patch(
  "/updatepassword",
  isAuthenticated,
  isAuthorized("User"),
  validation(updatePassword),
  UpdatePassword
);

router.delete(
  "/deleteProfile/:id",
  isAuthenticated,
  isAuthorized("User"),
  validation(deleteProfile),
  DeleteUserProfile
);

module.exports = router;
