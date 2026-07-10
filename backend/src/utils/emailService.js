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
export const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    if (process.env.NODE_ENV === "test" || process.env.FAST_BCRYPT === "true" || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️  Email skipped: running in test/dev mode or SMTP credentials missing.");
      return true; // Return true to indicate successful handoff without blocking
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Use an App Password if using Gmail
      },
      connectionTimeout: 5000, // Fail after 5 seconds instead of hanging
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    const mailOptions = {
      from: `"FullPrep Team" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments,
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
