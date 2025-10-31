export function isConditionMet(
  condition: { questionCode: string, expectedAnswer: any },
  answers: Record<string, any>
): boolean {
  const answer = answers[condition.questionCode];

  if (answer === undefined) return false;

  if (Array.isArray(condition.expectedAnswer)) {
    return condition.expectedAnswer.includes(answer);
  }

  if (typeof condition.expectedAnswer === 'number' && typeof answer === 'number') {
    return answer >= condition.expectedAnswer;
  }

  return answer === condition.expectedAnswer;
}

export function isValidAnswer(question: any, answer: any): boolean {
  switch (question.answerType) {
    case 'Text':
      return typeof answer === 'string';
    case 'YesNo':
      return typeof answer === 'boolean';
    case 'Rating':
      return typeof answer === 'number' && question.ratingScale.includes(answer);
    case 'MCQ':
      if (Array.isArray(answer)) {
        return answer.every(option => question.options.includes(option));
      } else {
        return question.options.includes(answer);
      }
    default:
      return false;
  }
}
