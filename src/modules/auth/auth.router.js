const express = require("express");
const router = express.Router();

// Middlewares for authentication, authorization, and validation
const isAuthenticated = require("../../middleware/authentication.middeleware.js");
const isAuthorized = require("../../middleware/authoriztion.middelware.js");
const { validation } = require("../../middleware/validation.middleware.js");

const { fileUpload, fileValidation } = require("../../utils/fileUpload.js");

// Validator schemas
const {
  signUp,
  confirmUser,
  signIn,
  refreshToken,
} = require("./auth.validators.js");

// Controller functions for handling authentication
const {
  SignUp,
  LogIn,
  LogOut,
  RefreshToken,
  ConfirmUser,
} = require("./auth.controller.js");

// Routes

// Sign-up route with validation
router.post(
  "/signup",
  fileUpload(fileValidation.image).single("image"),
  validation(signUp),
  SignUp
);

// Login route with validation
router.post("/login", validation(signIn), LogIn);

// Email confirmation route with validation
router.put("/confirmEmail", validation(confirmUser), ConfirmUser);

// Refresh token route with validation
router.get(
  "/refresh/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  validation(refreshToken),
  RefreshToken
);

// Logout route protected by authentication and authorization
router.post(
  "/logout",
  isAuthenticated,
  isAuthorized("User", "Admin"), // Both 'User' and 'Admin' roles are allowed to log out
  LogOut
);

module.exports = router;
