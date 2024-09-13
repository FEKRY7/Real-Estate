const cloudinary = require("./cloud.js");
const otpGenerator = require("otp-generator");
const schedule = require("node-schedule");
const { sendEmail } = require("./sendEmail.js");
const userModel = require("../../Database/models/User.model.js");
const moment = require("moment");
const http = require("../folderS,F,E/S,F,E.JS");
const { First, Second, Third } = require("../utils/httperespons.js");

const deleteOneById = (model) => {
  try {
    return asyncHandler(async (req, res, next) => {
      const { id } = req.params;
      const isExist = await model.findByIdAndDelete(id);
      if (!isExist) {
        return First(res, "This Document Is Not Exist", 404, http.FAIL);
      }
      if (isExist.image.public_id) {
        await cloudinary.uploader.destroy(isExist.image.public_id);
      }

      return Second(res, "Deleted Successfully", 200, http.SUCCESS);
    });
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const getOneById = (model) => {
  try {
    return async (req, res, next) => {
      const { id } = req.params;
      const searchResult = await model.findById(id);
      if (!searchResult) {
        return First(res, "This Document is Not Exist", 404, http.FAIL);
      }
      return Second(res, ["Done", searchResult], 200, http.SUCCESS);
    };
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const checkUserBasices = (user, res) => {
  //Check IsEmailConfirmed
  if (!user.confirmEmail)
    return First(res, "Confirm Your Email First", 403, http.FAIL);
  //Check isDeleted
  if (user.isDeleted)
    return First(
      res,
      "Your Account Has Deleted Contact With Support ...",
      403,
      http.FAIL
    );

  //Check Status
  if (user.status == "Blocked")
    return First(
      res,
      "Your Account Has Blocked Contact With Support ...",
      403,
      http.FAIL
    );
};

const URL = (req) => {
  const URL = `${req.protocol}://${req.headers.host}`;
  return URL;
};

const dateHandler = (startDateRange, endtDateRange) => {
  const formattedDate = {
    startDate: startDateRange.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }),
    endtDate: endtDateRange.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }),
  };
  return formattedDate;
};

const NotConfirmedEmailsReminder = async () => {
  const notConfirmedUsers = await userModel.find({ confirmEmail: false });
  schedule.scheduleJob("0 0 21 * * *", function () {
    for (let i = 0; i < notConfirmedUsers.length; i++) {
      console.log("Reminder Sent");
      sendEmail({
        to: notConfirmedUsers[i].email,
        subject: "NoReplay (Email Confirmation reminder)",
        text: "This Mail Sent Automatically As Remider To Confirm Your Email Please Do Not Replay",
      });
    }
  });
};

const generateOTP = () => {
  const OTP = {
    OTPCode: otpGenerator.generate(process.env.OTPNUMBERS, {
      upperCaseAlphabets: false,
      specialChars: false,
    }),
  };
  return OTP;
};

const generateOTPWithExpireDate = () => {
  // Parse and validate the OTP length from environment variables
  const otpLength = parseInt(process.env.OTPNUMBERS, 3);
  const OTP = {
    OTPCode: otpGenerator.generate(otpLength, {
      upperCaseAlphabets: false,
      specialChars: false,
    }),
    expireDate: moment().add(2, "minutes").toDate(), // Convert moment to Date object
  };

  return OTP;
};

module.exports = {
  deleteOneById,
  getOneById,
  checkUserBasices,
  URL,
  dateHandler,
  NotConfirmedEmailsReminder,
  generateOTP,
  generateOTPWithExpireDate,
};
