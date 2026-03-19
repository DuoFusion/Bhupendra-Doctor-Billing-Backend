import express from "express";
import { financialController } from "../controllers";

const router = express.Router();

router.post("/add", financialController.add_financial);
router.put("/:id", financialController.update_financial_by_id);
router.patch("/:id/status", financialController.toggle_financial_active_status);
router.delete("/delete/:id", financialController.delete_financial_by_id);
router.get("/all", financialController.get_all_financial);
router.get("/get/my-financial", financialController.get_my_financial);
router.get("/:id", financialController.get_financial_by_id);

export const financialRouter = router;
