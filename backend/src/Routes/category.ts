import express from "express";
import { categoryController } from "../controllers";
import { verifyToken } from "../middleware";

const router = express.Router();

router.get("/get/categories", verifyToken, categoryController.getCategories);
router.post("/add/category", verifyToken, categoryController.addCategory);
router.put("/update/category", verifyToken, categoryController.updateCategory);
router.delete("/delete/category", verifyToken, categoryController.deleteCategory);

export default router;