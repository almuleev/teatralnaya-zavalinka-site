const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

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
  return {
    destination(req, file, callback) {
      fs.mkdir(targetDirectory, { recursive: true }, (error) => callback(error, targetDirectory));
    },
    filename(req, file, callback) {
      callback(null, buildUploadFilename(file.originalname));
    }
  };
}

module.exports = {
  buildMulterStorage,
  deleteUploadByUrl,
  ensureProjectStructure,
  getUploadUrl,
  isUploadUrl,
  readContent,
  sanitizeBaseName,
  writeContent
};
