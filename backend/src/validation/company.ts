import Joi from "joi";
import { emailField, gstField, phoneField, pincodeField } from "./common";

export const companyDataValidation = Joi.object({
  companyName: Joi.string().trim().min(3).max(200).required(),
  gstNumber: gstField.allow("").optional(),
  phone: phoneField.required(),
  email: emailField.allow("").optional(),
  address: Joi.string().trim().min(5).max(500).allow("").optional(),
  city: Joi.string().trim().min(2).max(100).allow("").optional(),
  state: Joi.string().trim().min(2).max(100).allow("").optional(),
  pincode: Joi.alternatives().try(
    pincodeField,
    Joi.number().integer().min(100000).max(999999)
  ).allow("").optional(),
});

export const companyUpdateDataValidation = Joi.object({
  companyName: Joi.string().trim().min(3).max(200).optional(),
  gstNumber: gstField.allow("").optional(),
  phone: phoneField.optional(),
  email: emailField.allow("").optional(),
  address: Joi.string().trim().min(5).max(500).allow("").optional(),
  city: Joi.string().trim().min(2).max(100).allow("").optional(),
  state: Joi.string().trim().min(2).max(100).allow("").optional(),
  pincode: Joi.alternatives().try(
    pincodeField,
    Joi.number().integer().min(100000).max(999999)
  ).allow("").optional(),
}).min(1);

