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

function previewBanner(depth) {
  const adminUrl = depth === 0 ? "./admin/" : "../admin/";
  return `
    <div class="pages-preview-banner" role="status">
      Тестовая версия на GitHub Pages. Изменения здесь не влияют на основной сайт.
      <a href="${adminUrl}">Открыть демо-админку</a>
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
    .pages-preview-banner a { color: #fff; margin-left: 12px; text-decoration: underline; text-underline-offset: 3px; }
  </style>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderAdminPreview(content) {
  const siteName = escapeHtml(content.meta.siteName);
  const tagline = escapeHtml(content.meta.tagline);
  const heroTitle = escapeHtml(content.home.heroTitle);
  const aboutTitle = escapeHtml(content.about.heroTitle);

  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>Демо-админка | Театральная Завалинка</title>
    <link rel="icon" href="../assets/images/festival-favicon.png" type="image/png">
    <link rel="stylesheet" href="../assets/css/admin.css">
    <style>
      .preview-notice { margin: 0 0 20px; padding: 14px 18px; border: 1px solid #b9d9f8; border-radius: 16px; background: #edf7ff; color: #074f91; font-weight: 600; }
      .preview-notice strong { color: #003d75; }
      .preview-admin__section { display: none; }
      .preview-admin__section.is-active { display: block; }
      .preview-admin__details { margin-top: 16px; }
      .preview-admin__details summary { cursor: pointer; font-weight: 700; color: #075fc4; }
    </style>
  </head>
  <body class="admin-body">
    <header class="admin-header">
      <div class="admin-header__inner">
        <a class="admin-brand" href="../">
          <span class="admin-brand__mark"><img src="../assets/images/logo-main.png" alt="" width="56" height="56"></span>
          <span class="admin-brand__copy">
            <span class="admin-kicker">Демонстрация</span>
            <span class="admin-brand__title">Админка «Театральной Завалинки»</span>
            <span class="admin-brand__subtitle">Можно изучить интерфейс — настоящие данные недоступны.</span>
          </span>
        </a>
        <div class="admin-header__actions"><a class="admin-link" href="../">Открыть тестовый сайт</a></div>
      </div>
    </header>
    <main class="admin-shell">
      <section class="admin-app">
        <section class="toolbar">
          <div class="toolbar__copy">
            <p class="admin-kicker">Тестовый режим</p>
            <p class="toolbar__text">Эта админка размещена в GitHub Pages и не связана с сервером сайта.</p>
            <div class="toolbar__nav" aria-label="Разделы демо-админки">
              <button class="admin-nav__item is-active" type="button" data-preview-tab="site">Основное</button>
              <button class="admin-nav__item" type="button" data-preview-tab="home">Главная</button>
              <button class="admin-nav__item" type="button" data-preview-tab="about">О фестивале</button>
              <button class="admin-nav__item" type="button" data-preview-tab="documents">Документы</button>
              <button class="admin-nav__item" type="button" data-preview-tab="contacts">Контакты</button>
            </div>
          </div>
          <div class="toolbar__actions">
            <span class="admin-chip admin-chip--muted">Демо-данные</span>
            <button class="admin-button" type="button" data-preview-save>Проверить сохранение</button>
          </div>
        </section>
        <p class="preview-notice" data-preview-message><strong>Безопасный предпросмотр.</strong> Поля можно менять для проверки интерфейса, но ничего не будет сохранено.</p>

        <section class="preview-admin__section is-active" data-preview-section="site">
          <div class="section-card"><h2>Основные настройки</h2><div class="form-grid">
            <label class="field"><span>Название сайта</span><input value="${siteName}"></label>
            <label class="field"><span>Подзаголовок</span><input value="${tagline}"></label>
            <label class="field field--full"><span>Ссылка на форму заявки</span><input type="url" value="https://example.org/application"></label>
            <label class="field"><span>Пункт меню: Главная</span><input value="Главная"></label>
            <label class="field"><span>Пункт меню: О фестивале</span><input value="О фестивале"></label>
          </div></div>
        </section>
        <section class="preview-admin__section" data-preview-section="home">
          <div class="section-card"><h2>Главная страница</h2><div class="form-grid">
            <label class="field field--full"><span>Главный заголовок</span><input value="${heroTitle}"></label>
            <label class="field field--full"><span>Пояснение</span><textarea rows="4">Демонстрационные данные для проверки интерфейса.</textarea></label>
          </div><details class="preview-admin__details"><summary>Карточки участников</summary><p>В рабочей админке здесь добавляются и редактируются карточки жюри, экспертов, гостей и партнёров.</p></details></div>
        </section>
        <section class="preview-admin__section" data-preview-section="about">
          <div class="section-card"><h2>О фестивале</h2><div class="form-grid">
            <label class="field field--full"><span>Заголовок страницы</span><input value="${aboutTitle}"></label>
            <label class="field field--full"><span>Текст</span><textarea rows="5">В предпросмотре доступен только интерфейс. Рабочие материалы не публикуются на GitHub.</textarea></label>
          </div></div>
        </section>
        <section class="preview-admin__section" data-preview-section="documents">
          <div class="section-card"><h2>Документы</h2><p class="section-card__hint">Здесь можно проверить расположение элементов. Загрузка файлов в публичном предпросмотре отключена.</p><button class="admin-button admin-button--ghost" type="button" data-preview-action>Добавить документ</button></div>
        </section>
        <section class="preview-admin__section" data-preview-section="contacts">
          <div class="section-card"><h2>Контакты</h2><div class="form-grid">
            <label class="field"><span>Электронная почта</span><input type="email" value="festival@example.org"></label>
            <label class="field"><span>Телефон</span><input value="+7 (000) 000-00-00"></label>
            <label class="field field--full"><span>Адрес</span><textarea rows="3">Демонстрационный адрес</textarea></label>
          </div></div>
        </section>
      </section>
    </main>
    <script>
      const message = document.querySelector('[data-preview-message]');
      const showMessage = (text) => { message.textContent = text; };
      document.querySelectorAll('[data-preview-tab]').forEach((button) => button.addEventListener('click', () => {
        document.querySelectorAll('[data-preview-tab]').forEach((item) => item.classList.toggle('is-active', item === button));
        document.querySelectorAll('[data-preview-section]').forEach((section) => section.classList.toggle('is-active', section.dataset.previewSection === button.dataset.previewTab));
        showMessage('Открыт раздел «' + button.textContent + '». Это демонстрация: изменения не записываются.');
      }));
      document.querySelectorAll('[data-preview-save], [data-preview-action]').forEach((button) => button.addEventListener('click', () => {
        showMessage('Демо-режим: действие выполнено только для проверки интерфейса. Данные сайта не менялись.');
      }));
    </script>
  </body>
</html>`;
}

function rewritePageForStaticHosting(html, depth) {
  const prefix = depth === 0 ? "." : "..";

  return html
    .replace(/<!-- Yandex\.Metrika counter -->[\s\S]*?<\/script>/, "")
    .replace(/<noscript><div><img src="https:\/\/mc\.yandex\.ru[\s\S]*?<\/noscript>/, "")
    .replace("</head>", `${previewStyles()}</head>`)
    .replace(/<body([^>]*)>/, `<body$1>${previewBanner(depth)}`)
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
  await fs.rm(path.join(outputDir, "assets", "js", "admin.js"), { force: true });
  await fs.writeFile(path.join(outputDir, ".nojekyll"), "", "utf8");
  await rewriteStaticCss();

  await Promise.all([
    writePage("index.html", renderHomePage(content)),
    writePage(path.join("info", "index.html"), renderAboutPage(content)),
    writePage(path.join("docs", "index.html"), renderDocumentsPage(content)),
    writePage(path.join("contacts", "index.html"), renderContactsPage(content)),
    fs.mkdir(path.join(outputDir, "admin"), { recursive: true }).then(() =>
      fs.writeFile(path.join(outputDir, "admin", "index.html"), renderAdminPreview(content), "utf8")
    )
  ]);
}

buildPreview().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
