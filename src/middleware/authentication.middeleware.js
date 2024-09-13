const jwt = require("jsonwebtoken");
const tokenModel = require("../../Database/models/token.model.js");
const userModel = require("../../Database/models/User.model.js");
const http = require("../folderS,F,E/S,F,E.JS");
const { First, Second, Third } = require("../utils/httperespons.js");

const isAuthenticated = async (req, res, next) => {
  // checking token existeince
  const token = req.headers.token;

  if (!token) {
    return First(res, "token is required", 400, http.FAIL);
  }

  // checking token vlaidation
  const tokenDb = await tokenModel.findOne({ token, isValied: true });
  if (!tokenDb) {
    return First(res, "expired Token", 400, http.FAIL);
  }

  // checkeing user vlaidateion
  const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const user = await userModel.findById(payload.id);
  if (!user) {
    return First(res, "user not found", 400, http.FAIL);
  }

  req.user = user;

  next();
};

module.exports = isAuthenticated;
