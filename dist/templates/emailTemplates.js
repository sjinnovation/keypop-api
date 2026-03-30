"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.surveyCompletionTemplate = exports.accountDeletionTemplate = exports.passwordResetSuccessTemplate = exports.passwordResetOTPTemplate = exports.welcomeEmailTemplate = void 0;
const env_1 = require("../config/env");
/** Participant web origin for email links; falls back to admin FRONTEND_URL if unset. */
function participantWebBase() {
    const web = env_1.envConfig.FRONTEND_URL_WEB.trim();
    if (web)
        return web.replace(/\/+$/, "");
    return String(env_1.envConfig.FRONTEND_URL || "").replace(/\/+$/, "");
}
// Base template wrapper
const baseTemplate = (title, content) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .logo-container {
            margin-bottom: 20px;
          }
          .logo {
            max-width: 150px;
            height: auto;
          }
          .header { 
            background-color: #ed4520; 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content { 
            padding: 30px 20px; 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            font-size: 12px; 
            color: #666; 
            background-color: #f8f8f8;
            border-top: 1px solid #eee;
          }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #ed4520; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .button:hover {
            background-color: #d63d1a;
          }
          .otp { 
            font-size: 32px; 
            font-weight: bold; 
            color: #ed4520; 
            text-align: center; 
            padding: 20px; 
            background-color: #f8f8f8; 
            border-radius: 5px; 
            margin: 20px 0; 
            letter-spacing: 5px;
          }
          .success-icon { 
            font-size: 48px; 
            text-align: center; 
            margin: 20px 0; 
          }
          .message { 
            background-color: #f8f8f8; 
            padding: 20px; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .security-notice { 
            background-color: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .info-box {
            background-color: #e3f2fd;
            border: 1px solid #90caf9;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          a {
            color: #ed4520;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-container">
              <img src="${env_1.envConfig.LOGO_URL}" alt="APCOM Logo" class="logo" />
            </div>
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
              <img src="${env_1.envConfig.FOOTER_LOGO_URL}" alt="APCOM" style="max-width: 80px; margin-bottom: 10px;" />
              <p>&copy; ${new Date().getFullYear()} APCOM. All rights reserved.</p>
            <p>
              <a href="${participantWebBase()}" style="color: #666;">Visit our website</a> | 
              <a href="mailto:support@apcom.org" style="color: #666;">Contact Support</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
// Welcome Email Template
const welcomeEmailTemplate = (name) => {
    const content = `
      <h2 style="color: #333; margin-bottom: 20px;">Welcome to APCOM!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for joining APCOM. We're excited to have you as part of our community!</p>
      <div class="info-box">
        <h3 style="margin-top: 0;">What you can do now:</h3>
        <ul>
          <li>Complete your profile to get personalized surveys</li>
          <li>Take health equity surveys to contribute to our research</li>
          <li>Access resources and support from our community</li>
          <li>Connect with other community members</li>
        </ul>
      </div>
      <p>Your participation helps us improve healthcare equity and access for key populations across the Asia-Pacific region.</p>
      <center>
        <a href="${participantWebBase()}" class="button">Login to APCOM</a>
      </center>
      <p style="margin-top: 30px; color: #666;">
        If you have any questions, feel free to reach out to our support team.
      </p>
    `;
    return baseTemplate('Welcome to APCOM', content);
};
exports.welcomeEmailTemplate = welcomeEmailTemplate;
// Welcome Email Template for App Users
// export const welcomeAppEmailTemplate = (name: string) => {
//   const content = `
//     <h2 style="color: #333; margin-bottom: 20px;">Welcome to APCOM!</h2>
//     <p>Hi ${name},</p>
//     <p>Thank you for joining APCOM. We're excited to have you as part of our community!</p>
//     <div class="info-box">
//       <h3 style="margin-top: 0;">What you can do now:</h3>
//       <ul>
//         <li>Complete your profile to get personalized surveys</li>
//         <li>Take health equity surveys to contribute to our research</li>
//         <li>Access resources and support from our community</li>
//         <li>Connect with other community members</li>
//       </ul>
//     </div>
//     <p>Your participation helps us improve healthcare equity and access for key populations across the Asia-Pacific region.</p>
//     <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
//       <h3 style="margin-top: 0; color: #007bff;">📱 Get the APCOM Mobile App</h3>
//       <p>For the best experience, download our mobile app:</p>
//       <div style="text-align: center; margin: 15px 0;">
//         <a href="${envConfig.APP_STORE_URL || '#'}" style="display: inline-block; margin: 5px;">
//           <img src="${envConfig.FRONTEND_URL}/images/app-store-badge.png" alt="Download on App Store" style="height: 40px;">
//         </a>
//         <a href="${envConfig.PLAY_STORE_URL || '#'}" style="display: inline-block; margin: 5px;">
//           <img src="${envConfig.FRONTEND_URL}/images/google-play-badge.png" alt="Get it on Google Play" style="height: 40px;">
//         </a>
//       </div>
//       <p style="font-size: 14px; color: #666;">
//         Or visit: <a href="${envConfig.APP_DOWNLOAD_URL || envConfig.FRONTEND_URL}" style="color: #007bff;">${envConfig.APP_DOWNLOAD_URL || envConfig.FRONTEND_URL}</a>
//       </p>
//     </div>
//     <center>
//       <a href="${envConfig.FRONTEND_URL}/login" class="button">Access Web Dashboard</a>
//     </center>
//     <p style="margin-top: 30px; color: #666;">
//       If you have any questions, feel free to reach out to our support team.
//     </p>
//   `;
//   return baseTemplate('Welcome to APCOM - Get the App!', content);
// };
// Password Reset OTP Template
const passwordResetOTPTemplate = (otp) => {
    const content = `
      <p>Hello,</p>
      <p>You have requested to reset your password. Please use the following OTP to reset your password:</p>
      <div class="otp">${otp}</div>
      <div class="security-notice">
        <strong>⚠️ Important:</strong>
        <ul>
          <li>This OTP will expire in 1 hour</li>
          <li>Do not share this OTP with anyone</li>
          <li>If you didn't request this, please ignore this email</li>
        </ul>
      </div>
      <center>
        <a href="${participantWebBase()}/reset-password" class="button">Reset Password</a>
      </center>
    `;
    return baseTemplate('Password Reset Request', content);
};
exports.passwordResetOTPTemplate = passwordResetOTPTemplate;
// Password Reset Success Template
const passwordResetSuccessTemplate = (name) => {
    const content = `
      <div class="success-icon">✅</div>
      <div class="message">
        <p>Hello${name ? ` ${name}` : ''},</p>
        <p><strong>Your password has been successfully reset!</strong></p>
        <p>You can now log in to your account using your new password.</p>
        <center>
          <a href="${participantWebBase()}/login" class="button">Login to Your Account</a>
        </center>
      </div>
      <div class="security-notice">
        <strong>🔒 Security Notice:</strong>
        <ul>
          <li>If you didn't make this change, please contact our support team immediately</li>
          <li>For your security, we recommend using a strong, unique password</li>
          <li>Consider enabling two-factor authentication for added security</li>
        </ul>
      </div>
      <p style="text-align: center; color: #666; margin-top: 30px;">
        <strong>Need help?</strong><br>
        Contact us at <a href="mailto:support@apcom.org">support@apcom.org</a>
      </p>
    `;
    return baseTemplate('Password Reset Successful', content);
};
exports.passwordResetSuccessTemplate = passwordResetSuccessTemplate;
// Account Deletion Confirmation Template
const accountDeletionTemplate = (name) => {
    const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; width: 60px; height: 60px; background-color: #ff4444; border-radius: 50%; line-height: 60px; color: white; font-size: 30px;">
        ⚠️
      </div>
    </div>
    
    <h2 style="color: #333; margin-bottom: 20px; text-align: center;">Account Deleted</h2>
    
    <p>Hi ${name},</p>
    
    <p>Your APCOM account has been successfully deleted as per your request.</p>
    
    <div class="message" style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #ff4444;">What this means:</h3>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Your profile and personal data have been permanently removed</li>
        <li>Your survey responses have been anonymized and retained for research purposes only</li>
        <li>You will no longer receive emails from APCOM</li>
        <li>You cannot recover this account or its data</li>
      </ul>
    </div>
    
    <div class="info-box">
      <p><strong>We're sorry to see you go!</strong></p>
      <p>Your contributions to our community have been valuable in improving healthcare equity for key populations across the Asia-Pacific region.</p>
    </div>
    
    <p style="margin-top: 30px;">If you deleted your account by mistake or would like to rejoin our community in the future, you're always welcome to create a new account.</p>
    
    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Need help?</strong> If you didn't request this deletion or have concerns about your data, please contact us immediately at <a href="mailto:support@apcom.org">support@apcom.org</a></p>
    </div>
    
    <p style="text-align: center; color: #666; margin-top: 30px;">
      Thank you for being part of the APCOM community.<br>
      We wish you all the best.
    </p>
  `;
    return baseTemplate('Account Deleted - APCOM', content);
};
exports.accountDeletionTemplate = accountDeletionTemplate;
// Survey Completion Template
const surveyCompletionTemplate = (name, surveyTitle) => {
    const content = `
      <div class="success-icon">🎉</div>
      <p>Hi ${name},</p>
      <p><strong>Thank you for completing the survey!</strong></p>
      <div class="message">
        <p>You've successfully completed: <strong>${surveyTitle}</strong></p>
        <p>Your responses have been recorded and will help us improve healthcare access for key populations.</p>
      </div>
      <center>
        <a href="${participantWebBase()}/dashboard" class="button">View Dashboard</a>
      </center>
      <p style="text-align: center; color: #666; margin-top: 30px;">
        Stay tuned for more surveys and updates from APCOM!
      </p>
    `;
    return baseTemplate('Survey Completed', content);
};
exports.surveyCompletionTemplate = surveyCompletionTemplate;
