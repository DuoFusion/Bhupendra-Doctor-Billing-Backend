import { responseMessage, status_code } from "../../common";
import { productModel } from "../../model";
import { joiValidationOptions, productValidation } from "../../validation";

const toPositiveInt = (value: any, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

// ================= Get All Products (Admin) =================
export const getAllProducts = async (req, res) => {
  try {
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const page = toPositiveInt(req.query.page, 1);
    const limit = toPositiveInt(req.query.limit, 10);
    const search = (req.query.search || "").toString().trim();
    const sortBy = (req.query.sortBy || "createdAt").toString();
    const order = (req.query.order || "desc").toString().toLowerCase() === "asc" ? 1 : -1;

    const query: any = { isDeleted: false };
    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ productName: regex }, { category: regex }, { hsnCode: regex }];
    }

    const total = await productModel.Product_Collection.countDocuments(query);
    let productQuery = productModel.Product_Collection
      .find(query)
      .populate("company")
      .populate("user", "name email role")
      .sort({ [sortBy]: order });
    if (hasPagination) {
      productQuery = productQuery.skip((page - 1) * limit).limit(limit);
    }
    const products = await productQuery;

    res.status(status_code.SUCCESS).json({
      status: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: hasPagination ? Math.ceil(total / limit) : (total > 0 ? 1 : 0),
      },
    });

  } catch (error) {
    res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: responseMessage.allProductsGet_failed,
      error,
    });
  }
};



// ================= Get My Products (User) =================
export const getMyProducts = async (req, res) => {
  try {
    const products = await productModel.Product_Collection
      .find({ isDeleted: false, user: req.user._id })
      .populate("company")
      .populate("user", "name email role");

    res.status(status_code.SUCCESS).json({
      status: true,
      message: "My products fetched successfully",
      products,
    });

  } catch (error) {
    res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: "Failed to fetch my products",
      error,
    });
  }
};


// ================= Add New Product =================
export const addNewProduct = async (req, res) => {

  const { error, value } = productValidation.productDataValidation.validate(req.body, joiValidationOptions);

  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details[0].message,
    });
  }

  try {
    const result = await productModel.Product_Collection.create({
      ...value,
      user: req.user._id,
    });

    res.status(status_code.SUCCESS).json({
      status: true,
      message: responseMessage.newProductAdded_success,
      result,
    });

  } catch (error) {
    res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: responseMessage.newProductAdded_failed,
      error,
    });
  }
};

// ================= get Product By Id =================
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.Product_Collection.findById(id)
      .populate("company")
      .populate("user", "name email role");

    if (!product || product.isDeleted) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: true,
      product,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: "Failed to fetch product",
      error,
    });
  }
};


// ================= Update Product =================
export const updateProduct = async (req, res) => {

  const { error, value } = productValidation.productUpdateDataValidation.validate(req.body, joiValidationOptions);

  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details[0].message,
    });
  }

  try {
    const { id } = req.params;

    const result = await productModel.Product_Collection.findOneAndUpdate(
      { _id: id, user: req.user._id, isDeleted: false },
      value,
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Product not found or unauthorized",
      });
    }

    res.status(status_code.SUCCESS).json({
      status: true,
      message: responseMessage.productUpdate_success,
      result,
    });

  } catch (error) {
    res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: responseMessage.productUpdate_failed,
      error,
    });
  }
};


// ================= Delete Product (Soft Delete) =================
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    let result;

    if (req.user.role === "admin") {
        result = await productModel.Product_Collection.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );
    } else {
      result = await productModel.Product_Collection.findOneAndUpdate(
        { _id: id, user: req.user._id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );
    } 

    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Product not found or unauthorized",
      });
    }

    res.status(status_code.SUCCESS).json({
      status: true,
      message: responseMessage.productDeleted_success,
      result,
    });

  } catch (error) {
    res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: responseMessage.productDeleted_failed,
      error,
    });
  }
};
