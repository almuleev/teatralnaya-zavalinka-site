const express = require("express");
const fsp = require("fs/promises");
const multer = require("multer");
const path = require("path");

const config = require("../config");
const { requireAuth, verifyCredentials } = require("../auth");
const {
  buildMulterStorage,
  dedupeUploadedFile,
  deleteOptimizedImageVariant,
  ensureOptimizedImageVariant,
  getUploadUrl,
  readContent,
  writeContent
} = require("../storage");

const router = express.Router();

const IMAGE_UPLOAD_LIMIT_BYTES = 10 * 1000 * 1000;
const DOCUMENT_UPLOAD_LIMIT_BYTES = 100 * 1000 * 1000;
const VIDEO_UPLOAD_LIMIT_BYTES = 1500 * 1000 * 1000;
const UPLOAD_REFERENCE_RE = /\/uploads\/(images|videos)\/([^"'\s?#)]+)/gi;

const imageUpload = multer({
  storage: buildMulterStorage(config.imagesDir),
  limits: { fileSize: IMAGE_UPLOAD_LIMIT_BYTES },
  fileFilter(req, file, cb) {
    cb(null, /^image\//i.test(file.mimetype));
  }
});

const documentUpload = multer({
  storage: buildMulterStorage(config.docsDir),
  limits: { fileSize: DOCUMENT_UPLOAD_LIMIT_BYTES },
  fileFilter(req, file, cb) {
    cb(null, /^(application\/(pdf|msword|vnd\.|zip|x-zip-compressed)|text\/(plain|csv))$/i.test(file.mimetype));
  }
});

const videoUpload = multer({
  storage: buildMulterStorage(config.videosDir),
  limits: { fileSize: VIDEO_UPLOAD_LIMIT_BYTES },
  fileFilter(req, file, cb) {
    cb(null, /^video\//i.test(file.mimetype));
  }
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

router.post("/upload/image", requireAuth, (req, res) => {
  return runUpload(
    req,
    res,
    imageUpload.single("file"),
    config.imagesDir,
    "images",
    "10 МБ"
  );
});

router.post("/upload/document", requireAuth, (req, res) => {
  return runUpload(
    req,
    res,
    documentUpload.single("file"),
    config.docsDir,
    "docs",
    "100 МБ"
  );
});

router.post("/upload/video", requireAuth, (req, res) => {
  return runUpload(
    req,
    res,
    videoUpload.single("file"),
    config.videosDir,
    "videos",
    "1,5 ГБ"
  );
});

router.post("/uploads/cleanup", requireAuth, async (req, res) => {
  try {
    const dryRun = req.body == null || req.body.dryRun !== false;
    const content = await readContent();
    const usedUploads = collectUsedUploadFilenames(content);

    const [imageFiles, videoFiles] = await Promise.all([
      listDirectoryFiles(config.imagesDir),
      listDirectoryFiles(config.videosDir)
    ]);

    const orphanImageFiles = imageFiles.filter((filename) => !usedUploads.images.has(filename));
    const orphanVideoFiles = videoFiles.filter((filename) => !usedUploads.videos.has(filename));

    const responsePayload = {
      ok: true,
      dryRun,
      summary: {
        images: {
          used: usedUploads.images.size,
          total: imageFiles.length,
          orphan: orphanImageFiles.length,
          deleted: 0,
          failed: 0
        },
        videos: {
          used: usedUploads.videos.size,
          total: videoFiles.length,
          orphan: orphanVideoFiles.length,
          deleted: 0,
          failed: 0
        },
        totalOrphanFiles: orphanImageFiles.length + orphanVideoFiles.length,
        totalDeletedFiles: 0,
        totalFailedFiles: 0
      },
      orphanFiles: {
        images: orphanImageFiles.map((filename) => getUploadUrl("images", filename)),
        videos: orphanVideoFiles.map((filename) => getUploadUrl("videos", filename))
      }
    };

    if (dryRun || responsePayload.summary.totalOrphanFiles === 0) {
      return res.json(responsePayload);
    }

    const deletionResult = await deleteOrphanFiles(orphanImageFiles, orphanVideoFiles);

    responsePayload.summary.images.deleted = deletionResult.images.deleted;
    responsePayload.summary.images.failed = deletionResult.images.failed;
    responsePayload.summary.videos.deleted = deletionResult.videos.deleted;
    responsePayload.summary.videos.failed = deletionResult.videos.failed;
    responsePayload.summary.totalDeletedFiles = deletionResult.images.deleted + deletionResult.videos.deleted;
    responsePayload.summary.totalFailedFiles = deletionResult.images.failed + deletionResult.videos.failed;
    responsePayload.deletedFiles = {
      images: deletionResult.images.deletedFiles.map((filename) => getUploadUrl("images", filename)),
      videos: deletionResult.videos.deletedFiles.map((filename) => getUploadUrl("videos", filename))
    };
    responsePayload.failedFiles = {
      images: deletionResult.images.failedFiles.map((filename) => getUploadUrl("images", filename)),
      videos: deletionResult.videos.failedFiles.map((filename) => getUploadUrl("videos", filename))
    };

    return res.json(responsePayload);
  } catch (error) {
    return res.status(500).json({ error: "Не удалось выполнить очистку медиафайлов." });
  }
});

module.exports = router;

function runUpload(req, res, uploadMiddleware, targetDirectory, uploadType, limitLabel) {
  uploadMiddleware(req, res, (error) => {
    if (error) {
      return handleUploadError(res, error, limitLabel);
    }

    return handleUploadedFile(req, res, targetDirectory, uploadType);
  });
}

function handleUploadError(res, error, limitLabel) {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: `Файл слишком большой. Максимум: ${limitLabel}.` });
    }

    return res.status(400).json({ error: "Не удалось загрузить файл. Проверьте формат и размер." });
  }

  return res.status(500).json({ error: "Не удалось загрузить файл. Попробуйте ещё раз." });
}

async function handleUploadedFile(req, res, targetDirectory, uploadType) {
  if (!req.file) {
    return res.status(400).json({ error: "Файл не был загружен." });
  }

  try {
    const deduped = await dedupeUploadedFile(targetDirectory, req.file.filename);

    if (uploadType === "images") {
      const optimizationResult = await ensureOptimizedImageVariant(deduped.filename);
      if (optimizationResult.error) {
        console.warn("Image optimization failed:", optimizationResult.error.message);
      }
    }

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

function collectUsedUploadFilenames(content) {
  const usedUploads = {
    images: new Set(),
    videos: new Set()
  };

  walkContentTree(content, (value) => {
    if (typeof value !== "string") {
      return;
    }

    for (const match of value.matchAll(UPLOAD_REFERENCE_RE)) {
      const filename = normalizeUploadFilename(match[2]);

      if (filename && usedUploads[match[1]]) {
        usedUploads[match[1]].add(filename);
      }
    }
  });

  return usedUploads;
}

function walkContentTree(value, visitor) {
  if (value == null) {
    return;
  }

  if (typeof value === "string") {
    visitor(value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => walkContentTree(item, visitor));
    return;
  }

  if (typeof value === "object") {
    Object.values(value).forEach((item) => walkContentTree(item, visitor));
  }
}

function normalizeUploadFilename(rawValue = "") {
  const decoded = safeDecodeURIComponent(String(rawValue || ""));
  const trimmed = decoded.trim();

  if (!trimmed) {
    return "";
  }

  return path.basename(trimmed);
}

function safeDecodeURIComponent(value = "") {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

async function listDirectoryFiles(directoryPath) {
  const entries = await fsp.readdir(directoryPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
    .map((entry) => entry.name);
}

async function deleteOrphanFiles(orphanImageFiles, orphanVideoFiles) {
  const deletionResult = {
    images: { deleted: 0, failed: 0, deletedFiles: [], failedFiles: [] },
    videos: { deleted: 0, failed: 0, deletedFiles: [], failedFiles: [] }
  };

  await deleteFilesByType(config.imagesDir, orphanImageFiles, deletionResult.images, deleteOptimizedImageVariant);
  await deleteFilesByType(config.videosDir, orphanVideoFiles, deletionResult.videos);

  return deletionResult;
}

async function deleteFilesByType(directoryPath, filenames, resultBucket, afterDelete) {
  for (const filename of filenames) {
    const filePath = path.join(directoryPath, filename);

    try {
      await fsp.unlink(filePath);
      if (typeof afterDelete === "function") {
        await afterDelete(filename);
      }
      resultBucket.deleted += 1;
      resultBucket.deletedFiles.push(filename);
    } catch (error) {
      resultBucket.failed += 1;
      resultBucket.failedFiles.push(filename);
    }
  }
}
