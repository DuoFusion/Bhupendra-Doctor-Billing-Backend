import mongoose from "mongoose";
import { FINANCIAL_TYPE, modelName } from "../../common";

const financialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(FINANCIAL_TYPE), default: FINANCIAL_TYPE.income },
    from: { type: String, default: "" },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    description: { type: String, default: "" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: modelName.userModelName },
    medicalStoreId: { type: mongoose.Schema.Types.ObjectId, ref: modelName.storeModelName },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export const financialModel = mongoose.model(modelName.financialModelName, financialSchema);
