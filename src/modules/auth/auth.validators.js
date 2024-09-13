const joi = require("joi");
const {
  isValidObjectId,
} = require("../../middleware/validation.middleware.js");

const signUp = joi
  .object({
    userName: joi.string().min(2).max(20).required(),
    email: joi.string().email().required(),
    password: joi.string().min(5).max(30).required(),
    confirmNewPassword: joi.string().valid(joi.ref('password')).required(),
    phone: joi.string().required(),
  })
  .required();

const confirmUser = joi
  .object({
    email: joi.string().email().required()
  })
  .required();

const signIn = joi
  .object({
    email: joi.string().required().email().messages({
      "any.required": "Email is required",
      "string.email": "Email must be a valid email",
    }),
    password: joi.string().required(),
  })
  .required();

const refreshToken = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();


module.exports = {
  signUp,
  confirmUser,
  signIn,
  refreshToken,
};
