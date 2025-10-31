"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConditionMet = isConditionMet;
exports.isValidAnswer = isValidAnswer;
function isConditionMet(condition, answers) {
    const answer = answers[condition.questionCode];
    if (answer === undefined)
        return false;
    if (Array.isArray(condition.expectedAnswer)) {
        return condition.expectedAnswer.includes(answer);
    }
    if (typeof condition.expectedAnswer === 'number' && typeof answer === 'number') {
        return answer >= condition.expectedAnswer;
    }
    return answer === condition.expectedAnswer;
}
function isValidAnswer(question, answer) {
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
            }
            else {
                return question.options.includes(answer);
            }
        default:
            return false;
    }
}
