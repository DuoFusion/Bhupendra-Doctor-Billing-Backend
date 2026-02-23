import Joi from "joi";
import {
  emailField,
  nameField,
  otpField,
  passwordField,
  phoneField,
  pincodeField,
  roleField,
} from "./common";

export const signUpValidation = Joi.object({
  name: nameField.required(),
  email: emailField.required(),
  password: passwordField.required(),
  role: roleField.required(),
  phone: phoneField.allow("").optional(),
  address: Joi.string().trim().max(500).allow("").optional(),
  city: Joi.string().trim().min(2).max(100).allow("").optional(),
  state: Joi.string().trim().min(2).max(100).allow("").optional(),
  pincode: pincodeField.allow("").optional(),
});

export const signInValidation = Joi.object({
  email: emailField.required(),
  password: passwordField.required(),
});

export const verifyOtpValidation = Joi.object({
  email: emailField.required(),
  otp: otpField.required(),
});

export const updateProfileValidation = Joi.object({
  name: nameField.optional(),
  email: emailField.optional(),
  phone: phoneField.allow("").optional(),
  address: Joi.string().trim().max(500).allow("").optional(),
  city: Joi.string().trim().min(2).max(100).allow("").optional(),
  state: Joi.string().trim().min(2).max(100).allow("").optional(),
  pincode: pincodeField.allow("").optional(),
}).min(1);

export const changePasswordValidation = Joi.object({
  oldPassword: passwordField.required(),
  newPassword: passwordField.required(),
  confirmPassword: passwordField.required(),
});

export const forgotPasswordSendOtpValidation = Joi.object({
  email: emailField.required(),
});

export const forgotPasswordVerifyOtpValidation = Joi.object({
  email: emailField.required(),
  otp: otpField.required(),
});

export const forgotPasswordResetValidation = Joi.object({
  email: emailField.required(),
  otp: otpField.required(),
  newPassword: passwordField.required(),
  confirmPassword: passwordField.required(),
});

