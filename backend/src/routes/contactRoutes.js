import express from "express";
import multer from "multer";
import { sendEmail } from "../utils/emailService.js";

const router = express.Router();

// Configure multer to hold file in memory
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @openapi
 * /api/contact:
 *   post:
 *     summary: Submit contact form
 *     description: Submits a contact form with an optional file attachment (e.g., resume).
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, email, subject, message]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       500:
 *         description: Server error or email failed to send
 */
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>New Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="margin-top: 20px; padding: 15px; border-left: 4px solid #FF6B00; background: #f9f9f9;">
          ${message ? message.replace(/\n/g, '<br/>') : ''}
        </div>
      </div>
    `;

    const mailOptions = {
      to: "shivkush512@gmail.com",
      subject: `FullPrep Notification: ${subject || 'New Message'}`,
      html,
    };

    // If there is an uploaded file, attach it
    if (req.file) {
      mailOptions.attachments = [
        {
          filename: req.file.originalname,
          content: req.file.buffer,
        },
      ];
    }

    const success = await sendEmail(mailOptions);

    if (success) {
      res.status(200).json({ success: true, message: "Email sent successfully" });
    } else {
      res.status(500).json({ success: false, message: "Failed to send email" });
    }
  } catch (error) {
    console.error("Contact API error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
