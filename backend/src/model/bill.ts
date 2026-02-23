import mongoose from "mongoose";
import { modelName } from "../common";
import { BILL_STATUS, PAYMENT_METHOD } from "../common/enum";
import bodyParser from "body-parser";

// Bill Item Schema
const billItemSchema = new mongoose.Schema({
  srNo: { type: Number,  },            
  product: {                                         
    type: mongoose.Schema.Types.ObjectId,
    ref: modelName.productModelName,
  },
  productName: { type: String,  },
  category: { type: String,  },
  hsnCode: { type: String,  },
  qty: { type: Number,  },
  freeQty: { type: Number, default: 0 },
  mrp: { type: Number,  },
  rate: { type: Number,  },            
  batch: { type: String },                        
  expiry: { type: String },                       
  gstPercent: { type: Number,  },
  gstAmount: { type: Number,  },
  total: { type: Number,  },         
  discount: { type: Number, default: 0 },          
  sgst: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  company: {                                       
    type: mongoose.Schema.Types.ObjectId,
    ref: modelName.companyModelName,
  },
}, { _id: false });


// Bill Schema
const billSchema = new mongoose.Schema({
  billNumber: { type: String, unique: true }, 

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: modelName.authModelName,
  },

  items: [billItemSchema],

  subTotal: { type: Number,  },    
  totalGST: { type: Number,  },
  discount: { type: Number, default: 0 },        
  grandTotal: { type: Number,  },   

  paymentMethod: {
    type: String,
    enum: Object.values(PAYMENT_METHOD),
  },

  billStatus: {
    type: String,
    enum: Object.values(BILL_STATUS),
    default: BILL_STATUS.paid,
  },

  isDeleted : {type : Boolean , default : false}

}, { timestamps: true, versionKey: false });


export const Bill_Collection = mongoose.model(modelName.billModelName, billSchema);


