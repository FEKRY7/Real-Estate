const joi = require("joi");
const {
  isValidObjectId,
} = require("../../middleware/validation.middleware.js");

const addNewCategory = joi
  .object({
    name:joi.string().min(3).max(25).required()
  })
  .required();

const updateCategory = joi
  .object({
    name:joi.string().min(3).max(25).required(),
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const deleteCategory = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const getCategoryById = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

module.exports = {
  addNewCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
};