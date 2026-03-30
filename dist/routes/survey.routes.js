"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuthMiddleware_1 = require("../global/middlewares/userAuthMiddleware");
const requireAdminRole_1 = require("../global/middlewares/requireAdminRole");
const survey_controller_1 = require("../controllers/survey.controller");
const router = express_1.default.Router();
// Admin-only routes
router.post("/", userAuthMiddleware_1.authMiddleware, requireAdminRole_1.requireAdminRole, survey_controller_1.addSurvey); // Create survey
router.get("/all", userAuthMiddleware_1.authMiddleware, requireAdminRole_1.requireAdminRole, survey_controller_1.getAllSurveys); // Get all surveys (including inactive)
router.get("/admin/responses", userAuthMiddleware_1.authMiddleware, requireAdminRole_1.requireAdminRole, survey_controller_1.listAdminSurveyResponses);
// Authenticated User Routes
router.get("/user-country", userAuthMiddleware_1.authMiddleware, survey_controller_1.getUserCountrySurvey); // Get active survey by user's country (from auth token)
router.get("/country/:country", userAuthMiddleware_1.authMiddleware, survey_controller_1.getSurveyByCountry); // Get active survey by country
router.post("/submit", userAuthMiddleware_1.authMiddleware, survey_controller_1.submitSurveyResponse); // Submit final response
router.get("/progress", userAuthMiddleware_1.authMiddleware, survey_controller_1.getUserSurveyProgress); // Get user's current progress
router.put("/progress", userAuthMiddleware_1.authMiddleware, survey_controller_1.updateUserSurveyProgress); // Update/save progress (by section)
router.get("/responses", userAuthMiddleware_1.authMiddleware, survey_controller_1.getAllUserSurveyResponses); // Get all responses
router.get("/response/:surveyId", userAuthMiddleware_1.authMiddleware, survey_controller_1.getUserSurveyResponse); // Get specific response
// Admin Routes for Survey Management
router.get("/:id", userAuthMiddleware_1.authMiddleware, survey_controller_1.getSurveyById); // Get survey by ID
router.put("/:id", userAuthMiddleware_1.authMiddleware, requireAdminRole_1.requireAdminRole, survey_controller_1.updateSurvey); // Update survey
router.delete("/:id", userAuthMiddleware_1.authMiddleware, requireAdminRole_1.requireAdminRole, survey_controller_1.deleteSurvey); // Delete survey
exports.default = router;
