"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportSurveySummary = exports.exportAllSurveyResponses = exports.exportSurveyResponse = exports.exportData = void 0;
const catchAsync_1 = __importDefault(require("../global/middlewares/catchAsync"));
const http_status_1 = __importDefault(require("http-status"));
const export_service_1 = require("../services/export.service");
const ApiError_1 = __importDefault(require("../global/errors/ApiError"));
exports.exportData = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, tableData } = req.body;
    if (!type || !["pdf", "csv"].includes(type)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or missing file type. Must be 'pdf' or 'csv'.");
    }
    if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or missing table data. Must be a non-empty array.");
    }
    const { buffer, fileName } = yield (0, export_service_1.exportDataService)(type, tableData);
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", type === "pdf" ? "application/pdf" : "text/csv");
    const MAX_EXPORT_ROWS = 10000;
    if (tableData.length > MAX_EXPORT_ROWS) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, `Export limited to ${MAX_EXPORT_ROWS} rows. Please filter your data.`);
    }
    res.status(http_status_1.default.OK).send(buffer);
}));
// Export single user's survey response
exports.exportSurveyResponse = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, surveyId } = req.params;
    const { format } = req.query;
    if (!format || !['pdf', 'csv'].includes(format)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Format must be 'pdf' or 'csv'");
    }
    const scope = {
        role: req.user.role,
        adminCountry: req.user.country,
    };
    const { buffer, fileName } = yield (0, export_service_1.exportSurveyResponseService)(userId, surveyId, format, scope);
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", format === "pdf" ? "application/pdf" : "text/csv");
    res.status(http_status_1.default.OK).send(buffer);
}));
// Export all responses for a survey
exports.exportAllSurveyResponses = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { surveyId } = req.params;
    const { format } = req.query;
    if (!format || !['pdf', 'csv'].includes(format)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Format must be 'pdf' or 'csv'");
    }
    const scope = {
        role: req.user.role,
        adminCountry: req.user.country,
    };
    const { buffer, fileName } = yield (0, export_service_1.exportAllSurveyResponsesService)(surveyId, format, scope);
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`); // Fixed: Added backticks
    res.setHeader("Content-Type", format === "pdf" ? "application/pdf" : "text/csv");
    res.status(http_status_1.default.OK).send(buffer);
}));
// Export survey summary/analytics
exports.exportSurveySummary = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { surveyId } = req.params;
    const { format } = req.query;
    if (!format || !['pdf', 'csv'].includes(format)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Format must be 'pdf' or 'csv'");
    }
    const scope = {
        role: req.user.role,
        adminCountry: req.user.country,
    };
    const { buffer, fileName } = yield (0, export_service_1.exportSurveySummaryService)(surveyId, format, scope);
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", format === "pdf" ? "application/pdf" : "text/csv");
    res.status(http_status_1.default.OK).send(buffer);
}));
