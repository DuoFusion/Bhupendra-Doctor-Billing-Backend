import express from "express"
import { companyController } from "../controllers"
import upload from "../helper/uploadFiles";
import { verifyToken } from "../middleware";

const router = express.Router()

router.get("/get/company" , verifyToken,   companyController.getAllCompanies);
router.post("/addNew/company" , verifyToken , upload.single("logoImage"), companyController.addNewCompany)
router.get("/getById/company/:id", verifyToken, companyController.getCompanyById);
router.put("/update/company/:id" , verifyToken ,upload.single("logoImage"), companyController.updateCompany)
router.delete("/delete/company/:id" , verifyToken , companyController.deleteCompany)

export default router