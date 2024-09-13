const categoryModel = require("../../../Database/models/Category.model.js");
const cloudinary = require("../../utils/cloud.js");
const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid"); // Assuming you're using uuid
const http = require("../../folderS,F,E/S,F,E.JS");
const { First, Second, Third } = require("../../utils/httperespons.js");

const GetAllCategories = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page);
    if (page <= 0 || !page) page = 1;

    let limit = parseInt(req.query.limit);
    if (limit <= 0 || !limit) limit = 5;

    const categories = await categoryModel
      .find({})
      .skip((page - 1) * limit)
      .limit(limit);

    return Second(res, categories, 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const GetCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await categoryModel.findById(id);
    if (!category)
      return First(res, "Cannot Find This Document", 404, http.FAIL);

    return Second(res, category, 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const AddNewCategory = async (req, res, next) => {
  try {
    const { name } = req.body; // Fixed destructuring here
    const isNameExist = await categoryModel.findOne({ name });
    if (isNameExist)
      return First(
        res,
        `This Category Name: ${name} Already Exists`,
        409,
        http.FAIL
      );

    req.body.slug = slugify(name);

    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path, // Corrected file path reference
        { folder: `Real-Estate/${req.body.name}-${uuidv4()}` }
      );
      req.body.image = { secure_url, public_id };
    }

    const category = await categoryModel.create(req.body);
    return Second(res, category, 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const UpdateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await categoryModel.findById(id);
    if (!category)
      return First(res, "Cannot Find This Document", 404, http.FAIL);

    if (req.body.name) {
      const isNameExist = await categoryModel.findOne({
        _id: { $ne: id },
        name: req.body.name,
      });
      if (isNameExist)
        return First(
          res,
          `This Category Name: ${req.body.name} Already Exists`,
          409,
          http.FAIL
        );
      req.body.slug = slugify(req.body.name);
    }

    if (req.file) {
      if (category.image && category.image.public_id) {
        await cloudinary.uploader.destroy(category.image.public_id); // Delete old image
      }
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        { folder: `Real-Estate/${req.body.name}-${uuidv4()}` }
      );
      req.body.image = { secure_url, public_id };
    }

    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    return First(res, updatedCategory, 404, http.FAIL);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

const DeleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the category exists
    const category = await categoryModel.findById(id);
    if (!category)
      return First(res, "Cannot Find This Document", 404, http.FAIL);

    // Check if the user is authenticated
    if (!req.user) {
      return First(res, "User not authenticated.", 401, http.FAIL);
    }

    // Delete image from Cloudinary if it exists
    if (category.image && category.image.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    // Delete the category from the database
    await categoryModel.findByIdAndDelete(id);

    return Second(res, "Category has been deleted!", 200, http.SUCCESS);
  } catch (error) {
    console.error(error);
    return Third(res, "Internal Server Error", 500, http.ERROR);
  }
};

module.exports = {
  GetAllCategories,
  AddNewCategory,
  UpdateCategory,
  DeleteCategory,
  GetCategoryById,
};
