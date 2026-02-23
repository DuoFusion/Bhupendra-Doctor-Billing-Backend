import express from "express"
import { productController } from "../controllers"
import { verifyToken } from "../middleware"

const router = express.Router()

router.get("/get/products" ,  verifyToken , productController.getAllProducts)
router.post("/addNew/product" , verifyToken ,  productController.addNewProduct)
router.get("/get/my-products",  verifyToken , productController.getMyProducts);
router.get("/getById/product/:id", verifyToken, productController.getProductById);
router.put("/update/product/:id" , verifyToken ,  productController.updateProduct)
router.delete("/delete/product/:id" , verifyToken ,  productController.deleteProduct)

export default router