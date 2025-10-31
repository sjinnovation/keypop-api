import { generatePDF, generateCSV } from "../Utils/exportServices";
import ApiError from "../global/errors/ApiError";
import httpStatus from "http-status";
import Survey, { AnswerType, KeyPopulation } from "../models/survey.model";
import SurveyResponse from "../models/surveyResponse.model";
import { generateAllResponsesCSV, generateAllResponsesPDF, generateSurveyResponseCSV, generateSurveyResponsePDF, generateSurveySummaryCSV, generateSurveySummaryPDF } from "../Utils/surveyExport";

export const exportDataService = async (
  type: string,
  tableData: any[]
): Promise<{ buffer: Buffer; fileName: string }> => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    let buffer: Buffer;
    let fileName: string;

    switch (type.toLowerCase()) {
      case "pdf":
        buffer = await generatePDF(tableData);
        fileName = `contact-requests-${timestamp}.pdf`;
        break;
      case "csv":
        buffer = await generateCSV(tableData);
        fileName = `contact-requests-${timestamp}.csv`;
        break;
      default:
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Unsupported file type. Use 'pdf' or 'csv'."
        );
    }

    return { buffer, fileName };
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to generate file."
    );
  }
};

// Export single user's survey response
export const exportSurveyResponseService = async (
  userId: string,
  surveyId: string,
  format: 'pdf' | 'csv'
): Promise<{ buffer: Buffer; fileName: string }> => {
  try {
    // Fetch survey response with populated data
    const response = await SurveyResponse.findOne({ userId, surveyId })
      .populate({ path: 'userId', select: 'name email' })
      .populate({
        path: 'surveyId',
        select: 'title country categories questions',
        populate: { path: 'country', select: 'name' }
      });

    if (!response) {
      throw new ApiError(httpStatus.NOT_FOUND, "Survey response not found");
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    let buffer: Buffer;
    let fileName: string;

    // Prepare data for export
    const exportData = prepareResponseData(response);

    switch (format) {
      case 'pdf':
        buffer = await generateSurveyResponsePDF(exportData);
        fileName = `survey-response-${exportData.surveyTitle}-${exportData.userName}-${timestamp}.pdf`;
        break;
      case 'csv':
        buffer = await generateSurveyResponseCSV(exportData);
        fileName = `survey-response-${exportData.surveyTitle}-${exportData.userName}-${timestamp}.csv`;
        break;
    }

    return { buffer, fileName };
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to export survey response"
    );
  }
};

// Export all responses for a survey
export const exportAllSurveyResponsesService = async (
  surveyId: string,
  format: 'pdf' | 'csv'
): Promise<{ buffer: Buffer; fileName: string }> => {
  try {
    const survey = await Survey.findById(surveyId)
      .populate('country', 'name')
      .populate('categories');

    if (!survey) {
      throw new ApiError(httpStatus.NOT_FOUND, "Survey not found");
    }

    const responses = await SurveyResponse.find({ surveyId })
      .populate('userId', 'name email')
      .sort({ submittedAt: -1 });

    if (responses.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No responses found for this survey");
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    let buffer: Buffer;
    let fileName: string;

    // Create maps for efficient lookup
    const questionMap = new Map<string, any>();
    const categoryMap = new Map<string, any>();

    // Map questions by code
    if (survey.questions && Array.isArray(survey.questions)) {
      survey.questions.forEach(question => {
        questionMap.set(question.code, question);
      });
    }

    // Map categories by code
    if (survey.categories && Array.isArray(survey.categories)) {
      survey.categories.forEach(category => {
        categoryMap.set(category.code, category);
      });
    }

    // Prepare the export data with proper structure
    const exportData = {
      survey: {
        title: survey.title,
        country: (survey.country as { name?: string })?.name || 'Unknown',
        questions: survey.questions,
        categories: survey.categories
      },
      responses: responses.map(response => {
        // Type guard for populated userId
        const user = response.userId as any;
        const userName = user?.name || 'Unknown';
        const userEmail = user?.email || 'Unknown';

        return {
          userName,
          userEmail,
          submittedAt: response.submittedAt,
          isComplete: response.isComplete,
          answers: response.answers.map(answer => {
            const question = questionMap.get(answer.code);
            const category = categoryMap.get(answer.categoryCode);

            return {
              code: answer.code,
              questionText: question?.text || 'Unknown Question',
              categoryCode: answer.categoryCode,
              categoryTitle: category?.title || 'Unknown Category',
              answerType: answer.answerType,
              value: answer.value,
              // formattedValue: formatAnswerValue(answer.value, answer.answerType),
              keyPopulation: answer.keyPopulation || [],
              // keyPopulationDisplay: formatKeyPopulation(answer.keyPopulation)
            };
          })
        };
      }),
      totalResponses: responses.length,
      completeResponses: responses.filter(r => r.isComplete).length,
      incompleteResponses: responses.filter(r => !r.isComplete).length,
      responsesByDate: responses.reduce((acc, response) => {
        const date = new Date(response.submittedAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    switch (format) {
      case 'pdf':
        buffer = await generateAllResponsesPDF(exportData);
        fileName = `all-responses-${survey.title.replace(/[^a-z0-9]/gi, '-')}-${timestamp}.pdf`;
        break;
      case 'csv':
        buffer = await generateAllResponsesCSV(exportData);
        fileName = `all-responses-${survey.title.replace(/[^a-z0-9]/gi, '-')}-${timestamp}.csv`;
        break;
      default:
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid format");
    }

    return { buffer, fileName };
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to export survey responses"
    );
  }
};



// Export survey summary/analytics
export const exportSurveySummaryService = async (
  surveyId: string,
  format: 'pdf' | 'csv'
): Promise<{ buffer: Buffer; fileName: string }> => {
  try {
    const survey = await Survey.findById(surveyId)
      .populate('country', 'name');

    if (!survey) {
      throw new ApiError(httpStatus.NOT_FOUND, "Survey not found");
    }

    const responses = await SurveyResponse.find({ surveyId });

    // Calculate analytics
    const analytics = calculateSurveyAnalytics(survey, responses);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    let buffer: Buffer;
    let fileName: string;

    switch (format) {
      case 'pdf':
        buffer = await generateSurveySummaryPDF(survey, analytics);
        fileName = `survey-summary-${survey.title}-${timestamp}.pdf`;
        break;
      case 'csv':
        buffer = await generateSurveySummaryCSV(survey, analytics);
        fileName = `survey-summary-${survey.title}-${timestamp}.csv`;
        break;
    }

    return { buffer, fileName };
  } catch (error: any) {
    throw new ApiError(
      error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      error.message || "Failed to export survey summary"
    );
  }
};

// Helper functions
const prepareResponseData = (response: any) => {
  const survey = response.surveyId;
  const user = response.userId;

  return {
    surveyTitle: survey.title,
    surveyCountry: survey.country?.name || 'Unknown',
    userName: user?.name || 'Anonymous',
    userEmail: user?.email || 'N/A',
    submittedAt: response.submittedAt,
    categories: survey.categories,
    questions: survey.questions,
    answers: response.answers.map((answer: any) => {
      const question = survey.questions.find((q: any) => q.code === answer.code);
      const category = survey.categories.find((c: any) => c.code === answer.categoryCode);

      return {
        ...answer.toObject(),
        questionText: question?.text || 'Unknown Question',
        categoryTitle: category?.title || 'Unknown Category',
        formattedValue: formatAnswerValue(answer.value, answer.answerType)
      };
    })
  };
};


// Helper function to format answer values based on type
const formatAnswerValue = (value: string | number | boolean, answerType: AnswerType): string => {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  switch (answerType) {
    case AnswerType.YesNo:
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      return value === 'true' || value === 'Yes' ? 'Yes' : 'No';

    case AnswerType.Rating:
      return `${value}/5`;

    case AnswerType.MCQ:
      // MCQ values might be stored as comma-separated strings or arrays
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    default:
      return String(value);
  }
};

// Helper function to format key population array for display
const formatKeyPopulation = (keyPopulation?: KeyPopulation[]): string => {
  if (!keyPopulation || keyPopulation.length === 0) {
    return 'General Population';
  }
  return keyPopulation.join(', ');
};


const calculateSurveyAnalytics = (survey: any, responses: any[]) => {
  const totalResponses = responses.length;
  const questionStats: any = {};

  survey.questions.forEach((question: any) => {
    const answers = responses.flatMap(r =>
      r.answers.filter((a: any) => a.code === question.code)
    );

    questionStats[question.code] = {
      questionText: question.text,
      answerType: question.answerType,
      totalAnswers: answers.length,
      stats: calculateQuestionStats(answers, question.answerType)
    };
  });

  return {
    totalResponses,
    completionRate: (responses.length / survey.questions.length) * 100,
    questionStats,
    responsesByDate: groupResponsesByDate(responses)
  };
};

const calculateQuestionStats = (answers: any[], answerType: string) => {
  switch (answerType) {
    case 'YesNo':
      const yesCount = answers.filter(a => a.value === true).length;
      return {
        yes: yesCount,
        no: answers.length - yesCount,
        yesPercentage: (yesCount / answers.length) * 100
      };

    case 'Rating':
      const ratings = answers.map(a => a.value);
      return {
        average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
        distribution: [1, 2, 3, 4, 5].map(rating => ({
          rating,
          count: ratings.filter(r => r === rating).length
        }))
      };

    case 'MCQ':
      const optionCounts: any = {};
      answers.forEach(answer => {
        const values = Array.isArray(answer.value) ? answer.value : [answer.value];
        values.forEach((v: string) => {
          optionCounts[v] = (optionCounts[v] || 0) + 1;
        });
      });
      return { optionCounts };

    default:
      return {};
  }
};

const groupResponsesByDate = (responses: any[]) => {
  const grouped: any = {};
  responses.forEach(response => {
    const date = new Date(response.submittedAt).toISOString().split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });
  return grouped;
};