// Local / container server: serves the web page and the feedback API with no extra dependencies.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { catalogue, feedbackResponse } from "./lib/handler.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "public");
const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY = 200_000;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json" };

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "Content-Type": type });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error("too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (url.pathname === "/api/catalogue" && req.method === "GET") return send(res, 200, catalogue());
    if (url.pathname === "/api/feedback" && req.method === "POST") {
      let body;
      try {
        body = await readJson(req);
      } catch {
        return send(res, 400, { error: "The answer could not be read. Upload a smaller file or paste the text." });
      }
      const [status, payload] = await feedbackResponse(body);
      return send(res, status, payload);
    }
    if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
    const path = normalize(join(root, url.pathname === "/" ? "index.html" : url.pathname));
    if (!path.startsWith(root)) return send(res, 403, "Forbidden", "text/plain");
    const file = await readFile(path);
    send(res, 200, file, TYPES[extname(path)] || "application/octet-stream");
  } catch (err) {
    if (err.code === "ENOENT") return send(res, 404, "Not found", "text/plain");
    console.error(err);
    send(res, 500, { error: "Server error" });
  }
}).listen(PORT, () => console.log(`8-Mark Coach running at http://localhost:${PORT}`));
