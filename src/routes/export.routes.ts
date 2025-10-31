import { requireAdminRole } from './../global/middlewares/requireAdminRole';
import express from "express";
import { authMiddleware } from "../global/middlewares/userAuthMiddleware";
import { exportAllSurveyResponses, exportData, exportSurveyResponse, exportSurveySummary } from "../controllers/export.controller";

const router = express.Router();

router.post("/", authMiddleware, requireAdminRole, exportData);
router.get("/response/:userId/:surveyId", authMiddleware, exportSurveyResponse);
router.get("/all-responses/:surveyId", authMiddleware, exportAllSurveyResponses);
router.get("/summary/:surveyId", authMiddleware, exportSurveySummary);

export default router;