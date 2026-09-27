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
      position: relative;
      z-index: 81;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 6px 18px;
      background: #074f91;
      color: #fff;
      text-align: center;
      font: 600 13px/1.35 system-ui, sans-serif;
    }
    .pages-preview-banner a { color: #fff; text-decoration: underline; text-underline-offset: 3px; }
    @media (min-width: 861px) {
      .site-header__row { gap: 12px; min-height: 64px; }
      .brand { gap: 9px; }
      .brand__mark { width: 44px; height: 44px; }
      .brand__logo { width: 40px; height: 40px; }
      .brand__title { font-size: 0.94rem; white-space: nowrap; }
      .brand__subtitle { font-size: 0.76rem; white-space: nowrap; }
      .site-nav { gap: 8px; }
      .site-nav ul { gap: 0; }
      .site-nav a { min-height: 36px; padding: 7px 9px; white-space: nowrap; }
      .site-nav__actions { gap: 7px; }
      .site-nav__actions .button { min-height: 40px; padding: 8px 11px; white-space: nowrap; }
    }
    @media (max-width: 540px) {
      .pages-preview-banner { align-items: flex-start; flex-direction: column; gap: 2px; padding: 7px 14px; text-align: left; }
    }
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
      .preview-list { display: grid; gap: 14px; margin-top: 20px; }
      .preview-list__header { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
      .preview-list__header h3 { margin: 0; }
      .preview-editor { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--admin-border); }
      .preview-editor.is-hidden { display: none; }
      .preview-document__meta { margin: 4px 0 0; color: var(--admin-muted); }
      @media (max-width: 640px) { .preview-list__header { align-items: stretch; flex-direction: column; } }
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
          </div>
          <div class="preview-list" data-preview-list="card">
            <div class="preview-list__header"><h3>Карточки участников</h3><button class="admin-button admin-button--ghost" type="button" data-preview-add="card">Добавить карточку</button></div>
            <article class="item-card" data-preview-item="card"><div class="item-card__header"><div><h4 class="item-card__title" data-preview-title>Демонстрационный участник</h4><p class="item-card__meta" data-preview-meta>Член жюри</p></div><div class="item-card__actions"><button class="admin-button admin-button--ghost" type="button" data-preview-edit>Изменить</button></div></div><div class="preview-editor is-hidden"><div class="item-card__grid"><label class="field"><span>Имя</span><input data-preview-input="title" value="Демонстрационный участник"></label><label class="field"><span>Роль</span><input data-preview-input="meta" value="Член жюри"></label></div><div class="item-card__actions"><button class="admin-button" type="button" data-preview-apply>Применить в демо</button><button class="admin-button admin-button--ghost" type="button" data-preview-remove>Удалить</button></div></div></article>
            <article class="item-card" data-preview-item="card"><div class="item-card__header"><div><h4 class="item-card__title" data-preview-title>Демонстрационный эксперт</h4><p class="item-card__meta" data-preview-meta>Ведущий мастер-класса</p></div><div class="item-card__actions"><button class="admin-button admin-button--ghost" type="button" data-preview-edit>Изменить</button></div></div><div class="preview-editor is-hidden"><div class="item-card__grid"><label class="field"><span>Имя</span><input data-preview-input="title" value="Демонстрационный эксперт"></label><label class="field"><span>Роль</span><input data-preview-input="meta" value="Ведущий мастер-класса"></label></div><div class="item-card__actions"><button class="admin-button" type="button" data-preview-apply>Применить в демо</button><button class="admin-button admin-button--ghost" type="button" data-preview-remove>Удалить</button></div></div></article>
            <article class="item-card" data-preview-item="card"><div class="item-card__header"><div><h4 class="item-card__title" data-preview-title>Демонстрационный гость</h4><p class="item-card__meta" data-preview-meta>Гость фестиваля</p></div><div class="item-card__actions"><button class="admin-button admin-button--ghost" type="button" data-preview-edit>Изменить</button></div></div><div class="preview-editor is-hidden"><div class="item-card__grid"><label class="field"><span>Имя</span><input data-preview-input="title" value="Демонстрационный гость"></label><label class="field"><span>Роль</span><input data-preview-input="meta" value="Гость фестиваля"></label></div><div class="item-card__actions"><button class="admin-button" type="button" data-preview-apply>Применить в демо</button><button class="admin-button admin-button--ghost" type="button" data-preview-remove>Удалить</button></div></div></article>
          </div></div>
        </section>
        <section class="preview-admin__section" data-preview-section="about">
          <div class="section-card"><h2>О фестивале</h2><div class="form-grid">
            <label class="field field--full"><span>Заголовок страницы</span><input value="${aboutTitle}"></label>
            <label class="field field--full"><span>Текст</span><textarea rows="5">В предпросмотре доступен только интерфейс. Рабочие материалы не публикуются на GitHub.</textarea></label>
          </div></div>
        </section>
        <section class="preview-admin__section" data-preview-section="documents">
          <div class="section-card"><h2>Документы</h2><p class="section-card__hint">Здесь можно добавлять и редактировать демонстрационные записи. Загрузка рабочих файлов в публичном предпросмотре отключена.</p>
            <div class="preview-list" data-preview-list="document">
              <div class="preview-list__header"><h3>Список документов</h3><button class="admin-button admin-button--ghost" type="button" data-preview-add="document">Добавить документ</button></div>
              <article class="item-card" data-preview-item="document"><div class="item-card__header"><div><h4 class="item-card__title" data-preview-title>Демонстрационный документ</h4><p class="preview-document__meta" data-preview-meta>PDF · 2026</p></div><div class="item-card__actions"><button class="admin-button admin-button--ghost" type="button" data-preview-edit>Изменить</button></div></div><div class="preview-editor is-hidden"><div class="item-card__grid"><label class="field"><span>Название</span><input data-preview-input="title" value="Демонстрационный документ"></label><label class="field"><span>Тип и год</span><input data-preview-input="meta" value="PDF · 2026"></label></div><div class="item-card__actions"><button class="admin-button" type="button" data-preview-apply>Применить в демо</button><button class="admin-button admin-button--ghost" type="button" data-preview-remove>Удалить</button></div></div></article>
              <article class="item-card" data-preview-item="document"><div class="item-card__header"><div><h4 class="item-card__title" data-preview-title>Описание модели данных</h4><p class="preview-document__meta" data-preview-meta>Справочный материал · 2025</p></div><div class="item-card__actions"><button class="admin-button admin-button--ghost" type="button" data-preview-edit>Изменить</button></div></div><div class="preview-editor is-hidden"><div class="item-card__grid"><label class="field"><span>Название</span><input data-preview-input="title" value="Описание модели данных"></label><label class="field"><span>Тип и год</span><input data-preview-input="meta" value="Справочный материал · 2025"></label></div><div class="item-card__actions"><button class="admin-button" type="button" data-preview-apply>Применить в демо</button><button class="admin-button admin-button--ghost" type="button" data-preview-remove>Удалить</button></div></div></article>
              <article class="item-card" data-preview-item="document"><div class="item-card__header"><div><h4 class="item-card__title" data-preview-title>Демонстрационная программа</h4><p class="preview-document__meta" data-preview-meta>PDF · 2024</p></div><div class="item-card__actions"><button class="admin-button admin-button--ghost" type="button" data-preview-edit>Изменить</button></div></div><div class="preview-editor is-hidden"><div class="item-card__grid"><label class="field"><span>Название</span><input data-preview-input="title" value="Демонстрационная программа"></label><label class="field"><span>Тип и год</span><input data-preview-input="meta" value="PDF · 2024"></label></div><div class="item-card__actions"><button class="admin-button" type="button" data-preview-apply>Применить в демо</button><button class="admin-button admin-button--ghost" type="button" data-preview-remove>Удалить</button></div></div></article>
            </div>
          </div>
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
      document.querySelectorAll('[data-preview-save]').forEach((button) => button.addEventListener('click', () => {
        showMessage('Демо-режим: действие выполнено только для проверки интерфейса. Данные сайта не менялись.');
      }));
      const createItem = (kind) => {
        const item = document.createElement('article');
        const isDocument = kind === 'document';
        const title = isDocument ? 'Новый демонстрационный документ' : 'Новый демонстрационный участник';
        const meta = isDocument ? 'PDF · 2026' : 'Новая роль';
        item.className = 'item-card';
        item.dataset.previewItem = kind;
        item.innerHTML = '<div class="item-card__header"><div><h4 class="item-card__title" data-preview-title></h4><p class="item-card__meta" data-preview-meta></p></div><div class="item-card__actions"><button class="admin-button admin-button--ghost" type="button" data-preview-edit>Изменить</button></div></div><div class="preview-editor"><div class="item-card__grid"><label class="field"><span>' + (isDocument ? 'Название' : 'Имя') + '</span><input data-preview-input="title"></label><label class="field"><span>' + (isDocument ? 'Тип и год' : 'Роль') + '</span><input data-preview-input="meta"></label></div><div class="item-card__actions"><button class="admin-button" type="button" data-preview-apply>Применить в демо</button><button class="admin-button admin-button--ghost" type="button" data-preview-remove>Удалить</button></div></div>';
        item.querySelector('[data-preview-title]').textContent = title;
        item.querySelector('[data-preview-meta]').textContent = meta;
        item.querySelector('[data-preview-input="title"]').value = title;
        item.querySelector('[data-preview-input="meta"]').value = meta;
        return item;
      };
      document.addEventListener('click', (event) => {
        const addButton = event.target.closest('[data-preview-add]');
        if (addButton) {
          const kind = addButton.dataset.previewAdd;
          const list = addButton.closest('[data-preview-list]');
          list.querySelector('.preview-list__header').insertAdjacentElement('afterend', createItem(kind));
          showMessage(kind === 'document' ? 'Добавлен новый демонстрационный документ. Заполните поля и примените изменения.' : 'Добавлена новая демонстрационная карточка. Заполните поля и примените изменения.');
          return;
        }
        const item = event.target.closest('[data-preview-item]');
        if (!item) return;
        if (event.target.closest('[data-preview-edit]')) {
          item.querySelector('.preview-editor').classList.toggle('is-hidden');
          return;
        }
        if (event.target.closest('[data-preview-apply]')) {
          const title = item.querySelector('[data-preview-input="title"]').value.trim() || 'Без названия';
          const meta = item.querySelector('[data-preview-input="meta"]').value.trim() || 'Без описания';
          item.querySelector('[data-preview-title]').textContent = title;
          item.querySelector('[data-preview-meta]').textContent = meta;
          item.querySelector('.preview-editor').classList.add('is-hidden');
          showMessage('Изменения применены в демо-версии. После обновления страницы исходные данные восстановятся.');
          return;
        }
        if (event.target.closest('[data-preview-remove]')) {
          item.remove();
          showMessage('Элемент удалён только из текущей демонстрации. После обновления страницы он снова появится.');
        }
      });
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
