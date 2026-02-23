import express from "express";
import authRouter from "./auth"
import companyRouter from "./company"
import userRouter from "./user"
import productRouter from "./product"
import billRouter from "./bill"
import categoryRouter from "./category"
import path from "path";

const router = express.Router();

router.use("/", authRouter);
router.use("/", companyRouter);
router.use("/", userRouter);
router.use("/" , productRouter)
router.use("/" , billRouter)
router.use("/" , categoryRouter)
router.use("/upload", express.static(path.join(process.cwd(), "upload"))); 

export { router };