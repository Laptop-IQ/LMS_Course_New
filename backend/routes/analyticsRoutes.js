import express from "express";
import { getAnalyticsOverview } from "../controllers/analyticsController.js";

const analyticsRouter = express.Router();

analyticsRouter.get("/overview", getAnalyticsOverview);

export default analyticsRouter;

