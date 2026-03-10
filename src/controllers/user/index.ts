import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { responseMessage, ROLES, status_code } from "../../common";
import { userModel } from "../../database";
import { reqInfo, sendError, sendSuccess } from "../../helper";
import { joiValidationOptions } from "../../validation";
import { addUserValidation, userValidaiton, toggleUserStatusValidation } from "../../validation/user";
import { getData, getFirstMatch, countData, createData, updateData } from "../../helper/database_service";

const ObjectId = mongoose.Types.ObjectId;

// ================= Add New User =================
export const add_user = async (req, res) => {
  reqInfo(req)
  try {
    const { error, value } = addUserValidation.validate(req.body, joiValidationOptions)
    if (error) return sendError(res, status_code.BAD_REQUEST, error.details[0].message)

    const exists = await getFirstMatch(userModel, { email: value.email, isDeleted: false })
    if (exists) return sendError(res, status_code.BAD_REQUEST, responseMessage.dataAlreadyExist("user"))

    const hashedPassword = await bcrypt.hash(value.password, 10)
    value.password = hashedPassword

    const response = await createData(userModel, value)
    return sendSuccess(res, response, responseMessage.addDataSuccess("user"))
  } catch (err) {
    return sendError(res, status_code.BAD_REQUEST, "Failed to add user", err)
  }
};

// ================= Update User =================
export const update_user_by_id = async (req, res) => {
  reqInfo(req)
  try {
    const { id } = req.params
    const { error, value } = userValidaiton.validate(req.body, joiValidationOptions)
    if (error) return sendError(res, status_code.BAD_REQUEST, error.details[0].message)
    if (!ObjectId.isValid(id)) return sendError(res, status_code.BAD_REQUEST, responseMessage.invalidId("user id"))

    const response = await updateData(userModel, { _id: id, isDeleted: false }, value, { new: true, select: "-password" })

    if (!response) return sendError(res, status_code.NOT_FOUND, responseMessage.getDataNotFound("user"))
    return sendSuccess(res, response, responseMessage.updateDataSuccess("user"))
  } catch (err) {
    return sendError(res, status_code.BAD_REQUEST, "Failed to update user", err)
  }
};

// ================= Delete User =================
export const delete_user_by_id = async (req, res) => {
  reqInfo(req)
  try {
    const { id } = req.params
    if (!ObjectId.isValid(id)) return sendError(res, status_code.BAD_REQUEST, responseMessage.invalidId("user id"))

    const response = await updateData(userModel, { _id: id, isDeleted: false }, { isDeleted: true }, { new: true })
    if (!response) return sendError(res, status_code.NOT_FOUND, responseMessage.getDataNotFound("user"))
    return sendSuccess(res, response, responseMessage.deleteDataSuccess("user"))
  } catch (err) {
    return sendError(res, status_code.BAD_REQUEST, "Failed to delete user", err)
  }
};

// ================= Get All Users =================
export const get_all_user = async (req, res) => {
  reqInfo(req)
  try {
    const { page, limit, search, isActive } = req.query
    const pageNo = parseInt(page as string) || 1
    const limitNo = parseInt(limit as string) || 10
    const query: any = { isDeleted: false, role: { $ne: ROLES.admin } }

    if (search) query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    if (isActive !== undefined) query.isActive = String(isActive) === "true"

    const total = await countData(userModel, query)
    const users = await getData(userModel, query, "-password", { sort: { createdAt: -1 }, skip: (pageNo - 1) * limitNo, limit: limitNo })

    return sendSuccess(res, {
      users,
      pagination: {
        page: pageNo,
        limit: limitNo,
        total,
        totalPages: Math.ceil(total / limitNo)
      },
    }, responseMessage.getDataSuccess("users"))
  } catch (err) {
    return sendError(res, status_code.BAD_REQUEST, "Failed to fetch users", err)
  }
};

// ================= Get User By Id =================
export const get_user_by_id = async (req, res) => {
  reqInfo(req)
  try {
    const { id } = req.params
    if (!ObjectId.isValid(id)) return sendError(res, status_code.BAD_REQUEST, responseMessage.invalidId("user id"))

    const response = await getFirstMatch(userModel, { _id: id, isDeleted: false }, "-password")
    if (!response) return sendError(res, status_code.NOT_FOUND, responseMessage.getDataNotFound("user"))
    return sendSuccess(res, response, responseMessage.getDataSuccess("user"))
  } catch (err) {
    return sendError(res, status_code.BAD_REQUEST, "Failed to fetch user", err)
  }
};

// ================= Toggle User Status =================
export const toggle_user_active_status = async (req, res) => {
  reqInfo(req)
  try {
    const { id } = req.params
    const { error, value } = toggleUserStatusValidation.validate(req.body, joiValidationOptions)
    if (error) return sendError(res, status_code.BAD_REQUEST, error.details[0].message)
    if (!ObjectId.isValid(id)) return sendError(res, status_code.BAD_REQUEST, responseMessage.invalidId("user id"))

    const response = await updateData(userModel, { _id: id, isDeleted: false }, { isActive: value.isActive }, { new: true, select: "-password" })
    if (!response) return sendError(res, status_code.NOT_FOUND, responseMessage.getDataNotFound("user"))
    return sendSuccess(res, response, "User status updated")
  } catch (err) {
    return sendError(res, status_code.BAD_REQUEST, "Failed to update status", err)
  }
};
