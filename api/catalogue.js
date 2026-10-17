// Vercel serverless function: GET /api/catalogue
import { catalogue } from "../lib/handler.js";

export default function handler(req, res) {
  res.status(200).json(catalogue());
}
