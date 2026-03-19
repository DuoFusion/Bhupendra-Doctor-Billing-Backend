import Joi from "joi";
import { FINANCIAL_TYPE } from "../common";
import { objectIdField } from "./common";

// ================= Add Product Validation =================
export const financialDataValidation = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid(...Object.values(FINANCIAL_TYPE)).required(),
  from: Joi.string().optional().allow("", null),
  amount: Joi.number().required(),
  date: Joi.date().required(),
  description: Joi.string().optional().allow("", null),
  userId: objectIdField.optional(),
  medicalStoreId: objectIdField.optional(),
});

// ================= Update Product Validation =================
export const financialUpdateDataValidation = Joi.object({
  name: Joi.string().optional(),
  type: Joi.string().valid(...Object.values(FINANCIAL_TYPE)).optional(),
  from: Joi.string().optional().allow("", null),
  amount: Joi.number().optional(),
  date: Joi.date().optional(),
  description: Joi.string().optional().allow("", null),
  userId: objectIdField.optional(),
  medicalStoreId: objectIdField.optional(),
});

export const toggleFinancialStatusValidation = Joi.object({
  isActive: Joi.boolean().required(),
});
