const express = require("express");
const path = require("path");

const { readContent } = require("../storage");
const {
  renderAboutPage,
  renderContactsPage,
  renderDocumentsPage,
  renderHomePage
} = require("../render");

const router = express.Router();

router.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "public", "admin.html"));
});

router.get("/api/public/content", async (req, res, next) => {
  try {
    const content = await readContent();
    res.json(content);
  } catch (error) {
    next(error);
  }
});

router.get(["/", "/home"], async (req, res, next) => {
  try {
    const content = await readContent();
    res.type("html").send(renderHomePage(content));
  } catch (error) {
    next(error);
  }
});

router.get("/info", async (req, res, next) => {
  try {
    const content = await readContent();
    res.type("html").send(renderAboutPage(content));
  } catch (error) {
    next(error);
  }
});

router.get("/docs", async (req, res, next) => {
  try {
    const content = await readContent();
    res.type("html").send(renderDocumentsPage(content));
  } catch (error) {
    next(error);
  }
});

router.get("/contacts", async (req, res, next) => {
  try {
    const content = await readContent();
    res.type("html").send(renderContactsPage(content));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
