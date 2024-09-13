const joi = require("joi");
const mongoose = require("mongoose");

const { Types } = mongoose;

const http = require("../folderS,F,E/S,F,E.JS");
const { First, Second, Third } = require("../utils/httperespons.js");

const isValidObjectId = (vlue, helper) => {
  if (Types.ObjectId.isValid(vlue)) return true;
  return helper.message("invlaid objectId");
};

const validation = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query };
    const validationResult = schema.validate(data, { abortEarly: false });

    if (validationResult.error) {
      const errorMessage = validationResult.error.details.map((obj) => {
        return obj.message;
      });
      return First(res, errorMessage, 404, http.FAIL);
    }

    return next();
  };
};

module.exports = {
  isValidObjectId,
  validation,
};
