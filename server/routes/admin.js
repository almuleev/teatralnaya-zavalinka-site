const express = require("express");
const multer = require("multer");

const config = require("../config");
const { requireAuth, verifyCredentials } = require("../auth");
const {
  buildMulterStorage,
  dedupeUploadedFile,
  deleteUploadByUrl,
  getUploadUrl,
  readContent,
  writeContent
} = require("../storage");

const router = express.Router();

const imageUpload = multer({
  storage: buildMulterStorage(config.imagesDir),
  limits: { fileSize: 8 * 1024 * 1024 }
});

const documentUpload = multer({
  storage: buildMulterStorage(config.docsDir),
  limits: { fileSize: 20 * 1024 * 1024 }
});

const videoUpload = multer({
  storage: buildMulterStorage(config.videosDir),
  limits: { fileSize: 350 * 1024 * 1024 }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!verifyCredentials(username, password)) {
    return res.status(401).json({ error: "Неверный логин или пароль." });
  }

  req.session.isAuthenticated = true;
  req.session.username = username;

  return res.json({ ok: true, username });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/session", (req, res) => {
  res.json({
    authenticated: Boolean(req.session && req.session.isAuthenticated),
    username: req.session && req.session.username ? req.session.username : null
  });
});

router.get("/content", requireAuth, async (req, res, next) => {
  try {
    const content = await readContent();
    res.json(content);
  } catch (error) {
    next(error);
  }
});

router.put("/content", requireAuth, async (req, res, next) => {
  try {
    const payload = req.body;

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Некорректное содержимое запроса." });
    }

    const savedContent = await writeContent(payload);
    return res.json(savedContent);
  } catch (error) {
    next(error);
  }
});

router.post("/upload/image", requireAuth, imageUpload.single("file"), (req, res) => {
  return handleUploadedFile(req, res, config.imagesDir, "images");
});

router.post("/upload/document", requireAuth, documentUpload.single("file"), (req, res) => {
  return handleUploadedFile(req, res, config.docsDir, "docs");
});

router.post("/upload/video", requireAuth, videoUpload.single("file"), (req, res) => {
  return handleUploadedFile(req, res, config.videosDir, "videos");
});

router.delete("/upload", requireAuth, async (req, res, next) => {
  try {
    const { url } = req.body || {};

    if (!url) {
      return res.status(400).json({ error: "Не указан URL файла." });
    }

    const removed = await deleteUploadByUrl(url);
    return res.json({ ok: true, removed });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

async function handleUploadedFile(req, res, targetDirectory, uploadType) {
  if (!req.file) {
    return res.status(400).json({ error: "Файл не был загружен." });
  }

  try {
    const deduped = await dedupeUploadedFile(targetDirectory, req.file.filename);
    return res.json({
      ok: true,
      url: getUploadUrl(uploadType, deduped.filename),
      originalName: req.file.originalname,
      reused: deduped.reused
    });
  } catch (error) {
    return res.status(500).json({ error: "Не удалось обработать загруженный файл." });
  }
}

