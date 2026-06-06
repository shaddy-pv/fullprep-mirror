/**
 * @file emailService.js
 * @description Uses Nodemailer to send emails. 
 *              Currently configured for Gmail via SMTP.
 */

import nodemailer from "nodemailer";

/**
 * Sends an email using Nodemailer.
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body content
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️  Email skipped: SMTP_USER or SMTP_PASS missing in .env");
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail", // Or your preferred provider
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Use an App Password if using Gmail
      },
    });

    const mailOptions = {
      from: `"FullPrep Team" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  Email sent successfully to ${to} (${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌  Email sending failed for ${to}:`, error.message);
    return false;
  }
};

export default { sendEmail };
