import { GoogleGenerativeAI } from "@google/generative-ai";
import AiChat from "../models/AiChat.js";
import User from "../models/User.js";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Retry helper for 503 high-demand errors
const generateWithRetry = async (prompt, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      const is503 = err.message?.includes("503") || err.message?.includes("high demand") || err.message?.includes("UNAVAILABLE");
      if (is503 && attempt < maxRetries) {
        console.warn(`Gemini 503 on attempt ${attempt}/${maxRetries}, retrying in 2s...`);
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        throw err;
      }
    }
  }
};

// Helper to check and increment usage limits
const checkLimit = async (user) => {
  if (user.role === "admin") return true;

  const now = new Date();
  const lastReset = new Date(user.aiHintsLastReset || 0);

  // Reset limits daily
  if (now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000) {
    user.aiHintsUsed = 0;
    user.aiHintsLastReset = now;
    await user.save({ validateBeforeSave: false });
  }

  const limit = user.subscriptionTier === "pro" ? 100 : 5;
  if (user.aiHintsUsed >= limit) {
    return false;
  }

  return true;
};

const incrementLimit = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { aiHintsUsed: 1 } });
};

/**
 * @desc    Get chat history for a problem
 * @route   GET /api/ai/chat/:problemId
 * @access  Private
 */
export const getChatHistory = async (req, res) => {
  const { problemId } = req.params;
  const chat = await AiChat.findOne({ user: req.user._id, problemExternalId: problemId });

  // Calculate current hints remaining
  const FREE_LIMIT = 5;
  const PRO_LIMIT = 100;
  const limit = req.user.subscriptionTier === "pro" ? PRO_LIMIT : FREE_LIMIT;
  const now = new Date();
  const lastReset = new Date(req.user.aiHintsLastReset || 0);
  const usedToday = now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000 ? 0 : (req.user.aiHintsUsed || 0);
  const hintsRemaining = req.user.subscriptionTier === "pro" ? "Unlimited" : Math.max(0, limit - usedToday);
  
  if (!chat) {
    return res.status(200).json({ success: true, data: { messages: [] }, hintsRemaining });
  }

  res.status(200).json({ success: true, data: chat, hintsRemaining });
};

/**
 * @desc    Send a message to AI
 * @route   POST /api/ai/chat/:problemId
 * @access  Private
 */
export const sendChatMessage = async (req, res) => {
  const { problemId } = req.params;
  const { text, userCode, language, problemContext } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, message: "Message text is required" });
  }

  // Check limits
  const canProceed = await checkLimit(req.user);
  if (!canProceed) {
    return res.status(403).json({
      success: false,
      message: "You have reached your daily limit for AI Hints. Please upgrade to Pro for more.",
      limitReached: true,
    });
  }

  // Find or create chat session
  let chat = await AiChat.findOne({ user: req.user._id, problemExternalId: problemId });
  if (!chat) {
    chat = new AiChat({
      user: req.user._id,
      title: `Chat for Problem ${problemId}`,
      problemExternalId: problemId,
      messages: [],
    });
  }

  // Add user message to DB
  chat.messages.push({
    sender: "user",
    text,
  });

  // Construct context for Gemini
  const systemPrompt = `
You are an expert programming mentor named FullPrep AI.
You are helping a student solve a coding problem.

Problem Context: ${problemContext || "Not provided"}
User's Language: ${language || "Not specified"}
User's Code So Far:
\`\`\`
${userCode || "No code provided"}
\`\`\`

The user is asking: "${text}"

RULES:
1. DO NOT give the direct answer or write the full solution code unless explicitly asked to "generate solution".
2. Guide them with hints, point out bugs, or explain the algorithmic approach.
3. Keep it brief, friendly, and educational.

You MUST respond strictly in the following JSON format:
{
  "text": "Your conversational response, hints, or explanation here (markdown supported).",
  "approach": ["Step 1 of the algorithm", "Step 2", "Step 3"], // Array of steps, or empty array if not applicable
  "code": "Any code snippet you want to share (optional, leave empty string if none)",
  "language": "Python/JS/etc (optional)",
  "complexity": {
    "time": "O(n) or similar, leave empty if not applicable",
    "space": "O(1) or similar, leave empty if not applicable"
  }
}
Respond ONLY with valid JSON. Do not include markdown \`\`\`json wrappers.`;

  try {
    // Generate AI Response (with retry on 503 high-demand)
    const result = await generateWithRetry(systemPrompt);
    let responseText = result.response.text().trim();
    
    // Sometimes Gemini wraps JSON in markdown block despite instructions
    if (responseText.startsWith("\`\`\`json")) {
      responseText = responseText.replace(/^\`\`\`json\n/, "").replace(/\n\`\`\`$/, "");
    }

    const aiData = JSON.parse(responseText);

    // Add assistant message to DB
    const assistantMsg = {
      sender: "assistant",
      text: aiData.text,
      approach: aiData.approach || [],
      code: aiData.code || "",
      language: aiData.language || "",
      complexity: aiData.complexity || { time: "", space: "" },
    };

    chat.messages.push(assistantMsg);
    await chat.save();

    // Increment usage limit and get updated count
    await incrementLimit(req.user._id);
    const freshUser = await User.findById(req.user._id).select("aiHintsUsed subscriptionTier");
    const FREE_LIMIT = 5;
    const PRO_LIMIT = 100;
    const limit = freshUser.subscriptionTier === "pro" ? PRO_LIMIT : FREE_LIMIT;
    const hintsRemaining = freshUser.subscriptionTier === "pro"
      ? "Unlimited"
      : Math.max(0, limit - freshUser.aiHintsUsed);

    res.status(200).json({
      success: true,
      message: assistantMsg,
      hintsRemaining,
    });

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      success: false,
      message: "The AI assistant encountered an error. Please try again.",
    });
  }
};
