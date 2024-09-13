const userModel = require("../../../Database/models/User.model.js");
const CryptoJS = require("crypto-js");
const bcrypt = require("bcrypt");
const { createHTML, sendEmail } = require("../../utils/sendEmail.js");
const jwt = require("jsonwebtoken");
const tokenModel = require("../../../Database/models/token.model.js");
const { checkUserBasices } = require("../../utils/Reuseable.js");
const OTPGeneratorFn = require("../../utils/otpGenerator.js");
const otpGenerator = require("otp-generator");
const cloudinary = require("../../utils/cloud.js");
const http = require("../../folderS,F,E/S,F,E.JS");
const { First, Second, Third } = require("../../utils/httperespons.js");

//signUP
const SignUp = async (req, res) => {
  try {
    // Receive Data from body
    let { userName, email, password, phone, age } = req.body;

    // Validate input
    if (!userName || !email || !password || !phone) {
      return First(res, "All fields are required", 400, http.FAIL);
    }

    // Check if this email is existing in the database or not
    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      return First(res, "This Email Already In Use", 409, http.FAIL);
    }

    // Hash Password
    const hashPassword = await bcrypt.hash(password, 10); // Use 10 rounds for hashing

    // Encrypt Phone
    phone = CryptoJS.AES.encrypt(phone, process.env.CRYPTOKEY).toString();

    // Upload Profile Image to Cloudinary
    let profileImage = {};
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `Real-EstateTesting/User/${userName}`,
        }
      );
      profileImage = { secure_url, public_id };
    }

    // Generate random OTP
    const OTP = OTPGeneratorFn();

    // Insert OTP number into HTML page that will be sent by mail
    const html = createHTML(OTP);

    // Send Confirmation Email
    const emailSent = sendEmail({
      to: email,
      subject: "Confirmation Email",
      text: "Please Click The Below Link To Confirm Your Email",
      html,
    });

    if (!emailSent) {
      return First(
        res,
        "There is something wrong with the email sender",
        500,
        http.FAIL
      );
    }

    // Create New User
    const newUser = new userModel({
      userName,
      email,
      password: hashPassword,
      phone,
      OTP,
      profileImage,
    });

    const user = await newUser.save();

    return Second(res, ["User created successfully", user], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

//confirmUser
const ConfirmUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return First(res, "This Email Is Not Exist", 404, http.FAIL);
    }
    if (user.confirmEmail)
      return First(
        res,
        "This Email Already Confimred ... Go To Login In Page",
        404,
        http.FAIL
      );
    if (!user.OTP) {
      return First(res, "In Vaild OTP", 404, http.FAIL);
    }
    const newOTP = otpGenerator.generate(10);
    const confirmUser = await userModel.findOneAndUpdate(
      { email },
      { confirmEmail: true, OTP: newOTP },
      { new: true }
    );
    return Second(res, ["Done", confirmUser], 201, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const LogIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return First(res, "Wrong Password Or Email", 401, http.FAIL);
    }

    // Check if password matches
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return First(res, "Wrong Password Or Email", 401, http.FAIL);
    }

    // Check basic user validations (email confirmation, deletion, status)
    const basicsCheckResponse = checkUserBasices(user, res);
    if (basicsCheckResponse) {
      return; // Exit if response is already sent
    }

    // Generate JWT Token
    const payload = {
      userName: user.userName,
      email: user.email,
      id: user._id,
      profileImage: user.profileImage,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "2h",
    });

    // Save the token (optional step)
    await tokenModel.create({ token, user: user._id });

    // Update user status to 'Online'
    await userModel.findOneAndUpdate(
      { email: user.email },
      { status: "Online" }
    );

    // Send response
    return Second(res, ["Logged In", token], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const LogOut = async (req, res, next) => {
  try {
    // Find and update the user's status to 'Offline'
    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      { status: "Offline" },
      { new: true }
    );

    // Check if the user exists
    if (!user) {
      return First(res, "User not found", 401, http.FAIL);
    }

    return Second(res, "Logged Out Successfully", 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const RefreshToken = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      return First(res, "Can't Found User", 401, http.FAIL);
    }

    const payload = {
      userName: user.userName,
      email: user.email,
      id: user._id,
      profileImage: user.profileImage,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "2h",
    });

    // Save the token (optional step)
    await tokenModel.create({ token, user: user._id });

    return Second(res, ["Done", { results: token }], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

module.exports = {
  SignUp,
  LogIn,
  LogOut,
  RefreshToken,
  ConfirmUser,
};
