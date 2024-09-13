const joi = require("joi");
const {
  isValidObjectId,
} = require("../../middleware/validation.middleware.js");


const getProfileById = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();
 

const updatePassword = joi
  .object({
    oldPassword: joi.string().required(),
    newPassword: joi.string().min(5).max(30).required(),
    confirmNewPassword: joi.string().valid(joi.ref('newPassword')).required(),
  })
  .required();

  const deleteProfile = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();

  const updateProfile = joi
  .object({
    userName: joi.string(),
    phone: joi.string(),
    image: joi.string(),
  })
  .required();

  
module.exports = {
  getProfileById,
  updatePassword,
  deleteProfile,
  updateProfile
};





