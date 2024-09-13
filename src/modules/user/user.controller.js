const userModel = require("../../../Database/models/User.model.js");
const listingModel = require("../../../Database/models/Listing.model.js");
const bcrypt = require("bcrypt");
const cloudinary = require("../../utils/cloud.js");
const http = require("../../folderS,F,E/S,F,E.JS");
const { First, Second, Third } = require("../../utils/httperespons.js");

//updatePassword User Must Be Loggin  old !== new
const UpdatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Find the user by ID
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return First(res, "User not found", 404, http.FAIL);
    }

    // Check if the old password is correct
    const isValidOldPassword = bcrypt.compare(oldPassword, user.password);
    if (!isValidOldPassword) {
      return First(res, "Old password is incorrect", 400, http.FAIL);
    }

    // Check if the new password is the same as the old password
    const isSameAsOldPassword = bcrypt.compare(newPassword, user.password);
    if (isSameAsOldPassword) {
      return First(
        res,
        "New password cannot be the same as the old password",
        409,
        http.FAIL
      );
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10); // Use a higher salt rounds for better security

    // Update the user's password in the database
    user.password = hashedNewPassword;
    await user.save();

    return Second(res, "Password changed successfully", 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const UpdateUserProfile = async (req, res, next) => {
  try {
    // Check if the User exists
    const checkUserExisting = await userModel.findById(req.user._id);
    if (!checkUserExisting) {
      return First(res, "This User does not exist", 404, http.FAIL);
    }

    // Check if User name already exists (excluding the current User)
    const checkUserName = await userModel.findOne({
      userName: req.body.userName,
      _id: { $ne: req.user._id }, // Fix: Use req.user._id instead of id
    });
    if (checkUserName) {
      return First(
        res,
        `User name "${req.body.userName}" already exists`,
        409,
        http.FAIL
      );
    }

    // If a new file is uploaded, replace the old image
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: `Real-EstateTesting/User/${
            req.body.userName || checkUserExisting.userName
          }`,
        }
      );

      // Delete the old profileImage from Cloudinary
      if (checkUserExisting.profileImage?.public_id) {
        await cloudinary.uploader.destroy(
          checkUserExisting.profileImage.public_id
        );
      }
      req.body.profileImage = { secure_url, public_id };
    }

    // Update the User
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Optional: Run validators for updated fields
      }
    );
    if (!updatedUser) {
      return First(res, "No User requests found", 404, http.FAIL);
    }

    return Second(
      res,
      ["User updated successfully", updatedUser],
      200,
      http.SUCCESS
    );
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const GetUserListings = async (req, res, next) => {
  try {
    // Fetch listings created by the current user
    const listings = await listingModel.find({ createdBy: req.user._id });

    // Check if any listings are found
    if (!listings) {
      return First(res, "No listings found for this user.", 404, http.FAIL);
    }

    // Return the listings if found
    return Second(res, listings, 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const DeleteUserProfile = async (req, res, next) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return First(res, "User not authenticated.", 401, http.FAIL);
    }

    // Check if the user is trying to delete their own account
    if (req.user._id.toString() !== req.params.id) {
      return First(
        res,
        "You can only delete your own account!",
        401,
        http.FAIL
      );
    }

    // Attempt to find and delete the user by ID
    const deletedUser = await userModel.findById(req.params.id);

    if (!deletedUser) {
      return First(res, "User not found.", 404, http.FAIL);
    }

    // Delete the user
    await userModel.findByIdAndDelete(req.params.id);

    // Delete the profile image if it exists
    if (deletedUser.profileImage?.public_id) {
      try {
        await cloudinary.uploader.destroy(deletedUser.profileImage.public_id);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Handle cloudinary deletion errors, if necessary
      }
    }

    // Respond with a success message
    return Second(res, "User has been deleted!", 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const GetProfileById = async (req, res, next) => {
  try {
    // Fetch the user by ID
    const user = await userModel.findById(req.params.id);

    // Check if user was found
    if (!user) {
      return First(res, "User not found!", 404, http.FAIL);
    }

    // Destructure and exclude password from the response
    const { password, ...rest } = user.toObject(); // Use toObject() to convert mongoose document

    // Send the user data excluding the password
    return Second(res, rest, 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const GetUserFavorites = async (req, res, next) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return First(res, "Should be logged in first", 404, http.FAIL);
    }

    // Fetch the user and populate their favorites
    const user = await userModel.findById(req.user._id).populate("favorites");

    // Check if the user exists and has favorites
    if (!user) {
      return First(res, "User not found.", 404, http.FAIL);
    }

    const favorites = user.favorites;

    // Respond with the favorites
    return Second(res, ["Done", favorites], 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

module.exports = {
  UpdatePassword,
  UpdateUserProfile,
  GetUserListings,
  DeleteUserProfile,
  GetProfileById,
  GetUserFavorites,
};
