import mongoose from "mongoose";
import { modelName } from "../common";

const companySchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: modelName.authModelName,
    
  },

  companyName: { type: String,  },
  gstNumber: { type: String,  },
  phone: { type: String,  },
  email: { type: String,  },
  address: { type: String,  },
  city: { type: String,  },
  state: { type: String,  },
  pincode: { type: Number,  },
  logoImage: { type: String },
  isDeleted: { type: Boolean, default: false }

}, { timestamps: true, versionKey: false });

export const Company_Collection = mongoose.model(
  modelName.companyModelName,
  companySchema
);


