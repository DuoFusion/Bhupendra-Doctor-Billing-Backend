import express from "express"
import { userController } from "../controllers"

const router = express.Router()

router.get("/get/users" , userController.getAllUsers)
router.get("/users/:id", userController.getUserById); 
router.put("/update/user/:id" , userController.updateUser)
router.delete("/delete/user/:id" , userController.deleteUser)

export default router