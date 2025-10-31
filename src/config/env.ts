import dotenv from "dotenv";
dotenv.config();

export const envConfig = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET || "your_secret_key",
  MONGO_URI: process.env.MONGO_URI || "",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  EXPIRE_TIME: process.env.EXPIRE_TIME,
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@apcom.org',
  LOGO_URL:`${process.env.FRONTEND_URL}/static/images/keypopapplogo.png`,
  FOOTER_LOGO_URL:`${process.env.FRONTEND_URL}/static/images/sponsoredLogo.png`
} as const;