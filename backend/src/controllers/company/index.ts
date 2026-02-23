import fs from "fs";
import path from "path";
import { companyModel } from "../../model";
import { companyValidation, joiValidationOptions } from "../../validation";
import { responseMessage, status_code } from "../../common";

const uploadDir = path.join(process.cwd(), "upload");
const toPositiveInt = (value: any, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};


// ================= Add New Company =================
export const addNewCompany = async (req, res) => {

  const { error, value } = companyValidation.companyDataValidation.validate(req.body, joiValidationOptions);
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details[0].message
    });
  }

  try {
    const logoImage = req.file ? req.file.filename : null;

    const result = await companyModel.Company_Collection.create({
      user: req.user._id,
      ...value,
      logoImage
    });

    res.status(status_code.SUCCESS).json({
      status: true,
      message: responseMessage.newCompanyAdded_success,
      result
    });

  } catch (error) {
    res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: responseMessage.newCompanyAdded_failed,
      error: error.message
    });
  }
};


// ================= Get All Companies (Admin + User Based) =================
export const getAllCompanies = async (req, res) => {

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
      query.$or = [
        { companyName: regex },
        { gstNumber: regex },
        { phone: regex },
        { email: regex },
        { city: regex },
        { state: regex },
      ];
    }

    const total = await companyModel.Company_Collection.countDocuments(query);
    let companyQuery = companyModel.Company_Collection.find(query)
      .populate("user")
      .sort({ [sortBy]: order });
    if (hasPagination) {
      companyQuery = companyQuery.skip((page - 1) * limit).limit(limit);
    }
    const companies = await companyQuery;

    res.status(status_code.SUCCESS).json({
      status: true,
      companies,
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
      message: error.message
    });
  }
};


// ================= Get Company by ID =================
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    let company;

    if (req.user.role === "admin") {
      company = await companyModel.Company_Collection.findById(id);
    } else {
      company = await companyModel.Company_Collection.findOne({
        _id: id,
        user: req.user._id
      });
    }

    if (!company) {
      return res.status(404).json({
        status: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      status: true,
      company,
    });

  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};



// ================= Update Company =================
export const updateCompany = async (req, res) => {

  const { error, value } = companyValidation.companyUpdateDataValidation.validate(req.body, joiValidationOptions);
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details[0].message
    });
  }

  try {
    const { id } = req.params;

    let company;

    if (req.user.role === "admin") {
      company = await companyModel.Company_Collection.findById(id);
    } else {
      company = await companyModel.Company_Collection.findOne({
        _id: id,
        user: req.user._id
      });
    }

    if (!company) {
      return res.status(status_code.NOT_FOUND).json({
        status: false,
        message: "Company not found"
      });
    }

    if (req.file) {
      if (company.logoImage) {
        const oldPath = path.join(uploadDir, company.logoImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      company.logoImage = req.file.filename;
    }

    Object.assign(company, value);

    const result = await company.save();

    res.status(status_code.SUCCESS).json({
      status: true,
      message: responseMessage.companyUpdate_success,
      result
    });

  } catch (error) {
    res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: responseMessage.companyUpdate_failed,
      error: error.message
    });
  }
};


// ================= Delete Company (Soft Delete) =================
export const deleteCompany = async (req, res) => {

  try {
    const { id } = req.params;

    let company;

    if (req.user.role === "admin") {
      company = await companyModel.Company_Collection.findById(id);
    } else {
      company = await companyModel.Company_Collection.findOne({
        _id: id,
        user: req.user._id
      });
    }

    if (!company) {
      return res.status(status_code.NOT_FOUND).json({
        status: false,
        message: "Company not found"
      });
    }

    company.isDeleted = true;
    await company.save();

    res.status(status_code.SUCCESS).json({
      status: true,
      message: responseMessage.companyDeleted_success
    });

  } catch (error) {
    res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: responseMessage.companyDeleted_failed,
      error: error.message
    });
  }
};
