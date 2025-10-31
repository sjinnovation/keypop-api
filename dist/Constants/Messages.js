"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiMessages = void 0;
var ApiMessages;
(function (ApiMessages) {
    // User
    ApiMessages["USER_CREATED"] = "User created successfully";
    ApiMessages["USER_UPDATED"] = "User updated successfully";
    ApiMessages["USER_DELETED"] = "User deleted successfully";
    ApiMessages["USER_FETCHED"] = "User fetched successfully";
    ApiMessages["USER_NOT_FOUND"] = "User not found";
    ApiMessages["INVALID_OR_EXPIRED_TOKEN"] = "Invalid or expired token";
    ApiMessages["USER_ALREADY_EXISTS"] = "User already exists";
    ApiMessages["ADMIN_COUNTS_FETCHED"] = "Admin counts fetched successfully";
    ApiMessages["FAILED_TO_FETCH_ADMIN_COUNTS"] = "Failed to fetch admin role counts";
    // Contact Request
    ApiMessages["CONTACT_REQUEST_ADDED"] = "Contact request added successfully";
    ApiMessages["CONTACT_REQUEST_EXISTS"] = "Contact request already exists";
    ApiMessages["CONTACT_REQUEST_FETCHED"] = "Contact request fetched successfully";
    ApiMessages["CONTACT_REQUEST_DELETED"] = "Contact request deleted successfully";
    ApiMessages["CONTACT_REQUEST_STATUS_UPDATED"] = "Contact request status updated successfully";
    //Auth
    ApiMessages["LOGIN_SUCCESS"] = "Login successful";
    ApiMessages["SIGNUP_SUCCESS"] = "User registered successfully";
    ApiMessages["INVALID_CREDENTIALS"] = "Invalid credentials";
    ApiMessages["PASSWORD_RESET_EMAIL_SENT"] = "Password reset email sent";
    ApiMessages["PASSWORD_RESET_SUCCESS"] = "Password reset successfully";
    ApiMessages["EMAIL_SEND_FAILED"] = "Email send failed";
    //Export
    ApiMessages["PDF_EXPORT_SUCCESS"] = "PDF exported successfully";
    ApiMessages["CSV_EXPORT_SUCCESS"] = "CSV exported successfully";
    // Country
    ApiMessages["COUNTRY_ADDED"] = "Country added successfully";
    ApiMessages["COUNTRY_UPDATED"] = "Country updated successfully";
    ApiMessages["COUNTRY_DELETED"] = "Country deleted successfully";
    ApiMessages["COUNTRIES_FETCHED"] = "Countries fetched successfully";
    ApiMessages["COUNTRY_FETCHED"] = "Country fetched successfully";
    ApiMessages["COUNTRY_STATUS_UPDATED"] = "Country status updated successfully";
    // Survey
    ApiMessages["SURVEY_ADDED"] = "Survey added successfully";
    ApiMessages["SURVEY_UPDATED"] = "Survey updated successfully";
    ApiMessages["SURVEY_DELETED"] = "Survey deleted successfully";
    ApiMessages["SURVEYS_FETCHED"] = "Surveys fetched successfully";
    ApiMessages["SURVEY_FETCHED"] = "Survey fetched successfully";
    ApiMessages["SURVEY_STATUS_UPDATED"] = "Survey status updated successfully";
    ApiMessages["SURVEY_ALREADY_EXISTS"] = "Survey already exists";
    ApiMessages["SURVEY_NOT_FOUND"] = "Survey not found";
    ApiMessages["SURVEY_SUBMITTED"] = "Survey submitted successfully";
    ApiMessages["SURVEY_SUBMISSION_FAILED"] = "Survey submission failed";
    ApiMessages["SURVEY_RESPONSE_FETCHED"] = "Survey response fetched successfully";
    ApiMessages["SURVEY_RESPONSES_FETCHED"] = "Survey responses fetched successfully";
    ApiMessages["SURVEY_RESPONSE_DELETED"] = "Survey response deleted successfully";
    ApiMessages["SURVEY_PROGRESS_UPDATED"] = "Survey progress updated successfully";
    ApiMessages["SURVEY_PROGRESS_FETCHED"] = "Survey progress fetched successfully";
    ApiMessages["SURVEY_PROGRESS_SAVED"] = "Survey progress saved successfully";
})(ApiMessages || (exports.ApiMessages = ApiMessages = {}));
