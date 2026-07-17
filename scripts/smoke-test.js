const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const dataFile = path.join(rootDir, "data", "site-content.json");
const exampleDataFile = path.join(rootDir, "data", "site-content.example.json");
const createdDemoData = !fs.existsSync(dataFile);

if (createdDemoData) {
  fs.copyFileSync(exampleDataFile, dataFile);
}

const { createServer } = require("../server/server");
const { renderHomePage } = require("../server/render");

function verifyUnsafeUrlsAreRejected() {
  const demoContent = JSON.parse(fs.readFileSync(exampleDataFile, "utf8"));
  demoContent.links.applicationForm = "javascript:alert(document.domain)";
  demoContent.links.festivalRegulation = "data:text/html,<script>alert(1)</script>";

  const html = renderHomePage(demoContent);
  assert.doesNotMatch(html, /javascript:/i);
  assert.doesNotMatch(html, /data:text\/html/i);
}

async function request(baseUrl, pathname, options) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  return {
    response,
    body: await response.text()
  };
}

async function run() {
  verifyUnsafeUrlsAreRejected();

  const app = await createServer();
  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    listener.on("error", reject);
  });
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    for (const pathname of ["/home", "/info", "/docs", "/contacts", "/admin"]) {
      const { response, body } = await request(baseUrl, pathname);
      assert.equal(response.status, 200, `${pathname} should return 200`);
      assert.match(body, /<!doctype html>/i, `${pathname} should return HTML`);
      assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    }

    const unauthorized = await request(baseUrl, "/api/admin/content");
    assert.equal(unauthorized.response.status, 401);

    const crossOrigin = await request(baseUrl, "/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://example.invalid"
      },
      body: JSON.stringify({ username: "invalid", password: "invalid" })
    });
    assert.equal(crossOrigin.response.status, 403);

    const notFound = await request(baseUrl, "/missing-page");
    assert.equal(notFound.response.status, 404);

    console.log("Smoke tests passed.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (createdDemoData) {
      fs.rmSync(dataFile, { force: true });
    }
  });
