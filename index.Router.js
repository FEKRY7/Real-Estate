const express = require("express");

const authRouter = require("./src/modules/auth/auth.router.js");
const userRouter = require("./src/modules/user/user.router.js");
const categoryRouter = require("./src/modules/Category/Category.router.js");
const listingRouter = require("./src/modules/Listing/Listing.router.js");
const mongodbconnect = require("./Database/dbConnection.js");
const cookieParser = require('cookie-parser')

const AppRouter = (app) => {
  mongodbconnect();

  //convert Buffer Data
  // Middleware to parse JSON
  app.use(express.json());
  app.use(cookieParser());
  
  // Routes
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/category", categoryRouter);
  app.use("/api/listing", listingRouter);

  // 404 route
  app.use("*", (req, res) => {
    res.status(404).json({ Msg: "I Can't Found" });
  });
};

module.exports = AppRouter;
