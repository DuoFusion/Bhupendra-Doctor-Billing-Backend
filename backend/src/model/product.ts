import mongoose from "mongoose";
import { modelName, STOCK_STATUS } from "../common";

const productSchema = new mongoose.Schema(
  {
    productName: { type: String,  trim: true },
    company: {type: mongoose.Schema.Types.ObjectId,ref: modelName.companyModelName,},
    user : {type : mongoose.Schema.Types.ObjectId , ref : modelName.authModelName , required : true},
    category: {type: String},
    hsnCode: { type: String,  },
    mrp: { type: Number,  },
    purchasePrice: { type: Number,  },
    sellingPrice: { type: Number,  },
    gstPercent: { type: Number,  },
    stock: { type: Number,  default: 0 },
    minStock: { type: Number,  default: 10 },
    stockStatus: {type: String,enum: Object.values(STOCK_STATUS),default: STOCK_STATUS.inStock,},
    description: { type: String },
    batch: { type: String,  },
    expiry: { type: String , required : true},    
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false });

export const Product_Collection = mongoose.model(modelName.productModelName,productSchema);


