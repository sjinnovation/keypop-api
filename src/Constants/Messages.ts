export enum ApiMessages {
  // User
  USER_CREATED = "User created successfully",
  USER_UPDATED = "User updated successfully",
  USER_DELETED = "User deleted successfully",
  USER_FETCHED = "User fetched successfully",
  USER_NOT_FOUND = "User not found",
  INVALID_OR_EXPIRED_TOKEN = "Invalid or expired token",
  USER_ALREADY_EXISTS = "User already exists",
  ADMIN_COUNTS_FETCHED = "Admin counts fetched successfully",
  FAILED_TO_FETCH_ADMIN_COUNTS= "Failed to fetch admin role counts",

  // Contact Request
  CONTACT_REQUEST_ADDED = "Contact request added successfully",
  CONTACT_REQUEST_EXISTS = "Contact request already exists",
  CONTACT_REQUEST_FETCHED = "Contact request fetched successfully",
  CONTACT_REQUEST_DELETED = "Contact request deleted successfully",
  CONTACT_REQUEST_STATUS_UPDATED = "Contact request status updated successfully",

  //Auth
  LOGIN_SUCCESS = "Login successful",
  SIGNUP_SUCCESS = "User registered successfully",
  INVALID_CREDENTIALS = "Invalid credentials",
  PASSWORD_RESET_EMAIL_SENT = "Password reset email sent",
  PASSWORD_RESET_SUCCESS = "Password reset successfully",
  EMAIL_SEND_FAILED = "Email send failed",

  //Export
  PDF_EXPORT_SUCCESS= "PDF exported successfully",
  CSV_EXPORT_SUCCESS= "CSV exported successfully",

  // Country
  COUNTRY_ADDED = "Country added successfully",
  COUNTRY_UPDATED = "Country updated successfully",
  COUNTRY_DELETED = "Country deleted successfully",
  COUNTRIES_FETCHED = "Countries fetched successfully",
  COUNTRY_FETCHED = "Country fetched successfully",
  COUNTRY_STATUS_UPDATED = "Country status updated successfully",

  // Survey
  SURVEY_ADDED = "Survey added successfully",
  SURVEY_UPDATED = "Survey updated successfully",
  SURVEY_DELETED = "Survey deleted successfully",
  SURVEYS_FETCHED = "Surveys fetched successfully",
  SURVEY_FETCHED = "Survey fetched successfully",
  SURVEY_STATUS_UPDATED = "Survey status updated successfully",
  SURVEY_ALREADY_EXISTS = "Survey already exists",
  SURVEY_NOT_FOUND = "Survey not found",
  SURVEY_SUBMITTED = "Survey submitted successfully",
  SURVEY_SUBMISSION_FAILED = "Survey submission failed",
  SURVEY_RESPONSE_FETCHED = "Survey response fetched successfully",
  SURVEY_RESPONSES_FETCHED = "Survey responses fetched successfully",
  SURVEY_RESPONSE_DELETED = "Survey response deleted successfully",
  SURVEY_PROGRESS_UPDATED = "Survey progress updated successfully",
  SURVEY_PROGRESS_FETCHED = "Survey progress fetched successfully",
  SURVEY_PROGRESS_SAVED = "Survey progress saved successfully",
}