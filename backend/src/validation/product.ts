import Joi from "joi";
import { objectIdField, stockStatusField } from "./common";

// ================= Add Product Validation =================
export const productDataValidation = Joi.object({
  productName: Joi.string().trim().min(2).max(100).required(),
  company: objectIdField.required(),
  category: Joi.string().trim().min(2).max(100).required(),
  hsnCode: Joi.string().trim().min(4).max(10).required(),
  mrp: Joi.number().min(1).max(100000).required(),
  purchasePrice: Joi.number().min(0).max(100000).required(),
  sellingPrice: Joi.number().min(0).max(100000).required(),
  gstPercent: Joi.number().valid(0, 5, 12, 18, 28).required(),
  stock: Joi.number().min(0).max(100000).required(),
  minStock: Joi.number().min(0).max(10000).required(),
  stockStatus: stockStatusField.required(),
  description: Joi.string().trim().max(500).allow(""),

  batch: Joi.string().trim().max(50).allow(""),  
  expiry: Joi.string().trim().max(10).required(),  
});

// ================= Update Product Validation =================
export const productUpdateDataValidation = Joi.object({
  productName: Joi.string().trim().min(2).max(100),
  company: objectIdField,
  category: Joi.string().trim().min(2).max(100),
  hsnCode: Joi.string().trim().min(4).max(10),
  mrp: Joi.number().min(1).max(100000),
  purchasePrice: Joi.number().min(0).max(100000),
  sellingPrice: Joi.number().min(0).max(100000),
  gstPercent: Joi.number().valid(0, 5, 12, 18, 28),
  stock: Joi.number().min(0).max(100000),
  minStock: Joi.number().min(0).max(10000),
  stockStatus: stockStatusField,
  description: Joi.string().trim().max(500).allow(""),

  batch: Joi.string().trim().max(50).allow(""),
  expiry: Joi.string().trim().max(10),
}).min(1);
