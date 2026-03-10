import express from "express";
import { dashboardController } from "../controllers";

const router = express.Router();

router.get("/stats", dashboardController.get_dashboard_stats);

export { router as dashboardRouter };
