import { Request, Response } from "express";
import catchAsync from "../global/middlewares/catchAsync";
import httpStatus from "http-status";
import { ApiMessages } from "../Constants/Messages";
import { exportDataService, exportAllSurveyResponsesService, exportSurveyResponseService, exportSurveySummaryService } from "../services/export.service";
import ApiError from "../global/errors/ApiError";

export const exportData = catchAsync(async (req: Request, res: Response) => {
  const { type, tableData } = req.body;

  if (!type || !["pdf", "csv"].includes(type)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid or missing file type. Must be 'pdf' or 'csv'."
    );
  }

  if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid or missing table data. Must be a non-empty array."
    );
  }

  const { buffer, fileName } = await exportDataService(type, tableData);

  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.setHeader(
    "Content-Type",
    type === "pdf" ? "application/pdf" : "text/csv"
  );

  const MAX_EXPORT_ROWS = 10000;

  if (tableData.length > MAX_EXPORT_ROWS) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Export limited to ${MAX_EXPORT_ROWS} rows. Please filter your data.`
    );
  }

  res.status(httpStatus.OK).send(buffer);
});

// Export single user's survey response
export const exportSurveyResponse = catchAsync(async (req: Request, res: Response) => {
  const { userId, surveyId } = req.params;
  const { format } = req.query as { format: 'pdf' | 'csv' };

  if (!format || !['pdf', 'csv'].includes(format)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Format must be 'pdf' or 'csv'");
  }

  const { buffer, fileName } = await exportSurveyResponseService(userId, surveyId, format);

  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.setHeader("Content-Type", format === "pdf" ? "application/pdf" : "text/csv");
  res.status(httpStatus.OK).send(buffer);
});

// Export all responses for a survey
export const exportAllSurveyResponses = catchAsync(async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  const { format } = req.query as { format: 'pdf' | 'csv' };

  if (!format || !['pdf', 'csv'].includes(format)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Format must be 'pdf' or 'csv'");
  }

  const { buffer, fileName } = await exportAllSurveyResponsesService(surveyId, format);

  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`); // Fixed: Added backticks
  res.setHeader("Content-Type", format === "pdf" ? "application/pdf" : "text/csv");
  res.status(httpStatus.OK).send(buffer);
});

// Export survey summary/analytics
export const exportSurveySummary = catchAsync(async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  const { format } = req.query as { format: 'pdf' | 'csv' };

  if (!format || !['pdf', 'csv'].includes(format)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Format must be 'pdf' or 'csv'");
  }

  const { buffer, fileName } = await exportSurveySummaryService(surveyId, format);

  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.setHeader("Content-Type", format === "pdf" ? "application/pdf" : "text/csv");
  res.status(httpStatus.OK).send(buffer);
});