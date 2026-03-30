import { Request, Response } from "express";
import catchAsync from "../global/middlewares/catchAsync";
import sendResponse from "../global/middlewares/sendResponse";
import httpStatus from "http-status";
import { ApiMessages } from "../Constants/Messages";
import {
    addSurveyService,
    getAllSurveysService,
    getSurveyByIdService,
    updateSurveyStatusService,
    deleteSurveyService,
    updateSurveyService,
    getSurveyByCountryService,
    submitSurveyResponseService,
    getUserSurveyProgressService,
    updateUserSurveyProgressService,
    getUserCountrySurveyService,
    getUserSurveyResponseService,
    getAllUserSurveyResponsesService,
    listAdminSurveyResponsesService
} from "../services/survey.service";
import { validateSurveyQuestions } from "../Utils/validateSurveyQuestion";
import ApiError from "../global/errors/ApiError";
import { sendSurveyCompletionEmail } from "../Utils/emailServices";

// Add a new survey
export const addSurvey = catchAsync(async (req: Request, res: Response) => {
    const surveyData = req.body;
    if (surveyData.questions) validateSurveyQuestions(surveyData.questions);

    const survey = await addSurveyService(surveyData);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: ApiMessages.SURVEY_ADDED,
        data: survey,
    });
});

// Get all surveys
export const getAllSurveys = catchAsync(async (req: Request, res: Response) => {
    const surveys = await getAllSurveysService();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ApiMessages.SURVEYS_FETCHED,
        data: surveys,
    });
});

// Get survey by ID
export const getSurveyById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { user } = req; // Get user from auth middleware
    
    const survey = await getSurveyByIdService(id, user?.keyPopulation);
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Survey fetched successfully",
      data: survey,
    });
  });

// Update survey status
export const updateSurveyStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedSurvey = await updateSurveyStatusService(id, isActive);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ApiMessages.SURVEY_STATUS_UPDATED,
        data: updatedSurvey,
    });
});

// Delete survey
export const deleteSurvey = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const survey = await deleteSurveyService(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ApiMessages.SURVEY_DELETED,
        data: survey,
    });
});

// Update survey
export const updateSurvey = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const surveyData = req.body;
    if (surveyData.questions) validateSurveyQuestions(surveyData.questions);

    const updatedSurvey = await updateSurveyService(id, surveyData);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ApiMessages.SURVEY_UPDATED,
        data: updatedSurvey,
    });
});

// Get survey by country
export const getSurveyByCountry = catchAsync(async (req: Request, res: Response) => {
    const { country } = req.params;
    const survey = await getSurveyByCountryService(country);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ApiMessages.SURVEY_FETCHED,
        data: survey,
    });
});

// Submit survey response
export const submitSurveyResponse = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;
    const responseData = req.body;

      try {
        await sendSurveyCompletionEmail(user.email, user.name, responseData.title);
      } catch (emailError) {
        console.error('Failed to send survey completion email:', emailError);
      }

    const result = await submitSurveyResponseService(user.id, responseData);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ApiMessages.SURVEY_SUBMITTED,
        data: result,
    });
});

// Get user's survey progress
export const getUserSurveyProgress = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;
    const progress = await getUserSurveyProgressService(user.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ApiMessages.SURVEY_PROGRESS_FETCHED,
        data: progress,
    });
});

// Update user's survey progress by section
export const updateUserSurveyProgress = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;
    const { surveyId, answers } = req.body;
    // Validate required fields
    if (!surveyId || !answers || !Array.isArray(answers)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "surveyId and answers array are required");
    }
    const fixedAnswers = answers.map(answer => {
        if (answer.categoryCode && answer.categoryCode.match(/^\d+\.\d{2,}$/)) {
            answer.categoryCode = answer.code.split('.').slice(0, 2).join('.');
        }
        return answer;
    });
    const result = await updateUserSurveyProgressService(user.id, {
        surveyId,
        answers: fixedAnswers
    });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Survey progress saved successfully",
        data: result,
    });
});

// Get survey by user's country (from auth token)
export const getUserCountrySurvey = catchAsync(async (req: Request, res: Response) => {
    const userCountry = req.user?.country;
    if (!userCountry) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User country not provided in token");
    }
    const { user } = req;
    const survey = await getUserCountrySurveyService(user.id, userCountry);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: ApiMessages.SURVEY_FETCHED,
        data: survey,
    });
});

// Get user's specific survey response
export const getUserSurveyResponse = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;
    const { surveyId } = req.params;
    
    const response = await getUserSurveyResponseService(user.id, surveyId);
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Survey response fetched successfully",
      data: response,
    });
  });

  // Get all user's submitted survey responses
export const getAllUserSurveyResponses = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;
    const { page = 1, limit = 10, status } = req.query;
    
    const responses = await getAllUserSurveyResponsesService(user.id, {
      page: Number(page),
      limit: Number(limit),
      status: status as string
    });
    
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Survey responses fetched successfully",
      data: responses,
    });
  });

/** Superadmin & admin: all responses. Community admin: same `User.country` as respondents. */
export const listAdminSurveyResponses = catchAsync(async (req: Request, res: Response) => {
  const { user } = req;
  const { page = 1, limit = 20, status, surveyId } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const rawLimit = Number(limit) || 20;
  const limitNum = Math.min(100, Math.max(1, rawLimit));

  const data = await listAdminSurveyResponsesService(user.role, user.country, {
    surveyId: typeof surveyId === "string" && surveyId.trim() ? surveyId.trim() : undefined,
    page: pageNum,
    limit: limitNum,
    status: typeof status === "string" ? status : undefined,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ApiMessages.SURVEY_RESPONSES_FETCHED,
    data,
  });
});