const express = require("express");
const router = express.Router();

const isAuthenticated = require("../../middleware/authentication.middeleware.js");
const isAuthorized = require("../../middleware/authoriztion.middelware.js");
const { validation } = require("../../middleware/validation.middleware.js");

const { fileUpload, fileValidation } = require("../../utils/fileUpload.js");

const {
  addNewCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} = require("./Category.validators.js");

const {
  GetAllCategories,
  AddNewCategory,
  UpdateCategory,
  DeleteCategory,
  GetCategoryById,
} = require("./Category.controller.js");

router.get("/", GetAllCategories);

router.get(
  "/:id",
  isAuthenticated,
  isAuthorized("User"),
  validation(getCategoryById),
  GetCategoryById
);

router.post(
  "/",
  isAuthenticated,
  isAuthorized("User"),
  fileUpload(fileValidation.image).single("image"),
  validation(addNewCategory),
  AddNewCategory
);

router.put(
  "/:id",
  isAuthenticated,
  isAuthorized("User"),
  fileUpload(fileValidation.image).single("image"),
  validation(updateCategory),
  UpdateCategory
);

router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("User"),
  validation(deleteCategory),
  DeleteCategory
);

module.exports = router;
