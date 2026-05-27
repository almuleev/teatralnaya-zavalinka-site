const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const { spawn } = require("child_process");

const config = require("./config");
const IMAGE_VARIANT_DIR = "webp";

function sanitizeBaseName(input) {
  return (input || "file")
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "file";
}

function getUploadUrl(type, filename) {
  return `/uploads/${type}/${filename}`;
}

async function ensureProjectStructure() {
  await Promise.all([
    fsp.mkdir(config.dataDir, { recursive: true }),
    fsp.mkdir(config.docsDir, { recursive: true }),
    fsp.mkdir(config.imagesDir, { recursive: true }),
    fsp.mkdir(path.join(config.imagesDir, IMAGE_VARIANT_DIR), { recursive: true }),
    fsp.mkdir(config.videosDir, { recursive: true })
  ]);
}

async function readContent() {
  await ensureProjectStructure();

  const raw = await fsp.readFile(config.dataFile, "utf8");
  const normalized = raw.replace(/^\uFEFF/, "");
  return JSON.parse(normalized);
}

async function writeContent(content) {
  await ensureProjectStructure();

  const nextContent = {
    ...content,
    meta: {
      ...(content.meta || {}),
      updatedAt: new Date().toISOString()
    }
  };

  const tmpPath = `${config.dataFile}.tmp`;
  await fsp.writeFile(tmpPath, JSON.stringify(nextContent, null, 2), "utf8");
  await fsp.rename(tmpPath, config.dataFile);

  return nextContent;
}

function buildUploadFilename(originalName) {
  const ext = path.extname(originalName || "") || "";
  const base = sanitizeBaseName(path.basename(originalName || "file", ext));
  const stamp = Date.now();
  return `${base}-${stamp}${ext.toLowerCase()}`;
}

function buildMulterStorage(targetDirectory) {
  return multer.diskStorage({
    destination(req, file, callback) {
      fs.mkdir(targetDirectory, { recursive: true }, (error) => callback(error, targetDirectory));
    },
    filename(req, file, callback) {
      callback(null, buildUploadFilename(file.originalname));
    }
  });
}

function getImageVariantFilename(filename = "") {
  return `${path.basename(String(filename || ""))}.webp`;
}

function getImageVariantPath(filename = "") {
  return path.join(config.imagesDir, IMAGE_VARIANT_DIR, getImageVariantFilename(filename));
}

function getOptimizedImageUrl(url = "") {
  const normalizedUrl = String(url || "").trim();

  if (!/^\/uploads\/images\//.test(normalizedUrl)) {
    return normalizedUrl;
  }

  const sourceFilename = path.basename(normalizedUrl);
  const variantPath = getImageVariantPath(sourceFilename);
  if (!fs.existsSync(variantPath)) {
    return normalizedUrl;
  }

  return `/uploads/images/${IMAGE_VARIANT_DIR}/${getImageVariantFilename(sourceFilename)}`;
}

async function ensureOptimizedImageVariant(filename = "") {
  const sourceFilename = path.basename(String(filename || ""));

  if (!sourceFilename) {
    return { created: false, skipped: true };
  }

  const sourcePath = path.join(config.imagesDir, sourceFilename);
  const variantPath = getImageVariantPath(sourceFilename);

  try {
    const [sourceStat, variantStat] = await Promise.all([
      fsp.stat(sourcePath),
      fsp.stat(variantPath).catch(() => null)
    ]);

    if (variantStat && variantStat.mtimeMs >= sourceStat.mtimeMs) {
      return { created: false, reused: true, path: variantPath };
    }

    await fsp.mkdir(path.dirname(variantPath), { recursive: true });
    await convertImageToWebp(sourcePath, variantPath);
    return { created: true, path: variantPath };
  } catch (error) {
    return { created: false, path: variantPath, error };
  }
}

async function deleteOptimizedImageVariant(filename = "") {
  const variantPath = getImageVariantPath(filename);

  try {
    await fsp.unlink(variantPath);
    return true;
  } catch (error) {
    return false;
  }
}

function convertImageToWebp(sourcePath, targetPath) {
  return new Promise((resolve, reject) => {
    const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";
    const child = spawn(
      ffmpegPath,
      [
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        sourcePath,
        "-vf",
        "scale='min(1600,iw)':-2",
        "-c:v",
        "libwebp",
        "-compression_level",
        "6",
        "-q:v",
        "78",
        targetPath
      ],
      { stdio: ["ignore", "ignore", "pipe"] }
    );

    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr.trim() || `ffmpeg exited with code ${code}`));
    });
  });
}

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

async function dedupeUploadedFile(targetDirectory, uploadedFilename) {
  const uploadedPath = path.join(targetDirectory, uploadedFilename);
  const uploadedStat = await fsp.stat(uploadedPath);
  const uploadedHash = await hashFile(uploadedPath);
  const directoryEntries = await fsp.readdir(targetDirectory, { withFileTypes: true });

  for (const entry of directoryEntries) {
    if (!entry.isFile() || entry.name === uploadedFilename) {
      continue;
    }

    const candidatePath = path.join(targetDirectory, entry.name);
    const candidateStat = await fsp.stat(candidatePath);

    if (candidateStat.size !== uploadedStat.size) {
      continue;
    }

    const candidateHash = await hashFile(candidatePath);

    if (candidateHash === uploadedHash) {
      await fsp.unlink(uploadedPath);
      return { filename: entry.name, reused: true };
    }
  }

  return { filename: uploadedFilename, reused: false };
}

module.exports = {
  buildMulterStorage,
  dedupeUploadedFile,
  ensureProjectStructure,
  ensureOptimizedImageVariant,
  getUploadUrl,
  getOptimizedImageUrl,
  deleteOptimizedImageVariant,
  readContent,
  writeContent
};
