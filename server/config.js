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
const isProduction = process.env.NODE_ENV === "production";

function getEnvironmentValue(name, developmentFallback) {
  const value = String(process.env[name] || "").trim();

  if (!value && isProduction) {
    throw new Error(`${name} must be set when NODE_ENV=production.`);
  }

  return value || developmentFallback;
}

function requireProductionStrength(name, value, minimumLength) {
  if (isProduction && value.length < minimumLength) {
    throw new Error(`${name} must be at least ${minimumLength} characters in production.`);
  }
}

function trimTrailingSlash(value) {
  return (value || "").replace(/\/+$/, "");
}

const sessionSecret = getEnvironmentValue("SESSION_SECRET", "development-session-secret");
const adminUsername = getEnvironmentValue("ADMIN_USERNAME", "demo-admin");
const adminPassword = getEnvironmentValue("ADMIN_PASSWORD", "demo-password");

requireProductionStrength("SESSION_SECRET", sessionSecret, 32);
requireProductionStrength("ADMIN_USERNAME", adminUsername, 3);
requireProductionStrength("ADMIN_PASSWORD", adminPassword, 12);

module.exports = {
  rootDir,
  publicDir,
  dataDir,
  docsDir,
  imagesDir,
  videosDir,
  dataFile: path.join(dataDir, "site-content.json"),
  port: Number(process.env.PORT || 3000),
  sessionSecret,
  adminUsername,
  adminPassword,
  publicSiteUrl: trimTrailingSlash(process.env.PUBLIC_SITE_URL || "http://localhost:3000")
};
