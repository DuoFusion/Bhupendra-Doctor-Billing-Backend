import { Router } from "express";
import { companyController } from "../controllers";
import upload from "../helper/uploadFiles";

const router = Router();

router.post("/",upload.single("logoImage"), companyController.addNewCompany);

export default router;