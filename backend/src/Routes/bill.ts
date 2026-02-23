import express from "express";
import { billController } from "../controllers";
import { verifyToken } from "../middleware";

const router = express.Router();

router.get("/get/bills", verifyToken ,  billController.getAllBills);
router.get("/get/bill/:id", verifyToken ,  billController.getBillById);
router.post("/add/bill",  verifyToken , billController.addBill);
router.put("/update/bill/:id",  verifyToken , billController.updateBill);
router.delete("/delete/bill/:id", verifyToken ,  billController.deleteBill);

export default router;