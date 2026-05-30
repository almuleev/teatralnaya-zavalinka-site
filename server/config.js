const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const dataDir = path.join(rootDir, "data");
const uploadsDir = path.join(publicDir, "uploads");
const docsDir = path.join(uploadsDir, "docs");
const imagesDir = path.join(uploadsDir, "images");
const videosDir = path.join(uploadsDir, "videos");

function trimTrailingSlash(value) {
  return (value || "").replace(/\/+$/, "");
}

module.exports = {
  rootDir,
  publicDir,
  dataDir,
  docsDir,
  imagesDir,
  videosDir,
  dataFile: path.join(dataDir, "site-content.json"),
  port: Number(process.env.PORT || 3000),
  sessionSecret: process.env.SESSION_SECRET || "change-me-please",
  adminUsername: process.env.ADMIN_USERNAME || "manager",
  adminPassword: process.env.ADMIN_PASSWORD || "change-me-too",
  publicSiteUrl: trimTrailingSlash(process.env.PUBLIC_SITE_URL || "http://localhost:3000")
};
