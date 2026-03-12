/**
 * server.js  —  Bites & More image API
 *
 * Endpoints:
 *   POST   /api/upload          multipart/form-data { image: File }
 *                               → { url: "/uploads/gallery/<filename>" }
 *
 *   DELETE /api/upload/:filename
 *                               → { ok: true }
 *
 *   GET    /uploads/gallery/*   static file serving (images)
 *
 * Run:  node server.js
 * Default port: 3001  (Vite dev proxy forwards /api → 3001)
 */

import express        from "express";
import multer         from "multer";
import fs             from "fs";
import path           from "path";
import { fileURLToPath } from "url";
import cors           from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ── upload directory ── */
const CATEGORIES = ["gallery", "hero", "specialty", "feature", "menu", "about", "team"];
const UPLOAD_BASE = path.join(__dirname, "public", "uploads");
CATEGORIES.forEach(cat => fs.mkdirSync(path.join(UPLOAD_BASE, cat), { recursive: true }));

/* ── multer: disk storage, preserve extension ── */
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const cat = CATEGORIES.includes(req.body?.category) ? req.body.category : "gallery";
    cb(null, path.join(UPLOAD_BASE, cat));
  },
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase() || ".jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const app = express();

/* ── CORS: allow Vite dev server + Vercel production domain ── */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  // Add your Vercel domain(s) here — also configurable via ALLOWED_ORIGINS env var
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Render health checks) and listed origins
    if (!origin || ALLOWED_ORIGINS.some(o => origin.startsWith(o.trim()))) {
      cb(null, true);
    } else {
      cb(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ["GET", "POST", "DELETE"],
}));

/* ── serve all uploaded images as static files ── */
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

/* ── POST /api/upload ── */
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file received" });
  const cat = CATEGORIES.includes(req.body?.category) ? req.body.category : "gallery";
  const url = `/uploads/${cat}/${req.file.filename}`;
  res.json({ url, filename: req.file.filename, category: cat });
});

/* ── DELETE /api/upload/:filename ── */
app.delete("/api/upload/:filename", (req, res) => {
  const filename = path.basename(req.params.filename); // strip any path traversal

  // Search across all category subfolders
  let filepath = null;
  for (const cat of CATEGORIES) {
    const candidate = path.join(UPLOAD_BASE, cat, filename);
    if (fs.existsSync(candidate)) { filepath = candidate; break; }
  }

  if (!filepath) return res.status(404).json({ error: "File not found" });

  try {
    fs.unlinkSync(filepath);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Could not delete file" });
  }
});

/* ── error handler ── */
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🍽️  Bites & More image server running on http://localhost:${PORT}`);
  console.log(`   Uploads saved to: ${UPLOAD_BASE}/<category>/\n`);
});
