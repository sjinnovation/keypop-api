import { IAnswer } from "../models/surveyTypes.model";

// Helper function to get sections summary
export const getSectionsSummary = (answers: IAnswer[], categories: any[]) => {
    const summary: any = {};
    
    categories.forEach(category => {
      const sectionAnswers = answers.filter(a => a.categoryCode === category.code);
      const answered = sectionAnswers.filter(a => !a.skipped && a.value !== null).length;
      const skipped = sectionAnswers.filter(a => a.skipped).length;
      const completed = answered + skipped; // Both count as completed
      
      summary[category.code] = {
        title: category.title,
        totalAnswered: answered,
        totalSkipped: skipped,
        totalCompleted: completed,
        totalQuestions: sectionAnswers.length,
        completionPercentage: sectionAnswers.length > 0 
          ? ((completed / sectionAnswers.length) * 100).toFixed(2) + '%'
          : '0%',
        isComplete: sectionAnswers.length > 0 && completed === sectionAnswers.length
      };
    });
    
    return summary;
  };
  
  // Helper function to determine next available section
  export const getNextSection = (currentSection: string, categories: any[]) => {
    if (!currentSection) return categories[0]?.code || null;
    
    const currentIndex = categories.findIndex(c => c.code === currentSection);
    if (currentIndex === -1 || currentIndex === categories.length - 1) {
      return null; // No next section
    }
    
    return categories[currentIndex + 1]?.code || null;
  };


// Helper function to group answers by category
export const groupAnswersByCategory = (answers: any[], categories: any[]) => {
    const grouped: any = {};
    
    categories.forEach(category => {
      const categoryAnswers = answers.filter(a => a.categoryCode === category.code);
      
      grouped[category.code] = {
        categoryTitle: category.title,
        answers: categoryAnswers.map(answer => ({
          questionCode: answer.code,
          value: answer.value,
          answerType: answer.answerType,
          skipped: answer.skipped,
          skippedReason: answer.skippedReason
        })),
        summary: {
          total: categoryAnswers.length,
          answered: categoryAnswers.filter(a => !a.skipped).length,
          skipped: categoryAnswers.filter(a => a.skipped).length
        }
      };
    });
    
    return grouped;
  };
  
  // Helper function to calculate detailed statistics
export const calculateDetailedStatistics = (answers: any[], questions: any[]) => {
    const answerTypes = {
      rating: { total: 0, answered: 0, skipped: 0, averageRating: 0 },
      yesNo: { total: 0, answered: 0, skipped: 0, yesCount: 0, noCount: 0 },
      multipleChoice: { total: 0, answered: 0, skipped: 0 },
      text: { total: 0, answered: 0, skipped: 0 }
    };
  
    let totalRatingScore = 0;
    let ratingCount = 0;
  
    answers.forEach(answer => {
      const question = questions.find(q => q.code === answer.code);
      if (!question) return;
  
      const type = answer.answerType.toLowerCase().replace(/\s+/g, '');
      
      if (type === 'rating') {
        answerTypes.rating.total++;
        if (!answer.skipped && answer.value) {
          answerTypes.rating.answered++;
          totalRatingScore += Number(answer.value);
          ratingCount++;
        } else {
          answerTypes.rating.skipped++;
        }
      } else if (type === 'yesno') {
        answerTypes.yesNo.total++;
        if (!answer.skipped && answer.value !== null) {
          answerTypes.yesNo.answered++;
          if (answer.value === true) answerTypes.yesNo.yesCount++;
          else answerTypes.yesNo.noCount++;
        } else {
          answerTypes.yesNo.skipped++;
        }
      } else if (type === 'multiplechoice') {
        answerTypes.multipleChoice.total++;
        if (!answer.skipped && answer.value) {
          answerTypes.multipleChoice.answered++;
        } else {
          answerTypes.multipleChoice.skipped++;
        }
      } else if (type === 'text') {
        answerTypes.text.total++;
        if (!answer.skipped && answer.value) {
          answerTypes.text.answered++;
        } else {
          answerTypes.text.skipped++;
        }
      }
    });
  
    // Calculate average rating
    if (ratingCount > 0) {
      answerTypes.rating.averageRating = Math.round((totalRatingScore / ratingCount) * 100) / 100;
    }
  
    return {
      byAnswerType: answerTypes,
      summary: {
        totalQuestions: questions.length,
        totalAnswered: answers.filter(a => !a.skipped && a.value !== null).length,
        totalSkipped: answers.filter(a => a.skipped).length,
        totalUnanswered: questions.length - answers.length
      }
    };
  };