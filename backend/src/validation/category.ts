import Joi from "joi";
import { objectIdField } from "./common";

export const addCategoryValidation = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
});

export const updateCategoryValidation = Joi.object({
  id: objectIdField.required(),
  name: Joi.string().trim().min(2).max(100).required(),
});

export const deleteCategoryValidation = Joi.object({
  id: objectIdField.required(),
});
