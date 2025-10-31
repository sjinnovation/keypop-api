"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const requireAdminRole_1 = require("./../global/middlewares/requireAdminRole");
const express_1 = __importDefault(require("express"));
const userAuthMiddleware_1 = require("../global/middlewares/userAuthMiddleware");
const export_controller_1 = require("../controllers/export.controller");
const router = express_1.default.Router();
router.post("/", userAuthMiddleware_1.authMiddleware, requireAdminRole_1.requireAdminRole, export_controller_1.exportData);
router.get("/response/:userId/:surveyId", userAuthMiddleware_1.authMiddleware, export_controller_1.exportSurveyResponse);
router.get("/all-responses/:surveyId", userAuthMiddleware_1.authMiddleware, export_controller_1.exportAllSurveyResponses);
router.get("/summary/:surveyId", userAuthMiddleware_1.authMiddleware, export_controller_1.exportSurveySummary);
exports.default = router;
