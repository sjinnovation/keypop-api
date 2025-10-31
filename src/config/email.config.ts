import nodemailer from "nodemailer";
import { envConfig } from "./env";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: envConfig.EMAIL_USER,
        pass: envConfig.EMAIL_PASS,
    },
  });

export default transporter;