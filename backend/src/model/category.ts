import mongoose from "mongoose";
import { modelName } from "../common";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: modelName.authModelName},
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const CategoryModel = mongoose.model(modelName.categoryModelName, categorySchema);
