import express from "express";
import { authController } from "../controllers";
import { verifyToken } from "../middleware";
import { authModel } from "../model";

const router = express.Router();

router.post("/signup" , authController.signUp);
router.post("/signin" , authController.signIn);
router.post("/signout" , authController.signout);
router.post("/otp/verify" , authController.verifyOTP)
router.post("/forgot-password/send-otp", authController.sendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", authController.verifyForgotPasswordOtp);
router.put("/forgot-password/reset-password", authController.resetForgotPassword);


router.get("/me" , verifyToken , async (req , res)=>{
    try {
        const tokenUser = (req as any).user;
        const dbUser = await authModel.Auth_Collection.findById(tokenUser?._id).select("-password");

        res.json({
            status : true,
            user : dbUser || tokenUser
        });
    } catch (error) {
        res.json({
            status : true,
            user : (req as any).user
        });
    }
})

router.put("/profile/update", verifyToken, authController.updateProfile);
router.put("/password/change", verifyToken, authController.changePassword);

export default router;
