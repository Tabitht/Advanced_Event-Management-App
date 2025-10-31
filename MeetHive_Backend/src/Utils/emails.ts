/**
 * @module src/Utils/emails.ts
 * @description Utility functions for sending emails using the Resend service.
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * @function sendVerificationEmail
 * @description Sends a verification email for veryfying user accounts
 * @param {string} email - The user's email address.
 * @param {string} token - The token to be sent alongside the verification link.
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 */

const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const htmlContent = `
    <div>
      <h1>Welcome to Meethive</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 30 mins</p>
      <p>If you did not create an account, no further action is required.</p>
      <p>Thank you!</p>
    </div>
    `;
  await resend.emails.send({
    from: "MeetHive <no-reply@resend.dev>",
    to: `${email}`,
    subject: `MeetHive Email Verification Link`,
    html: `${htmlContent}`,
  });
};

const sendResetPasswordEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const htmlContent = `
    <div>
      <h1>Password Reset Request</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetPasswordUrl}">Reset Password</a>
      <p>This link will expire in 30 mins</p>
      <p>If you did not request a password reset, no further action is required.</p>
      <p>Thank you!</p>
    </div>
    `;
  await resend.emails.send({
    from: "MeetHive <no-reply@resend.dev>",
    to: `${email}`,
    subject: `MeetHive Password Reset`,
    html: `${htmlContent}`,
  });
};
export { sendVerificationEmail, sendResetPasswordEmail };
