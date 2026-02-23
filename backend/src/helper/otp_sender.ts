import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { otpModel } from "../model";
import { responseMessage } from "../common";
import { buildOtpEmailTemplate } from "./otp_email_template";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

export interface IOTP {
  email: string;
  otp: string;
  expireAt?: Date;
}

export const otpSender = async (email: string) => {
  const otp = generateOTP();
  const otpString = otp.toString();
  const expireAt = new Date(Date.now() + 1000 * 60 * 3);

  try {
    await otpModel.OTP_Collection.deleteMany({ email, purpose: "signin" } as any);
    await otpModel.OTP_Collection.create({ email, otp, expireAt, purpose: "signin" } as any);

    const html = buildOtpEmailTemplate({
      otp: otpString,
      purposeText: "sign in verification",
      supportEmail: process.env.EMAIL || "support@medicobilling.com",
      brandName: "Medico Billing",
      validMinutes: 3,
      logoUrl: process.env.APP_LOGO_URL,
    });

    await transporter.sendMail({
      from: `Security Team <${process.env.EMAIL}>`,
      to: email,
      subject: "Your Account OTP Verification",
      html,
    });

    return { status: true, message: responseMessage.otp_sent };
  } catch (error) {
    return { status: false, message: responseMessage.otp_notSent };
  }
};
