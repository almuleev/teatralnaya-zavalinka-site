const fs = require("fs/promises");
const path = require("path");

const {
  renderAboutPage,
  renderContactsPage,
  renderDocumentsPage,
  renderHomePage
} = require("../server/render");

const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const outputDir = path.join(rootDir, "dist");

function previewBanner() {
  return `
    <div class="pages-preview-banner" role="status">
      Тестовая версия на GitHub Pages. Изменения здесь не влияют на основной сайт.
    </div>`;
}

function previewStyles() {
  return `<style>
    .pages-preview-banner {
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 10px 18px;
      background: #074f91;
      color: #fff;
      text-align: center;
      font: 600 14px/1.4 system-ui, sans-serif;
    }
  </style>`;
}

function rewritePageForStaticHosting(html, depth) {
  const prefix = depth === 0 ? "." : "..";

  return html
    .replace(/<!-- Yandex\.Metrika counter -->[\s\S]*?<\/script>/, "")
    .replace("</head>", `${previewStyles()}</head>`)
    .replace("<body>", `<body>${previewBanner()}`)
    .replace(/(href|src)="\/(assets|uploads)\//g, `$1="${prefix}/$2/`)
    .replace(/href="\/(home|info|docs|contacts)"/g, (_match, pageName) => {
      const target = pageName === "home" ? "" : `${pageName}/`;
      return `href="${prefix}/${target}"`;
    })
    .replace(/href="\/"/g, `href="${prefix}/"`);
}

async function writePage(relativeFile, html) {
  const destination = path.join(outputDir, relativeFile);
  const depth = relativeFile === "index.html" ? 0 : 1;
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, rewritePageForStaticHosting(html, depth), "utf8");
}

async function rewriteStaticCss() {
  const cssPath = path.join(outputDir, "assets", "css", "main.css");
  const css = await fs.readFile(cssPath, "utf8");
  await fs.writeFile(cssPath, css.replace(/url\("\/assets\/images\//g, 'url("../images/'), "utf8");
}

async function buildPreview() {
  const contentPath = path.join(rootDir, "data", "site-content.example.json");
  const content = JSON.parse(await fs.readFile(contentPath, "utf8"));

  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });
  await fs.cp(path.join(publicDir, "assets"), path.join(outputDir, "assets"), { recursive: true });
  await Promise.all([
    fs.rm(path.join(outputDir, "assets", "css", "admin.css"), { force: true }),
    fs.rm(path.join(outputDir, "assets", "js", "admin.js"), { force: true })
  ]);
  await fs.writeFile(path.join(outputDir, ".nojekyll"), "", "utf8");
  await rewriteStaticCss();

  await Promise.all([
    writePage("index.html", renderHomePage(content)),
    writePage(path.join("info", "index.html"), renderAboutPage(content)),
    writePage(path.join("docs", "index.html"), renderDocumentsPage(content)),
    writePage(path.join("contacts", "index.html"), renderContactsPage(content))
  ]);
}

buildPreview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
