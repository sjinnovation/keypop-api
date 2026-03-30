import express from "express";
import { authMiddleware } from "../global/middlewares/userAuthMiddleware";
import { requireAdminRole } from "../global/middlewares/requireAdminRole";
import {
    addSurvey,
    getAllSurveys,
    getSurveyById,
    updateSurvey,
    deleteSurvey,
    getSurveyByCountry,
    submitSurveyResponse,
    getUserSurveyProgress,
    updateUserSurveyProgress,
    getUserCountrySurvey,
    getAllUserSurveyResponses,
    getUserSurveyResponse,
    listAdminSurveyResponses,
    getAdminSurveyResponseById,
    deleteAdminSurveyResponse,
    deleteOwnSurveyResponse,
} from "../controllers/survey.controller";

const router = express.Router();

// Admin-only routes
router.post("/", authMiddleware, requireAdminRole, addSurvey);             // Create survey
router.get("/all", authMiddleware, requireAdminRole, getAllSurveys);       // Get all surveys (including inactive)
router.get("/admin/responses", authMiddleware, requireAdminRole, listAdminSurveyResponses);
router.get("/admin/responses/:responseId", authMiddleware, requireAdminRole, getAdminSurveyResponseById);
router.delete("/admin/responses/:responseId", authMiddleware, requireAdminRole, deleteAdminSurveyResponse);

// Authenticated User Routes
router.get("/user-country", authMiddleware, getUserCountrySurvey);          // Get active survey by user's country (from auth token)
router.get("/country/:country", authMiddleware, getSurveyByCountry);       // Get active survey by country
router.post("/submit", authMiddleware, submitSurveyResponse);              // Submit final response
router.get("/progress", authMiddleware, getUserSurveyProgress);            // Get user's current progress
router.put("/progress", authMiddleware, updateUserSurveyProgress);         // Update/save progress (by section)

router.get("/responses", authMiddleware, getAllUserSurveyResponses); // Get all responses
router.get("/response/:surveyId", authMiddleware, getUserSurveyResponse); // Get specific response
router.delete("/response/:surveyId", authMiddleware, deleteOwnSurveyResponse); // Delete own submitted response

// Admin Routes for Survey Management
router.get("/:id", authMiddleware, getSurveyById);       // Get survey by ID
router.put("/:id", authMiddleware, requireAdminRole, updateSurvey);        // Update survey
router.delete("/:id", authMiddleware, requireAdminRole, deleteSurvey);     // Delete survey

export default router;
