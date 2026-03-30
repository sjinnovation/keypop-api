import mongoose from "mongoose";
import Survey from "../models/survey.model";
import Country from "../models/country.model";
import SurveyResponse from "../models/surveyResponse.model";
import UserSurveyProgress from "../models/userSurveyProgress.model";
import User, { UserRole } from "../models/user.model";
import { ApiMessages } from "../Constants/Messages";
import ApiError from "../global/errors/ApiError";
import httpStatus from "http-status";
import { validateSurveyQuestions } from "../Utils/validateSurveyQuestion";
import { isConditionMet, isValidAnswer } from "../Utils/submitSurveyValidation";
import { IAnswer } from "../models/surveyTypes.model";
import { calculateDetailedStatistics, getNextSection, getSectionsSummary, groupAnswersByCategory } from "../Utils/saveSurveyResponse";

// Create survey
export const addSurveyService = async (surveyData: any) => {
  try {
    if (Array.isArray(surveyData.questions)) {
      validateSurveyQuestions(surveyData.questions);
    }

    const survey = new Survey(surveyData);
    await survey.save();
    // If a country is specified, update its survey availability
    if (surveyData.country) {
      await Country.findByIdAndUpdate(
        surveyData.country,
        { surveyAvailable: true },
        { new: true }
      );
    }
    return survey;
  } catch (error: any) {
    throw new ApiError(error.statusCode || 500, error.message || "Error adding survey");
  }
};

// Fetch all surveys
export const getAllSurveysService = async () => {
  try {
    return await Survey.find({ isActive: true });
  } catch (error: any) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching surveys");
  }
};

// Fetch by ID with key population filtering
export const getSurveyByIdService = async (id: string, userKeyPopulations?: string[]) => {
  try {
    const survey = await Survey.findById(id);
    if (!survey) {
      throw new ApiError(httpStatus.NOT_FOUND, "Survey not found");
    }

    // If no user key populations provided, return all questions
    if (!userKeyPopulations || userKeyPopulations.length === 0) {
      return survey;
    }

    // Filter questions based on user's key populations
    const filteredQuestions = survey.questions.filter(question => {
      // If question has no specific key population requirement, include it
      if (!question.specificToKP || question.specificToKP.length === 0) {
        return true;
      }
      
      // If question is specific to key populations, check if user belongs to any of them
      return question.specificToKP.some(kp => userKeyPopulations.includes(kp));
    });

    // Return survey with filtered questions
    return {
      ...survey.toObject(),
      questions: filteredQuestions,
      totalQuestions: filteredQuestions.length,
      originalTotalQuestions: survey.questions.length
    };
  } catch (error: any) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching survey details");
  }
};

// Update survey
export const updateSurveyService = async (id: string, updateData: any) => {
  try {
    // Validate questions if present in the updateData
    if (Array.isArray(updateData.questions)) {
      validateSurveyQuestions(updateData.questions);
    }

    // Retrieve the existing survey
    const existingSurvey = await Survey.findById(id);
    if (!existingSurvey) {
      throw new ApiError(httpStatus.NOT_FOUND, "Survey not found");
    }

    // Prevent updates if finalized (example flag: isFinalized or hasResponses)
    if (existingSurvey.isFinalized || existingSurvey.hasResponses) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Cannot update a finalized or answered survey");
    }

    if (Array.isArray(updateData.questions)) {
      validateSurveyQuestions(updateData.questions);
    }

    // Capture the old country and the new country (if changed)
    const oldCountryId = (existingSurvey.country as string).toString();
    const newCountryId = updateData.country ? updateData.country.toString() : oldCountryId;

    // Update the survey with the new data
    const updatedSurvey = await Survey.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedSurvey) {
      throw new ApiError(httpStatus.NOT_FOUND, "Survey not found");
    }

    // If the country has changed, update both countries accordingly
    if (newCountryId !== oldCountryId) {
      // Update the new country to mark that a survey is available
      await Country.findByIdAndUpdate(newCountryId, { $set: { surveyAvailable: true } });

      // Check if there are any surveys remaining for the old country
      const remainingSurveys = await Survey.countDocuments({ country: oldCountryId });
      // If no surveys remain for the old country, mark surveyAvailable as false
      if (remainingSurveys === 0) {
        await Country.findByIdAndUpdate(oldCountryId, { $set: { surveyAvailable: false } });
      }
    }

    return updatedSurvey;
  } catch (error: any) {
    throw new ApiError(error.statusCode || 500, error.message || "Error updating survey");
  }
};

// Update only status
export const updateSurveyStatusService = async (id: string, isActive: boolean) => {
  return updateSurveyService(id, { isActive });
};

// Delete survey
export const deleteSurveyService = async (id: string) => {
  try {
    const survey = await Survey.findById(id);
    if (!survey) {
      throw new ApiError(httpStatus.NOT_FOUND, "Survey not found");
    }
    await survey.deleteOne();
    return survey;
  } catch (error: any) {
    throw new ApiError(error.statusCode || 500, error.message || "Error deleting survey");
  }
};

// By country
export const getSurveyByCountryService = async (country: string) => {
  try {
    const survey = await Survey
      .find({ country, isActive: true })
      .select('_id title')
      .lean();

    if (!survey) {
      throw new ApiError(httpStatus.NOT_FOUND, "Survey not found for this country");
    }
    return survey;
  } catch (error: any) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching country survey");
  }
};

// Submit survey response
export const submitSurveyResponseService = async (userId: string, responseData: any) => {
  try {
    const { surveyId, answers, skippedQuestions = [] } = responseData;

    const existing = await SurveyResponse.findOne({ userId, surveyId });
    if (existing) {
      throw new ApiError(httpStatus.CONFLICT, "Survey already submitted.");
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      throw new ApiError(httpStatus.NOT_FOUND, "Survey not found.");
    }

    if (survey.isFinalized) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Cannot submit responses to a finalized survey.");
    }

    const allQuestions = survey.questions;

    if (!Array.isArray(answers)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Answers must be an array.");
    }

    // Process answers to handle skipped ones
    const processedAnswers = answers.map((answer: any) => ({
      code: answer.code,
      categoryCode: answer.categoryCode,
      value: answer.value,
      answerType: answer.answerType,
      keyPopulation: answer.keyPopulation,
      skipped: answer.skipped || (answer.value === null || answer.value === undefined),
      skippedReason: answer.skippedReason
    }));

    // Separate answered and skipped
    const answeredQuestions = processedAnswers.filter((a: any) => !a.skipped);
    const skippedAnswers = processedAnswers.filter((a: any) => a.skipped);

    // Create answer map for conditional logic (only non-skipped answers)
    const answerMap = Object.fromEntries(
      answeredQuestions.map((a: any) => [a.code, a.value])
    );

    // Check which questions should be shown based on conditional logic
    const visibleQuestions = allQuestions.filter(question =>
      !question.showIf || isConditionMet(question.showIf, answerMap)
    );

    // Get codes of visible questions
    const visibleQuestionCodes = new Set(visibleQuestions.map(q => q.code));

    // Filter answered questions to only include those that should be visible
    const validAnsweredQuestions = answeredQuestions.filter((a: any) =>
      visibleQuestionCodes.has(a.code)
    );

    // Validate non-skipped answers
    for (const answer of validAnsweredQuestions) {
      const question = allQuestions.find(q => q.code === answer.code);
      if (question && !isValidAnswer(question, answer.value)) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid answer for question ${answer.code}`);
      }
    }

    // Calculate statistics based on VISIBLE questions only
    const totalVisible = visibleQuestions.length;
    const totalAnswered = validAnsweredQuestions.length;
    const totalSkipped = skippedAnswers.filter(a => visibleQuestionCodes.has(a.code)).length +
      skippedQuestions.filter((sq: { code: string; }) => visibleQuestionCodes.has(sq.code)).length;

    // IMPORTANT: Both answered and skipped count as completed
    const totalCompleted = totalAnswered + totalSkipped;

    // Calculate completion percentage based on completed (answered + skipped)
    let completionPercentage = 0;
    if (totalVisible > 0) {
      completionPercentage = Math.min(100, Math.max(0, (totalCompleted / totalVisible) * 100));
    }

    // Round to 2 decimal places
    completionPercentage = Math.round(completionPercentage * 100) / 100;

    // Check if fully complete based on completed count
    const isFullyComplete = totalCompleted >= totalVisible && completionPercentage >= 99.99;
    const isPartiallyComplete = totalCompleted > 0;

    if (!isPartiallyComplete) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Cannot submit survey with no answers.");
    }

    // Create the response with completion status
    const response = new SurveyResponse({
      userId,
      surveyId,
      answers: processedAnswers,
      skippedQuestions: skippedQuestions.map((sq: any) => ({
        code: sq.code,
        categoryCode: sq.categoryCode,
        reason: sq.reason || 'User skipped',
        skippedAt: sq.skippedAt || new Date()
      })),
      submittedAt: new Date(),
      isComplete: isFullyComplete,
      isPartialSubmission: !isFullyComplete,
      completionPercentage: completionPercentage,
      statistics: {
        totalQuestions: totalVisible,
        answered: totalAnswered,
        skipped: totalSkipped,
        unanswered: totalVisible - totalCompleted
      }
    });

    await response.save();

    // Mark survey as having responses
    if (!survey.hasResponses) {
      survey.hasResponses = true;
      await survey.save();
    }

    // Remove any saved progress for this survey
    await UserSurveyProgress.deleteMany({ userId, surveyId });

    return {
      response,
      summary: {
        totalQuestions: totalVisible,
        answered: totalAnswered,
        skipped: totalSkipped,
        unanswered: totalVisible - totalCompleted,
        completionPercentage: completionPercentage.toFixed(2),
        isComplete: isFullyComplete,
        isPartialSubmission: !isFullyComplete,
        message: isFullyComplete
          ? "Survey submitted successfully!"
          : `Survey partially submitted with ${completionPercentage.toFixed(1)}% completion.`
      }
    };
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      console.error('Validation Error:', error);
      throw new ApiError(httpStatus.BAD_REQUEST, `Validation Error: ${error.message}`);
    }
    throw new ApiError(error.statusCode || 500, error.message || "Error submitting survey response");
  }
};

// Get user survey progress with detailed information
export const getUserSurveyProgressService = async (userId: string) => {
  try {
    // Get all progress records for the user
    const progressRecords = await UserSurveyProgress.find({ userId })
      .populate({
        path: 'surveyId',
        select: 'title description categories questions country',
        populate: {
          path: 'country',
          select: 'name code'
        }
      })
      .lean();

    // If no progress found
    if (!progressRecords || progressRecords.length === 0) {
      return {
        surveys: [],
        summary: {
          totalSurveysStarted: 0,
          totalSurveysCompleted: 0,
          overallProgress: 0
        }
      };
    }

    // Process each progress record
    const surveysWithProgress = progressRecords.map(progress => {
      const survey = progress.surveyId as any;
      const totalQuestions = survey?.questions?.length || 0;

      // Calculate completed count (answered + skipped)
      const answeredCount = progress.answers.filter(a => !a.skipped && a.value !== null).length;
      const skippedCount = progress.answers.filter(a => a.skipped).length;
      const completedCount = answeredCount + skippedCount;

      // Recalculate completion percentage to ensure consistency
      const completionPercentage = totalQuestions > 0
        ? Math.round((completedCount / totalQuestions) * 100 * 100) / 100
        : 0;

      // Get section-wise progress
      const sectionsProgress = survey?.categories ?
        getSectionsSummary(progress.answers, survey.categories) : {};

      // Find next unanswered question
      const answeredCodes = new Set(progress.answers.map(a => a.code));
      const nextQuestion = survey?.questions?.find((q: any) => !answeredCodes.has(q.code));

      return {
        surveyId: progress.surveyId._id || progress.surveyId,
        surveyTitle: survey?.title || 'Unknown Survey',
        surveyDescription: survey?.description || '',
        country: survey?.country || null,
        progress: {
          totalQuestions,
          totalAnswered: answeredCount,
          totalSkipped: skippedCount,
          totalCompleted: completedCount,
          totalUnanswered: totalQuestions - completedCount,
          completionPercentage: completionPercentage,
          completionPercentageText: `${completionPercentage}%`,
          lastSection: progress.lastSection || null,
          lastUpdated: progress.statistics?.lastUpdated || progress.updatedAt,
          isComplete: completionPercentage >= 100
        },
        sectionsProgress,
        nextQuestion: nextQuestion ? {
          code: nextQuestion.code,
          categoryCode: nextQuestion.categoryCode,
          text: nextQuestion.text,
          answerType: nextQuestion.answerType
        } : null,
        canSubmit: completionPercentage >= 100,
        lastActivity: progress.updatedAt
      };
    });

    // Calculate overall summary
    const totalSurveysStarted = surveysWithProgress.length;
    const totalSurveysCompleted = surveysWithProgress.filter(s => s.progress.isComplete).length;
    const overallProgress = totalSurveysStarted > 0
      ? surveysWithProgress.reduce((sum, s) => sum + s.progress.completionPercentage, 0) / totalSurveysStarted
      : 0;

    return {
      surveys: surveysWithProgress,
      summary: {
        totalSurveysStarted,
        totalSurveysCompleted,
        totalSurveysInProgress: totalSurveysStarted - totalSurveysCompleted,
        overallProgress: Math.round(overallProgress * 100) / 100,
        overallProgressText: `${Math.round(overallProgress * 100) / 100}%`
      }
    };
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Error fetching survey progress"
    );
  }
};

// Update user survey progress
export const updateUserSurveyProgressService = async (
  userId: string,
  progressData: {
    surveyId: string;
    answers: IAnswer[];
    currentSection?: string; // Optional, can be inferred from answers
  }
) => {
  try {
    const { surveyId, answers } = progressData;

    // Validate survey exists
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      throw new ApiError(httpStatus.NOT_FOUND, "Survey not found");
    }

    // Get existing progress
    let existingProgress = await UserSurveyProgress.findOne({
      userId,
      surveyId
    });

    // Initialize if no existing progress
    if (!existingProgress) {
      existingProgress = new UserSurveyProgress({
        userId,
        surveyId,
        answers: [],
        skippedQuestions: [],
        completionPercentage: 0,
        statistics: {
          totalQuestions: survey.questions.length,
          answered: 0,
          skipped: 0,
          unanswered: survey.questions.length,
          lastUpdated: new Date()
        }
      });
    }

    // Create a map of existing answers for quick lookup
    const existingAnswersMap = new Map(
      existingProgress.answers.map(a => [a.code, a])
    );

    // Process new answers
    answers.forEach(newAnswer => {
      // Fix incorrect categoryCode values (2.40 -> 2.4, etc.)
      if (newAnswer.categoryCode && newAnswer.categoryCode.match(/^\d+\.\d{2,}$/)) {
        newAnswer.categoryCode = newAnswer.code.split('.').slice(0, 2).join('.');
      }

      // Update or add the answer
      existingAnswersMap.set(newAnswer.code, newAnswer);
    });

    // Convert map back to array
    const updatedAnswers = Array.from(existingAnswersMap.values());

    // Sort answers by code to maintain order
    updatedAnswers.sort((a, b) => {
      const aParts = a.code.split('.').map(Number);
      const bParts = b.code.split('.').map(Number);

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        if (aParts[i] !== bParts[i]) {
          return (aParts[i] || 0) - (bParts[i] || 0);
        }
      }
      return 0;
    });

    // Calculate statistics
    const answeredCount = updatedAnswers.filter(a => !a.skipped && a.value !== null).length;
    const skippedCount = updatedAnswers.filter(a => a.skipped).length;
    const totalQuestions = survey.questions.length;
    const completedCount = answeredCount + skippedCount;
    const unansweredCount = totalQuestions - updatedAnswers.length;

    const completionPercentage = totalQuestions > 0
      ? Math.round((completedCount / totalQuestions) * 100 * 100) / 100
      : 0;

    // Determine the last answered section
    const lastAnsweredCode = updatedAnswers[updatedAnswers.length - 1]?.code || '';
    const lastSection = lastAnsweredCode.split('.').slice(0, 2).join('.');

    // Update progress
    existingProgress.answers = updatedAnswers;
    existingProgress.completionPercentage = completionPercentage;
    existingProgress.lastSection = lastSection;
    existingProgress.statistics = {
      totalQuestions,
      answered: answeredCount,
      skipped: skippedCount,
      unanswered: unansweredCount,
      lastUpdated: new Date()
    };

    await existingProgress.save();

    // Get sections summary
    const sectionsSummary = getSectionsSummary(updatedAnswers, survey.categories);

    return {
      progress: existingProgress,
      summary: {
        totalQuestions,
        totalAnswered: answeredCount,
        totalSkipped: skippedCount,
        totalCompleted: completedCount,
        totalUnanswered: unansweredCount,
        completionPercentage: `${completionPercentage}%`,
        lastAnsweredQuestion: lastAnsweredCode,
        lastSection,
        sectionsProgress: sectionsSummary,
        canProceedToSection: getNextSection(lastSection, survey.categories),
        lastSaved: new Date()
      }
    };
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Error updating survey progress"
    );
  }
};

// Get survey by user's country (from auth token)
export const getUserCountrySurveyService = async (userId: string, countryCode: string) => {
  try {
    // First, try to get country-specific surveys
    let surveysWithCountry = await Survey.aggregate([
      {
        $lookup: {
          from: 'countries',
          localField: 'country',
          foreignField: '_id',
          as: 'countryData'
        }
      },
      {
        $unwind: '$countryData'
      },
      {
        $match: {
          'countryData.code': countryCode,
          isActive: true
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          categories: 1,
          questions: 1,
          country: {
            _id: '$countryData._id',
            name: '$countryData.name',
            code: '$countryData.code'
          }
        }
      }
    ]);

    // If no country-specific surveys found, try to get global surveys
    if (!surveysWithCountry || surveysWithCountry.length === 0) {
      surveysWithCountry = await Survey.aggregate([
        {
          $lookup: {
            from: 'countries',
            localField: 'country',
            foreignField: '_id',
            as: 'countryData'
          }
        },
        {
          $unwind: '$countryData'
        },
        {
          $match: {
            'countryData.code': 'GL', // Global survey code
            isActive: true
          }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            categories: 1,
            questions: 1,
            country: {
              _id: '$countryData._id',
              name: '$countryData.name',
              code: '$countryData.code'
            },
            isGlobalSurvey: { $literal: true } // Mark as global survey
          }
        }
      ]);

      // If still no surveys found, throw error
      if (!surveysWithCountry || surveysWithCountry.length === 0) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "No surveys found for your country or globally"
        );
      }
    }

    // Check if user has already completed any surveys
    const userResponses = await SurveyResponse.find({
      userId,
      surveyId: { $in: surveysWithCountry.map(s => s._id) }
    }).select('surveyId isComplete');

    // Check user progress for incomplete surveys
    const userProgress = await UserSurveyProgress.find({
      userId,
      surveyId: { $in: surveysWithCountry.map(s => s._id) }
    }).select('surveyId completionPercentage statistics');

    // Add completion status and progress to each survey
    const surveysWithStatus = surveysWithCountry.map(survey => {
      const response = userResponses.find(r => r.surveyId.toString() === survey._id.toString());
      const progress = userProgress.find(p => p.surveyId.toString() === survey._id.toString());

      return {
        ...survey,
        userStatus: {
          hasStarted: !!response || !!progress,
          isComplete: response?.isComplete || false,
          completionPercentage: progress?.completionPercentage || 0,
          statistics: progress?.statistics || null
        },
        surveyType: survey.isGlobalSurvey ? 'global' : 'country-specific',
        userCountry: countryCode // Include user's actual country for reference
      };
    });

    return surveysWithStatus;
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Error fetching country surveys"
    );
  }
};

// Get specific survey response or progress
export const getUserSurveyResponseService = async (userId: string, surveyId: string) => {
  try {
    // Single query to check both collections
    const [response, progress] = await Promise.all([
      SurveyResponse.findOne({ userId, surveyId }).populate({
        path: 'surveyId',
        select: 'title description categories questions country',
        populate: { path: 'country', select: 'name code' }
      }).lean(),
      
      UserSurveyProgress.findOne({ userId, surveyId }).populate({
        path: 'surveyId',
        select: 'title description categories questions country',
        populate: { path: 'country', select: 'name code' }
      }).lean()
    ]);

    // Use response if exists, otherwise use progress
    const data = response || progress;
    
    if (!data) {
      throw new ApiError(httpStatus.NOT_FOUND, "No survey data found");
    }

    const survey = data.surveyId as any;
    const isFromProgress = !response; // true if using progress data

    return {
      responseId: data._id,
      survey: {
        id: survey._id,
        title: survey.title,
        description: survey.description,
        country: survey.country
      },
      submittedAt: response?.submittedAt || null,
      lastUpdated: 'updatedAt' in data ? data.updatedAt : null,
      isComplete: 'isComplete' in data ? data.isComplete || false : false,
      isPartialSubmission: 'isPartialSubmission' in data ? data.isPartialSubmission : true,
      completionPercentage: data.completionPercentage || 0,
      isFromProgress,
      status: isFromProgress ? 'in-progress' : ('isComplete' in data && data.isComplete ? 'completed' : 'partially-submitted'),
      statistics: data.statistics || {},
      answers: data.answers || [],
      skippedQuestions: data.skippedQuestions || []
    };
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Error fetching survey data"
    );
  }
};

// Get all survey responses with pagination
export const getAllUserSurveyResponsesService = async (
  userId: string,
  options: { page: number; limit: number; status?: string }
) => {
  try {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { userId };
    if (status === 'complete') {
      query.isComplete = true;
    } else if (status === 'partial') {
      query.isPartialSubmission = true;
    }

    // Get total count
    const total = await SurveyResponse.countDocuments(query);

    // Get responses
    const responses = await SurveyResponse.find(query)
      .populate({
        path: 'surveyId',
        select: 'title description country',
        populate: {
          path: 'country',
          select: 'name code'
        }
      })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Process each response
    const processedResponses = responses.map(response => {
      const survey = response.surveyId as any;

      return {
        responseId: response._id,
        survey: {
          id: survey._id,
          title: survey.title,
          country: survey.country
        },
        submittedAt: response.submittedAt,
        isComplete: response.isComplete,
        completionPercentage: response.completionPercentage,
        statistics: response.statistics,
        totalAnswers: response.answers.length,
        totalSkipped: response.skippedQuestions.length
      };
    });

    return {
      responses: processedResponses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Error fetching survey responses"
    );
  }
};

/** Superadmin & admin: all responses. Community admin: responses from users in the same `User.country`. */
export const listAdminSurveyResponsesService = async (
  adminRole: UserRole,
  adminCountry: string | undefined,
  options: { surveyId?: string; page: number; limit: number; status?: string }
) => {
  try {
    const { page, limit, status, surveyId } = options;

    if (adminRole === UserRole.COMMUNITYADMIN) {
      if (
        adminCountry === undefined ||
        adminCountry === null ||
        String(adminCountry).trim() === ""
      ) {
        throw new ApiError(httpStatus.FORBIDDEN, ApiMessages.COMMUNITY_ADMIN_COUNTRY_REQUIRED);
      }
    }

    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};

    if (surveyId) {
      if (!mongoose.Types.ObjectId.isValid(surveyId)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid survey ID");
      }
      query.surveyId = new mongoose.Types.ObjectId(surveyId);
    }

    if (status === "complete") {
      query.isComplete = true;
    } else if (status === "partial") {
      query.isPartialSubmission = true;
    }

    if (adminRole === UserRole.COMMUNITYADMIN) {
      const userIds = await User.find({ country: adminCountry }).distinct("_id");
      if (!userIds.length) {
        return {
          responses: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: page > 1,
          },
        };
      }
      query.userId = { $in: userIds };
    }

    const total = await SurveyResponse.countDocuments(query);
    const responses = await SurveyResponse.find(query)
      .populate({
        path: "surveyId",
        select: "title description country",
        populate: { path: "country", select: "name code" },
      })
      .populate({ path: "userId", select: "name email country" })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const processedResponses = responses.map((response: any) => {
      const survey = response.surveyId;
      const u = response.userId;
      return {
        responseId: response._id,
        surveyId: survey?._id,
        user: u
          ? {
              id: u._id,
              name: u.name,
              email: u.email,
              country: u.country,
            }
          : null,
        survey: survey
          ? {
              id: survey._id,
              title: survey.title,
              description: survey.description,
              country: survey.country,
            }
          : null,
        submittedAt: response.submittedAt,
        isComplete: response.isComplete,
        isPartialSubmission: response.isPartialSubmission,
        completionPercentage: response.completionPercentage,
        statistics: response.statistics,
        totalAnswers: response.answers?.length ?? 0,
        totalSkipped: response.skippedQuestions?.length ?? 0,
      };
    });

    const totalPages = Math.ceil(total / limit) || 0;

    return {
      responses: processedResponses,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Error fetching survey responses"
    );
  }
};