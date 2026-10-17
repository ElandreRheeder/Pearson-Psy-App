// Vercel serverless function: POST /api/feedback
import { feedbackResponse } from "../lib/handler.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const [status, payload] = await feedbackResponse(req.body);
  res.status(status).json(payload);
}
