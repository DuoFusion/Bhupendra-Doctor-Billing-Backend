import { billModel, productModel } from "../../model";
import { responseMessage, status_code } from "../../common";
import mongoose from "mongoose";
import { billValidation, joiValidationOptions } from "../../validation";

const toPositiveInt = (value: any, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

// ================= Get All Bills (Admin + User Based) =================
export const getAllBills = async (req, res) => {
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
      query.$or = [{ billNumber: regex }, { billStatus: regex }, { paymentMethod: regex }];
    }

    const total = await billModel.Bill_Collection.countDocuments(query);
    let billQuery = billModel.Bill_Collection.find(query)
      .populate("user", "name email phone address city state pincode")
      .populate(
        "items.product",
        "productName category hsnCode batch expiry gstPercent mrp sellingPrice company"
      )
      .populate(
        "items.company"," companyName gstNumber phone email address city state pincode  logoImage" )
      .sort({ [sortBy]: order });
    if (hasPagination) {
      billQuery = billQuery.skip((page - 1) * limit).limit(limit);
    }
    const bills = await billQuery;

    res.status(status_code.SUCCESS).json({
      status: true,
      message: responseMessage.allBillsGet_success,
      bills,
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
      message: error.message,
    });
  }
};


// ================= Get Single Bill =================
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(status_code.BAD_REQUEST).json({
        status: false,
        message: responseMessage.invalidBillId,
      });

    const bill = await billModel.Bill_Collection.findById(id)
      .populate("user", "name email phone address city state pincode")
      .populate("items.product", "productName category hsnCode batch expiry gstPercent mrp sellingPrice company")
      .populate("items.company"," companyName gstNumber phone email address city state pincode  logoImage" )

    if (!bill)
      return res.status(status_code.NOT_FOUND).json({
        status: false,
        message: responseMessage.billNotFound,
      });

    res.status(status_code.SUCCESS).json({
      status: true,
      message: responseMessage.billGet_success.replace("{billNumber}", bill.billNumber),
      bill,
    });
  } catch (error) {
    res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: responseMessage.billGet_failed,
      error: error.message,
    });
  }
};

// ================= Add New Bill =================
export const addBill = async (req, res) => {
  const { error, value } = billValidation.addBillValidation.validate(req.body, joiValidationOptions);
  if (error) {
    return res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: error.details[0].message,
    });
  }

  try {
    const { user, billStatus, items, paymentMethod, discount = 0 } = value;

    let srNo = 1;
    let subTotal = 0;
    let totalGST = 0;
    const processedItems = [];

    for (let item of items) {
      const product = await productModel.Product_Collection.findById(item.product);
      if (!product)
        return res.status(status_code.NOT_FOUND).json({
          status: false,
          message: `Product not found: ${item.product}`,
        });

      const qty = Number(item.qty) || 0;
      const freeQty = Number(item.freeQty) || 0;
      const itemDiscount = Number(item.discount) || 0;

      const rate = Number(product.sellingPrice) || 0;
      const total = rate * qty - itemDiscount;
      const gstAmount = (total * Number(product.gstPercent)) / 100;

      processedItems.push({
        srNo: srNo++,
        product: product._id,
        productName: product.productName,
        category: product.category,
        hsnCode: product.hsnCode,
        qty,
        freeQty,
        mrp: product.mrp,
        rate,
        batch: product.batch || "",
        expiry: product.expiry || "",
        gstPercent: product.gstPercent,
        gstAmount,
        total,
        discount: itemDiscount,
        sgst: gstAmount / 2,
        cgst: gstAmount / 2,
        company: product.company,
      });

      subTotal += total;
      totalGST += gstAmount;
    }

    const grandTotal = subTotal + totalGST - Number(discount);
    const billNumber = `BILL-${Date.now()}`;

    const newBill = await billModel.Bill_Collection.create({
      billNumber,
      user,
      items: processedItems,
      subTotal,
      totalGST,
      discount,
      grandTotal,
      billStatus,
      paymentMethod,
    });

    res.status(status_code.SUCCESS).json({
      status: true,
      message: responseMessage.billAdd_success.replace("{billNumber}", billNumber),
      bill: newBill,
    });
  } catch (error) {
    res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: responseMessage.billAdd_failed,
      error: error.message,
    });
  }
};


// ================= Update Bill =================
export const updateBill = async (req, res) => {
  const { error, value } = billValidation.updateBillValidation.validate(req.body, joiValidationOptions);
  if (error) {
    return res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: error.details[0].message,
    });
  }

  try {
    const { id } = req.params;
    const { user ,billStatus ,items, paymentMethod, discount = 0 } = value;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(status_code.BAD_REQUEST).json({
        status: false,
        message: responseMessage.invalidBillId,
      });
    }

    const existingBill = await billModel.Bill_Collection.findById(id);
    if (!existingBill || existingBill.isDeleted) {
      return res.status(status_code.NOT_FOUND).json({
        status: false,
        message: responseMessage.billNotFound,
      });
    }

    let srNo = 1;
    let subTotal = 0;
    let totalGST = 0;
    const processedItems = [];

    for (let item of items) {
      const product = await productModel.Product_Collection.findById(item.product);
      if (!product) {
        return res.status(status_code.NOT_FOUND).json({
          status: false,
          message: `Product not found: ${item.product}`,
        });
      }

      const qty = Number(item.qty) || 0;
      const freeQty = Number(item.freeQty) || 0;
      const itemDiscount = Number(item.discount) || 0;

      const rate = Number(product.sellingPrice) || 0;
      const total = rate * qty - itemDiscount;
      const gstAmount = (total * Number(product.gstPercent)) / 100;

      processedItems.push({
        srNo: srNo++,
        product: product._id,
        productName: product.productName,
        category: product.category,
        hsnCode: product.hsnCode,
        qty,
        freeQty,
        mrp: product.mrp,
        rate,
        batch: product.batch || "",
        expiry: product.expiry || "",
        gstPercent: product.gstPercent,
        gstAmount,
        total,
        discount: itemDiscount,
        sgst: gstAmount / 2,
        cgst: gstAmount / 2,
        company: product.company,
      });

      subTotal += total;
      totalGST += gstAmount;
    }

    const grandTotal = subTotal + totalGST - Number(discount);

    const updatedBill = await billModel.Bill_Collection.findByIdAndUpdate(
      id,
      {
        user,
        items: processedItems,
        subTotal,
        totalGST,
        discount,
        grandTotal,
        billStatus,
        paymentMethod,
      },
      { new: true }
    );

    res.status(status_code.SUCCESS).json({
      status: true,
      message: responseMessage.billUpdate_success.replace(
        "{billNumber}",
        updatedBill.billNumber
      ),
      bill: updatedBill,
    });

  } catch (error) {
    res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: responseMessage.billUpdate_failed,
      error: error.message,
    });
  }
};



// ================= Delete Bill (Soft Delete) =================
export const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(status_code.BAD_REQUEST).json({
        status: false,
        message: responseMessage.invalidBillId,
      });

    const bill = await billModel.Bill_Collection.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!bill)
      return res.status(status_code.NOT_FOUND).json({
        status: false,
        message: responseMessage.billNotFound,
      });

    res.status(status_code.SUCCESS).json({
      status: true,
      message: responseMessage.billDelete_success.replace("{billNumber}", bill.billNumber),
      bill,
    });
  } catch (error) {
    res.status(status_code.BAD_REQUEST).json({
      status: false,
      message: responseMessage.billDelete_failed,
      error: error.message,
    });
  }
};
