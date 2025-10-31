import { Resend } from 'resend';
import { envConfig } from '../config/env';
import ApiError from '../global/errors/ApiError';
import httpStatus from 'http-status';
import { ApiMessages } from '../Constants/Messages';
import {
  welcomeEmailTemplate,
  passwordResetOTPTemplate,
  passwordResetSuccessTemplate,
  surveyCompletionTemplate,
  accountDeletionTemplate
} from '../templates/emailTemplates';

const resend = new Resend(envConfig.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const { to, subject, html, from } = options;
    
    const emailOptions: any = {
      from: from || envConfig.EMAIL_FROM || 'APCOM <noreply@apcom.org>',
      to: Array.isArray(to) ? to : [to],
      subject,
    };

    if (html) {
      emailOptions.html = html;
    } else {
      throw new Error('Either html or text content is required');
    }

    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error('Resend error:', error);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, ApiMessages.EMAIL_SEND_FAILED);
    }

    return data;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, ApiMessages.EMAIL_SEND_FAILED);
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  return sendEmail({
    to: email,
    subject: 'Welcome to APCOM',
    html: welcomeEmailTemplate(name),
  });
};

export const sendPasswordResetEmail = async (email: string, otp: string) => {
  return sendEmail({
    to: email,
    subject: 'Password Reset OTP - APCOM',
    html: passwordResetOTPTemplate(otp),
  });
};

export const sendPasswordResetSuccessEmail = async (email: string, name?: string) => {
  return sendEmail({
    to: email,
    subject: 'Password Reset Successful - APCOM',
    html: passwordResetSuccessTemplate(name),
  });
};

export const sendAccountDeletionEmail = async (email: string, name: string) => {
  return sendEmail({
    to: email,
    subject: 'Account Deleted - APCOM',
    html: accountDeletionTemplate(name),
  });
};

export const sendSurveyCompletionEmail = async (email: string, name: string, surveyTitle: string) => {
  return sendEmail({
    to: email,
    subject: 'Thank You for Completing the Survey',
    html: surveyCompletionTemplate(name, surveyTitle),
  });
};