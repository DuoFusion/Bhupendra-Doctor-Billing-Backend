import Joi from "joi";
import { emailField, phoneField, pincodeField, roleField } from "./common";

export const userValidaiton = Joi.object({
  email: emailField.required(),
  name: Joi.string().trim().min(3).max(200).required(),
  role: roleField.required(),
  phone: phoneField.allow("").optional(),
  address: Joi.string().trim().max(500).allow("").optional(),
  city: Joi.string().trim().min(2).max(100).allow("").optional(),
  state: Joi.string().trim().min(2).max(100).allow("").optional(),
  pincode: pincodeField.allow("").optional(),
});
