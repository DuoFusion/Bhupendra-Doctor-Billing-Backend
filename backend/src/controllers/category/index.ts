import { responseMessage, status_code } from "../../common";
import { categoryModel } from "../../model";
import { categoryValidation, joiValidationOptions } from "../../validation";

const toPositiveInt = (value: any, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

// ================= Get All Category =================
export const getCategories = async (req, res) => {
  try {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const page = toPositiveInt(req.query.page, 1);
    const limit = toPositiveInt(req.query.limit, 10);
    const search = (req.query.search || "").toString().trim();
    const sortBy = (req.query.sortBy || "createdAt").toString();
    const order = (req.query.order || "desc").toString().toLowerCase() === "asc" ? 1 : -1;

    const query: any = { isDeleted: false };
    if (req.user.role !== "admin") {
      query.userId = req.user._id;
    }
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.name = regex;
    }

    const total = await categoryModel.CategoryModel.countDocuments(query);
    let categoryQuery = categoryModel.CategoryModel.find(query)
      .populate("userId", "name email")
      .sort({ [sortBy]: order });
    if (hasPagination) {
      categoryQuery = categoryQuery.skip((page - 1) * limit).limit(limit);
    }
    const data = await categoryQuery;

    return res.status(status_code.SUCCESS).json({
      status: true,
      message: responseMessage.allCategoriesGet_success,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: hasPagination ? Math.ceil(total / limit) : (total > 0 ? 1 : 0),
      },
    });

  } catch (error) {
    return res.status(status_code.BAD_REQUEST).json({ status: false, message: responseMessage.allCategoriesGet_failed, error });
  }
};

// ================= Add new Category =================
export const addCategory = async (req, res) => {
  const { error, value } = categoryValidation.addCategoryValidation.validate(req.body, joiValidationOptions);
  if (error) {
    return res.status(status_code.BAD_REQUEST).json({ status: false, message: error.details[0].message });
  }

  try {
    const normalized = value.name.trim();
    const existing = await categoryModel.CategoryModel.findOne({
      userId: req.user._id,
      name: { $regex: new RegExp(`^${normalized}$`, "i") },
      isDeleted: false,
    });
    if (existing) {
      return res.status(400).json({ status: false, message: "Category already exists." });
    }

    const created = await categoryModel.CategoryModel.create({ userId: req.user._id, name: normalized });
    return res.status(status_code.SUCCESS).json({ status: true, message: responseMessage.categoryAdded_success, data: created });

  } catch (error) {
    return res.status(status_code.BAD_REQUEST).json({ status: false, message: responseMessage.categoryAdded_failed, error });
  }
};


// ================= Update Category =================
export const updateCategory = async (req, res) => {
  const { error, value } = categoryValidation.updateCategoryValidation.validate(req.body, joiValidationOptions);
  if (error) {
    return res.status(status_code.BAD_REQUEST).json({ status: false, message: error.details[0].message });
  }

  try {
    const { id, name } = value;

    const query: any = { _id: id, isDeleted: false };
    if (req.user.role !== "admin") {
      query.userId = req.user._id;
    }
    const category = await categoryModel.CategoryModel.findOne(query);
    if (!category) {
      return res.status(404).json({ status: false, message: "Category not found" });
    }
    const normalized = name.trim();
    const duplicate = await categoryModel.CategoryModel.findOne({
      _id: { $ne: id },
      userId: category.userId,
      name: { $regex: new RegExp(`^${normalized}$`, "i") },
      isDeleted: false,
    });
    if (duplicate) {
      return res.status(400).json({ status: false, message: "Category already exists." });
    }

    category.name = normalized;
    await category.save();

    return res.status(status_code.SUCCESS).json({ status: true, message: responseMessage.categoryUpdate_success, data: category });

  } catch (error) {
    return res.status(status_code.BAD_REQUEST).json({ status: false, message: responseMessage.categoryUpdate_failed, error });
  }
};


// ================= Soft Delete Category =================
export const deleteCategory = async (req, res) => {
  const { error, value } = categoryValidation.deleteCategoryValidation.validate(req.body, joiValidationOptions);
  if (error) {
    return res.status(status_code.BAD_REQUEST).json({ status: false, message: error.details[0].message });
  }

  try {
    const { id } = value;

    const query: any = { _id: id, isDeleted: false };
    if (req.user.role !== "admin") {
      query.userId = req.user._id;
    }

    const category = await categoryModel.CategoryModel.findOneAndUpdate(
      query,
      { isDeleted: true },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ status: false, message: "Category not found" });
    }

    return res.status(status_code.SUCCESS).json({ status: true, message: responseMessage.categoryDeleted_success, data: category });

  } catch (error) {
    return res.status(status_code.BAD_REQUEST).json({ status: false, message: responseMessage.categoryDeleted_failed, error });
  }
};
