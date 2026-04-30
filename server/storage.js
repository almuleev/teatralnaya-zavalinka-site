const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");

const config = require("./config");

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

function isUploadUrl(url) {
  return typeof url === "string" && /^\/uploads\/(docs|images|videos)\//.test(url);
}

function resolveUploadPath(url) {
  if (!isUploadUrl(url)) {
    return null;
  }

  const relativePath = url.replace(/^\/+/, "");
  const absolutePath = path.resolve(config.publicDir, relativePath);

  if (!absolutePath.startsWith(config.publicDir)) {
    return null;
  }

  return absolutePath;
}

async function ensureProjectStructure() {
  await Promise.all([
    fsp.mkdir(config.dataDir, { recursive: true }),
    fsp.mkdir(config.docsDir, { recursive: true }),
    fsp.mkdir(config.imagesDir, { recursive: true }),
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

async function deleteUploadByUrl(url) {
  const filePath = resolveUploadPath(url);

  if (!filePath) {
    return false;
  }

  try {
    await fsp.unlink(filePath);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
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
  deleteUploadByUrl,
  ensureProjectStructure,
  getUploadUrl,
  isUploadUrl,
  readContent,
  sanitizeBaseName,
  writeContent
};
