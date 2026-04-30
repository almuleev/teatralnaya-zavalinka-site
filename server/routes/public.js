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

const renderWithContent = (renderer) => async (req, res, next) => {
  try {
    const content = await readContent();
    res.type("html").send(renderer(content));
  } catch (error) {
    next(error);
  }
};

router.get(["/", "/home"], renderWithContent(renderHomePage));
router.get("/info", renderWithContent(renderAboutPage));
router.get("/docs", renderWithContent(renderDocumentsPage));
router.get("/contacts", renderWithContent(renderContactsPage));

module.exports = router;
