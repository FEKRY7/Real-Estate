const joi = require("joi");
const {
  isValidObjectId,
} = require("../../middleware/validation.middleware.js");

const createListing = joi
  .object({
    title: joi.string().required(),
    description: joi.string().required(),
    category: joi.string().required(),
    address: joi.string().required(),
    price: joi.number().required(),
    discount: joi.number(),
    bedrooms: joi.number().required(),
    bathrooms: joi.number().required(),
    purpose: joi.string().required(),
    furnished: joi.string(),
    parking: joi.string(),
  })
  .required();

const updateListing = joi
  .object({
    title: joi.string(),
    description: joi.string(),
    category: joi.string(),
    address: joi.string(),
    price: joi.number(),
    discount: joi.number(),
    bedrooms: joi.number(),
    bathrooms: joi.number(),
    purpose: joi.string(),
    furnished: joi.string(),
    parking: joi.string(),
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const deleteListing = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const getListingById = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

const addAndRemoveFromFavorites = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

module.exports = {
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  addAndRemoveFromFavorites,
};
