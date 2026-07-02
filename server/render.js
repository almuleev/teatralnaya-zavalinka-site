const config = require("./config");

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value);
}

function safeUrl(value = "") {
  if (!value) {
    return "#";
  }

  return escapeAttribute(value);
}

function pageUrl(pathname) {
  if (!config.publicSiteUrl) {
    return pathname;
  }

  return `${config.publicSiteUrl}${pathname === "/" ? "" : pathname}`;
}

function normalizePhoneCopy(value = "") {
  const digits = String(value || "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.length === 11 && digits.startsWith("7")) {
    return `8${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    return `8${digits}`;
  }

  return digits;
}

function isLikelyEmail(value = "") {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return false;
  }

  const normalized = /^mailto:/i.test(trimmed) ? trimmed.replace(/^mailto:/i, "") : trimmed;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

function isLikelyPhone(value = "") {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return false;
  }

  if (/^tel:/i.test(trimmed)) {
    return true;
  }

  if (/^(https?:\/\/|\/\/|www\.|\/)/i.test(trimmed) || trimmed.includes("@")) {
    return false;
  }

  if (/[a-zа-я]/i.test(trimmed)) {
    return false;
  }

  const digitsOnly = trimmed.replace(/\D/g, "");
  return digitsOnly.length >= 5 && /^[+\d()\s.-]+$/.test(trimmed);
}

function normalizeActionLink(value = "") {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return "";
  }

  if (/^(javascript:|data:|vbscript:)/i.test(trimmed)) {
    return "";
  }

  if (/^(mailto:|tel:)/i.test(trimmed)) {
    return "";
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return trimmed;
  }

  if (/^\/\//.test(trimmed)) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  if (isLikelyEmail(trimmed) || isLikelyPhone(trimmed)) {
    return "";
  }

  if (!/\s/.test(trimmed) && (trimmed.includes(".") || trimmed.includes("/"))) {
    return `https://${trimmed}`;
  }

  return "";
}

function renderActionLink(label, url, className = "contact-action") {
  const classes = String(className || "contact-action").trim();
  const isWebUrl = /^https?:\/\//i.test(url);
  const targetAttribute = isWebUrl ? ' target="_blank" rel="noreferrer"' : "";

  return `<a class="${escapeAttribute(classes)}" href="${safeUrl(url)}"${targetAttribute}>${escapeHtml(label)}</a>`;
}

function renderPhoneAction(phone = "", className = "contact-action") {
  if (!phone) {
    return "";
  }

  const phoneText = String(phone || "").trim();
  const actionLink = isLikelyPhone(phoneText) || isLikelyEmail(phoneText) ? "" : normalizeActionLink(phoneText);
  if (actionLink) {
    return renderActionLink(phoneText, actionLink, className);
  }

  const normalizedPhone = normalizePhoneCopy(phoneText);
  const phoneToCopy = normalizedPhone || phoneText;
  const classes = String(className || "contact-action").trim();

  return `<button type="button" class="${escapeAttribute(classes)}" data-copy-phone="${escapeAttribute(phoneToCopy)}" aria-label="${escapeAttribute(`Скопировать номер ${phoneToCopy}`)}">${escapeHtml(phoneText)}</button>`;
}

function renderEmailAction(email = "", className = "contact-action") {
  if (!email) {
    return "";
  }

  const emailText = String(email || "").trim();
  const actionLink = isLikelyEmail(emailText) || isLikelyPhone(emailText) ? "" : normalizeActionLink(emailText);
  if (actionLink) {
    return renderActionLink(emailText, actionLink, className);
  }

  const classes = String(className || "contact-action").trim();

  return `<button type="button" class="${escapeAttribute(classes)}" data-copy-email="${escapeAttribute(emailText)}" aria-label="${escapeAttribute(`Скопировать email ${emailText}`)}">${escapeHtml(emailText)}</button>`;
}

function initials(value = "") {
  const letters = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0] || "")
    .join("");

  return escapeHtml(letters || "ТЗ");
}

const { getOptimizedImageUrl } = require("./storage");

function renderImage(item, className = "card__image") {
  if (item && item.image) {
    const originalUrl = String(item.image || "").trim();
    const optimizedUrl = getOptimizedImageUrl(originalUrl);
    const altText = escapeAttribute(item.name || item.title || "Изображение");
    const imgMarkup = `<img class="${className}" src="${safeUrl(originalUrl)}" alt="${altText}" loading="lazy" decoding="async" fetchpriority="low">`;

    if (optimizedUrl !== originalUrl) {
      return `<picture class="${className}"><source srcset="${safeUrl(optimizedUrl)}" type="image/webp">${imgMarkup}</picture>`;
    }

    return imgMarkup;
  }

  return `<div class="${className} ${className}--placeholder" aria-hidden="true">${initials(item && (item.name || item.title))}</div>`;
}

function renderMeta(description) {
  return escapeHtml(description || "");
}

function renderFormattedText(value = "") {
  const text = String(value || "");

  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/gs, "<strong>$1</strong>")
    .replace(/__(.+?)__/gs, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

function getByPath(source, path) {
  return String(path || "")
    .split(".")
    .filter(Boolean)
    .reduce((current, key) => (current && current[key] !== undefined ? current[key] : undefined), source);
}

function text(content, path, fallback = "") {
  const value = getByPath(content, path);
  return value == null || value === "" ? fallback : value;
}

function configuredText(content, path, fallback = "") {
  const value = getByPath(content, path);
  return value == null ? fallback : value;
}

function sectionText(content, key, field, fallback = "") {
  return text(content, `sections.${key}.${field}`, fallback);
}

function configuredSectionText(content, key, field, fallback = "") {
  return configuredText(content, `sections.${key}.${field}`, fallback);
}

function contactText(content, field, fallback = "") {
  const value = content.contacts && content.contacts[field];
  const legacyValue = content.meta && content.meta[field];
  return value == null || value === "" ? legacyValue || fallback : value;
}

function renderHead(content, pageTitle, description, pathname) {
  const title = pageTitle ? `${escapeHtml(pageTitle)} | ${escapeHtml(content.meta.siteName)}` : escapeHtml(content.meta.siteName);
  const metaDescription = renderMeta(description);
  const url = pageUrl(pathname);
  const ogImage = `${config.publicSiteUrl}/assets/images/logo-square.jpg`;

  return `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${metaDescription}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${metaDescription}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${escapeAttribute(url)}">
    <meta property="og:image" content="${escapeAttribute(ogImage)}">
    <link rel="icon" href="/assets/images/festival-favicon.png" type="image/png">
  `;
}

function renderNavigation(content, activePath) {
  const links = content.links || {};
  const items = [
    { href: "/home", label: text(content, "ui.navHome", "Главная") },
    { href: "/info", label: text(content, "ui.navAbout", "О фестивале") },
    { href: "/docs", label: text(content, "ui.navDocs", "Документы") },
    { href: "/contacts", label: text(content, "ui.navContacts", "Контакты") }
  ];

  const navItems = items
    .map((item) => {
      const active = activePath === item.href || (item.href === "/home" && activePath === "/");
      return `<li><a href="${item.href}"${active ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a></li>`;
    })
    .join("");

  return `
    <header class="site-header">
      <a class="skip-link" href="#main-content">${escapeHtml(text(content, "ui.skipLinkLabel", "Перейти к содержанию"))}</a>
      <div class="container site-header__row">
        <a class="brand" href="/home" aria-label="${escapeAttribute(text(content, "ui.brandAriaLabel", "На главную"))}">
          <span class="brand__mark">
            <img class="brand__logo" src="/assets/images/logo-main.png" alt="" width="52" height="52">
          </span>
          <span class="brand__text">
            <span class="brand__title">${escapeHtml(content.meta.siteName)}</span>
            <span class="brand__subtitle">${escapeHtml(text(content, "ui.brandSubtitle", "Официальный сайт фестиваля"))}</span>
          </span>
        </a>

        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" data-menu-toggle>
          ${escapeHtml(text(content, "ui.menuLabel", "Меню"))}
        </button>

        <nav id="primary-nav" class="site-nav" aria-label="${escapeAttribute(text(content, "ui.primaryNavLabel", "Основная навигация"))}" data-menu>
          <ul>${navItems}</ul>
          <div class="site-nav__actions">
            <a class="button button--ghost" href="${safeUrl(links.festivalRegulation)}" target="_blank" rel="noreferrer">${escapeHtml(text(content, "ui.headerRegulationLabel", "Положение"))}</a>
            <a class="button" href="${safeUrl(links.applicationForm)}" target="_blank" rel="noreferrer">${escapeHtml(text(content, "ui.headerApplicationLabel", "Подать заявку"))}</a>
          </div>
        </nav>
      </div>
    </header>
  `;
}

function renderFooter(content) {
  const socials = (content.contacts.socials || [])
    .map((item) => `<a class="social-pill" href="${safeUrl(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>`)
    .join("");
  const creatorName = content.meta.creatorName || "";
  const creatorTelegram = content.meta.creatorTelegram || "";
  const creatorEmail = content.meta.creatorEmail || "";
  const creatorContactLabel = content.meta.creatorContactLabel || "";
  const creatorContactUrl = content.meta.creatorContactUrl || "";
  const creatorLinks = [];

  if (creatorTelegram) {
    creatorLinks.push(
      `<a href="${safeUrl(creatorTelegram)}" target="_blank" rel="noreferrer">Telegram</a>`
    );
  }

  if (creatorEmail) {
    creatorLinks.push(
      renderEmailAction(creatorEmail)
    );
  }

  if (creatorContactLabel && creatorContactUrl) {
    creatorLinks.push(
      `<a href="${safeUrl(creatorContactUrl)}" target="_blank" rel="noreferrer">${escapeHtml(creatorContactLabel)}</a>`
    );
  }

  const creatorMarkup = creatorName
    ? `<div class="site-footer__credit">
        <p class="site-footer__credit-line">${escapeHtml(text(content, "ui.footerCreatorPrefix", "Сайт разработал"))} ${escapeHtml(creatorName)}</p>
        ${
          creatorLinks.length
            ? `<p class="site-footer__credit-links">${creatorLinks.join(' <span aria-hidden="true">•</span> ')}</p>`
            : ""
        }
      </div>`
    : "";

  return `
    <footer class="site-footer">
      <div class="container site-footer__grid">
        <div>
          <div class="site-footer__brand-row">
            <img class="site-footer__logo" src="/assets/images/logo-main.png" alt="" width="56" height="56">
            <div class="site-footer__brand-copy">
              <p class="site-footer__brand">${escapeHtml(content.meta.siteName)}</p>
              <p class="site-footer__text">${escapeHtml(content.meta.tagline)}</p>
            </div>
          </div>
        </div>
        <div>
          <p class="site-footer__heading">${escapeHtml(text(content, "ui.footerNavigationTitle", "Навигация"))}</p>
          <div class="site-footer__links">
            <a href="/home">${escapeHtml(text(content, "ui.navHome", "Главная"))}</a>
            <a href="/info">${escapeHtml(text(content, "ui.navAbout", "О фестивале"))}</a>
            <a href="/docs">${escapeHtml(text(content, "ui.navDocs", "Документы"))}</a>
            <a href="/contacts">${escapeHtml(text(content, "ui.navContacts", "Контакты"))}</a>
          </div>
        </div>
        <div>
          <p class="site-footer__heading">${escapeHtml(text(content, "ui.footerContactsTitle", "Связь"))}</p>
          <div class="site-footer__links">
            ${renderEmailAction(content.contacts.email, "site-footer__link-action")}
            ${renderPhoneAction(content.contacts.phone, "site-footer__link-action")}
          </div>
          <div class="social-row">${socials}</div>
          ${creatorMarkup}
        </div>
      </div>
    </footer>
  `;
}

function renderLayout(content, options) {
  const { activePath, pageTitle, description, bodyClass = "", body } = options;

  return `<!doctype html>
<html lang="ru">
  <head>
    ${renderHead(content, pageTitle, description, activePath)}
    <link rel="stylesheet" href="/assets/css/main.css?v=20260528-1">
    <script defer src="/assets/js/site.js?v=20260702-1"></script>
  </head>
  <body class="${bodyClass}">
    ${renderNavigation(content, activePath)}
    <main id="main-content">
      ${body}
    </main>
    ${renderFooter(content)}
  </body>
</html>`;
}

function renderHero(content) {
  const heroEyebrow = configuredText(content, "ui.homeHeroEyebrow", "Фестиваль 2025");

  return `
    <section class="hero">
      <div class="container hero__layout">
        <div class="hero__content">
          ${heroEyebrow ? `<span class="eyebrow">${escapeHtml(heroEyebrow)}</span>` : ""}
          <h1>${escapeHtml(content.home.heroTitle)}</h1>
          <p class="hero__subtitle">${escapeHtml(content.home.heroSubtitle)}</p>
          <p class="hero__lead">${renderFormattedText(content.home.heroLead)}</p>
          <div class="hero__actions">
            <a class="button" href="${safeUrl(content.links.applicationForm)}" target="_blank" rel="noreferrer">${escapeHtml(text(content, "ui.heroApplicationLabel", "Подать заявку"))}</a>
            <a class="button button--ghost" href="${safeUrl(content.links.festivalRegulation)}" target="_blank" rel="noreferrer">${escapeHtml(text(content, "ui.heroRegulationLabel", "Положение о фестивале"))}</a>
          </div>
        </div>
        <div class="hero__panel">
          <div class="hero-card">
            <span class="eyebrow">${escapeHtml(content.home.descriptionTitle || "Ключевая информация")}</span>
            <p>${renderFormattedText(content.home.descriptionText)}</p>
          </div>
          <div class="hero-note">
            <strong>${escapeHtml(text(content, "ui.heroContactLabel", "Быстрый контакт:"))}</strong>
            ${renderPhoneAction(content.contacts.phone)}
            ${renderEmailAction(content.contacts.email)}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderApplicationGuideSection(home) {
  const title = home.applicationGuideTitle || "Инструкция по подаче заявки";
  const text =
    home.applicationGuideText ||
    "Видеоинструкция по заполнению и отправке заявки на участие в фестивале.";
  const videoUrl = home.applicationGuideVideoUrl || "";
  const buttonLabel = home.applicationGuideButtonLabel || "Смотреть видеоинструкцию";
  const action = videoUrl
    ? `<a class="button" href="${safeUrl(videoUrl)}" target="_blank" rel="noreferrer">${escapeHtml(buttonLabel)}</a>`
    : `<span class="button button--disabled" aria-disabled="true">${escapeHtml(buttonLabel)}</span>`;

  return `
    <section class="section section--compact">
      <div class="container">
        <div class="cta-panel cta-panel--guide">
          <div>
            <h3>${escapeHtml(title)}</h3>
            <p>${renderFormattedText(text)}</p>
          </div>
          <div class="cta-panel__actions">
            ${action}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderStageSection(content) {
  const cards = (content.home.stages || [])
    .map(
      (stage) => `
        <article class="timeline-card">
          <span class="timeline-card__meta">${escapeHtml(stage.meta)}</span>
          <h3>${escapeHtml(stage.title)}</h3>
          <p>${renderFormattedText(stage.description)}</p>
        </article>
      `
    )
    .join("");
  const stagesEyebrow = configuredSectionText(content, "homeStages", "eyebrow", "Этапы фестиваля");

  return `
    <section class="section section--light">
      <div class="container">
        <div class="section-heading">
          ${stagesEyebrow ? `<span class="eyebrow">${escapeHtml(stagesEyebrow)}</span>` : ""}
          <h2>${escapeHtml(sectionText(content, "homeStages", "title", "Календарь участия"))}</h2>
          <p>${renderFormattedText(sectionText(content, "homeStages", "description", "Основные сроки и формат проведения фестиваля «Театральная Завалинка 2025»."))}</p>
        </div>
        <div class="timeline-grid">
          ${cards}
        </div>
      </div>
    </section>
  `;
}

function renderFactsSection(content) {
  const cards = (content.home.facts || [])
    .map(
      (item) => `
        <article class="fact-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${renderFormattedText(item.text)}</p>
        </article>
      `
    )
    .join("");
  const participationEyebrow = configuredSectionText(content, "homeParticipation", "eyebrow", "Условия участия");

  return `
    <section class="section">
      <div class="container">
        <div class="section-heading">
          ${participationEyebrow ? `<span class="eyebrow">${escapeHtml(participationEyebrow)}</span>` : ""}
          <h2>${escapeHtml(sectionText(content, "homeParticipation", "title", "Что важно знать участникам"))}</h2>
          ${sectionText(content, "homeParticipation", "description") ? `<p>${renderFormattedText(sectionText(content, "homeParticipation", "description"))}</p>` : ""}
        </div>
        <div class="facts-grid">
          ${cards}
        </div>
      </div>
    </section>
  `;
}

function buildWorkshopLeaders(content) {
  return (content.collections && content.collections.experts) || [];
}

function renderProgramsOverviewSection(content) {
  const programs = Array.isArray(content.home.programs) && content.home.programs.length
    ? content.home.programs
    : [
        {
          title: "Конкурсная программа",
          description: "Конкурсные показы спектаклей, экспертная оценка заявок и подведение итогов фестиваля-конкурса."
        },
        {
          title: "Учебная программа",
          description: "Мастер-классы, творческие встречи, профессиональные разборы и обмен опытом для участников и руководителей коллективов."
        },
        {
          title: "Культурно-досуговая программа",
          description: "Творческие встречи, специальные события фестиваля и культурная программа для участников и гостей."
        }
      ];
  const programsEyebrow = configuredSectionText(content, "homePrograms", "eyebrow", "Составляющие фестиваля");

  return `
    <section class="section section--light">
      <div class="container">
        <div class="section-heading">
          ${programsEyebrow ? `<span class="eyebrow">${escapeHtml(programsEyebrow)}</span>` : ""}
          <h2>${escapeHtml(sectionText(content, "homePrograms", "title", "Три программы фестиваля"))}</h2>
          <p>${renderFormattedText(sectionText(content, "homePrograms", "description", "Фестиваль объединяет конкурсную, учебную и культурно-досуговую программы, которые вместе формируют его основную структуру."))}</p>
        </div>
        <div class="program-grid">
          ${programs
            .map(
              (program) => `
                <article class="program-card">
                  <h3>${escapeHtml(program.title)}</h3>
                  <p>${renderFormattedText(program.description)}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderPeopleSection(id, title, description, items, emptyText, options = {}) {
  const hasItems = Array.isArray(items) && items.length > 0;
  const eyebrow = options.eyebrow === undefined ? title : options.eyebrow;
  const sectionId = options.sectionId ? ` id="${escapeAttribute(options.sectionId)}"` : "";
  const showCarouselUi = hasItems && items.length > 1;
  const showCarouselHint = hasItems && items.length > 3;

  return `
    <section class="section section--people"${sectionId}>
      <div class="container">
        <div class="section-heading section-heading--with-actions">
          <div>
            ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
            <h2>${escapeHtml(title)}</h2>
            <p>${renderFormattedText(description)}</p>
            ${showCarouselHint ? `<p class="carousel-hint">${escapeHtml(text(options.content || {}, "ui.carouselHint", ""))}</p>` : ""}
          </div>
        </div>
        ${
          hasItems
              ? `
              <div class="card-scroller-shell${showCarouselUi ? " is-at-start" : " is-at-start is-at-end"}" data-carousel-shell>
                ${
                  showCarouselUi
                    ? `
                <button class="carousel-button carousel-button--overlay carousel-button--prev" type="button" data-carousel-prev="${escapeAttribute(id)}" aria-label="Прокрутить влево"><span class="carousel-button__icon" aria-hidden="true"></span></button>
                <button class="carousel-button carousel-button--overlay carousel-button--next" type="button" data-carousel-next="${escapeAttribute(id)}" aria-label="Прокрутить вправо"><span class="carousel-button__icon" aria-hidden="true"></span></button>
                `
                    : ""
                }
                <div class="card-scroller" id="${escapeAttribute(id)}" data-carousel-track>
                  ${items
                    .map(
                      (item) => {
                        const mediaStyle = options.getMediaStyle ? options.getMediaStyle(item) : "";
                        return `
                        <article class="person-card">
                          <div class="person-card__media"${mediaStyle ? ` style="${escapeAttribute(mediaStyle)}"` : ""}>
                            ${renderImage(item)}
                          </div>
                          <div class="person-card__body">
                            ${item.meta ? `<span class="chip">${escapeHtml(item.meta)}</span>` : ""}
                            <h3>${escapeHtml(item.name)}</h3>
                            ${item.role ? `<p class="person-card__role">${escapeHtml(item.role)}</p>` : ""}
                            ${item.description ? `<p>${renderFormattedText(item.description)}</p>` : ""}
                            ${item.link ? `<a class="text-link" href="${safeUrl(item.link)}" target="_blank" rel="noreferrer">${escapeHtml(text(options.content || {}, "ui.personMoreLabel", "Подробнее"))}</a>` : ""}
                          </div>
                        </article>
                      `;
                      })
                      .join("")}
                </div>
              </div>
            `
            : `<div class="empty-state"><p>${escapeHtml(emptyText)}</p></div>`
        }
      </div>
    </section>
  `;
}

function renderAboutIntro(content) {
  const about = content.about;
  const aboutEyebrow = configuredSectionText(content, "aboutHero", "eyebrow", "О фестивале");
  return `
    <section class="page-hero">
      <div class="container">
        ${aboutEyebrow ? `<span class="eyebrow">${escapeHtml(aboutEyebrow)}</span>` : ""}
        <h1>${escapeHtml(about.pageTitle)}</h1>
        <p class="page-hero__lead">${renderFormattedText(about.intro)}</p>
      </div>
    </section>
    <section class="section section--feature-theme">
      <div class="container feature-panel-shell">
        <img class="feature-panel__butterfly" src="/assets/images/feature-butterfly.svg" alt="" aria-hidden="true">
        <div class="feature-panel">
          <div class="feature-panel__main">
            <span class="eyebrow">${escapeHtml(about.themeTitle)}</span>
            <h2>${renderFormattedText(about.themeText)}</h2>
          </div>
          <div class="feature-panel__aside">
            <h3>${escapeHtml(about.missionTitle)}</h3>
            <p>${renderFormattedText(about.missionText)}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderInfoGrid(content, key, fallbackTitle, items) {
  const eyebrow = configuredSectionText(content, key, "eyebrow");
  const cards = (items || [])
    .map(
      (item) => `
        <article class="info-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${renderFormattedText(item.text)}</p>
        </article>
      `
    )
    .join("");

  return `
    <section class="section section--light">
      <div class="container">
        <div class="section-heading">
          ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
          <h2>${escapeHtml(sectionText(content, key, "title", fallbackTitle))}</h2>
          ${sectionText(content, key, "description") ? `<p>${renderFormattedText(sectionText(content, key, "description"))}</p>` : ""}
        </div>
        <div class="info-grid">
          ${cards}
        </div>
      </div>
    </section>
  `;
}

function isDirectVideoFile(url = "") {
  return /^\/uploads\/videos\//.test(url) || /\.(mp4|webm|ogg)$/i.test(url);
}

function renderVideoCard(video) {
  const videoUrl = String(video.url || "").trim();
  const posterUrl = getOptimizedImageUrl(String(video.poster || "").trim());
  const poster = posterUrl ? ` poster="${safeUrl(posterUrl)}"` : "";
  const playLabel = escapeAttribute(video.title ? `Воспроизвести: ${video.title}` : "Воспроизвести видео");
  const hasBody = !video.hideBody && (video.title || video.description);
  const frame = !videoUrl
    ? `
      <div class="video-card__missing" role="status" aria-live="polite">
        <span class="video-card__missing-mark" aria-hidden="true"></span>
        <p>Видео не загружено</p>
      </div>
    `
    : isDirectVideoFile(videoUrl)
    ? `
      <div class="video-card__video-shell" data-video-shell>
        <video controls preload="metadata" playsinline data-video-player${poster}>
            <source src="${safeUrl(videoUrl)}">
            Ваш браузер не поддерживает встроенное воспроизведение видео.
        </video>
        <button class="video-card__tap-layer" type="button" data-video-toggle aria-label="${playLabel}"></button>
        <button class="video-card__play" type="button" data-video-play aria-label="${playLabel}">
          <span class="video-card__play-icon" aria-hidden="true"></span>
        </button>
      </div>
    `
    : `<iframe src="${safeUrl(videoUrl)}" title="${escapeAttribute(video.title)}" loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>`;

    return `
      <article class="video-card">
        <div class="video-card__frame">
          ${frame}
        </div>
        ${
          hasBody
            ? `
        <div class="video-card__body">
          ${video.title ? `<h3>${escapeHtml(video.title)}</h3>` : ""}
          ${video.description ? `<p>${renderFormattedText(video.description)}</p>` : ""}
        </div>
        `
            : ""
        }
      </article>
    `;
  }

function getAboutVideoCollections(about = {}) {
  return {
    lifeVideos: Array.isArray(about.lifeVideos) ? about.lifeVideos : [],
    starVideos: Array.isArray(about.starVideos) ? about.starVideos : [],
    guideVideos: Array.isArray(about.guideVideos) ? about.guideVideos : [],
    eventVideos: Array.isArray(about.eventVideos) ? about.eventVideos : []
  };
}

function renderVideoCarouselSection(id, eyebrow, title, description, videos, emptyText, options = {}) {
  const hasItems = Array.isArray(videos) && videos.length > 0;
  const showCarouselUi = hasItems && videos.length > 1;
  const showCarouselHint = hasItems && videos.length > 3;
  const sectionClass = options.light ? "section section--light" : "section";

  return `
    <section class="${sectionClass}">
      <div class="container">
        <div class="section-heading section-heading--with-actions">
          <div>
            ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
            <h2>${escapeHtml(title)}</h2>
            <p>${renderFormattedText(description)}</p>
            ${showCarouselHint ? `<p class="carousel-hint">${escapeHtml(text(options.content || {}, "ui.carouselHint", ""))}</p>` : ""}
          </div>
        </div>
        ${
          hasItems
            ? `
              <div class="card-scroller-shell${showCarouselUi ? " is-at-start" : " is-at-start is-at-end"}" data-carousel-shell>
                ${
                  showCarouselUi
                    ? `
                <button class="carousel-button carousel-button--overlay carousel-button--prev" type="button" data-carousel-prev="${escapeAttribute(id)}" aria-label="Прокрутить видеоподборку влево"><span class="carousel-button__icon" aria-hidden="true"></span></button>
                <button class="carousel-button carousel-button--overlay carousel-button--next" type="button" data-carousel-next="${escapeAttribute(id)}" aria-label="Прокрутить видеоподборку вправо"><span class="carousel-button__icon" aria-hidden="true"></span></button>
                `
                    : ""
                }
                <div class="card-scroller" id="${escapeAttribute(id)}" data-carousel-track>
                  ${videos.map(renderVideoCard).join("")}
                </div>
              </div>
            `
            : `<div class="empty-state"><p>${escapeHtml(emptyText)}</p></div>`
        }
      </div>
    </section>
  `;
}

function renderVideoHubCta(content) {
  const socials = content.contacts.socials || [];
  const socialLinks = socials
    .map((item, index) => {
      const style = index === socials.length - 1 ? "button" : "button button--ghost";
      return `<a class="${style}" href="${safeUrl(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>`;
    })
    .join("");

  if (!socialLinks) {
    return "";
  }

  return `
    <section class="section">
      <div class="container">
        <div class="cta-panel">
          <div>
            <h3>${escapeHtml(sectionText(content, "aboutVideoHub", "title", "Больше видеоматериалов"))}</h3>
            <p>${renderFormattedText(sectionText(content, "aboutVideoHub", "description", "Следите за новыми публикациями фестиваля в социальных сетях."))}</p>
          </div>
          <div class="cta-panel__actions">
            ${socialLinks}
          </div>
        </div>
      </div>
    </section>
  `;
}
function sortDocuments(documents) {
  return [...(documents || [])].sort((left, right) => {
    if (right.year !== left.year) {
      return right.year - left.year;
    }

    return left.title.localeCompare(right.title, "ru");
  });
}

function renderDocumentCard(document) {
  const published = (document.status === "published" || document.status === "active") && document.url;
  const label = document.buttonLabel || document.actionLabel || (published ? "Открыть" : "Скоро");
  const searchText = [
    document.title,
    document.description,
    document.type,
    document.year,
    label
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  return `
    <article class="document-card" data-document-card data-document-search="${escapeAttribute(searchText)}">
      <div class="document-card__header">
        <span class="chip">${escapeHtml(String(document.year))}</span>
        <span class="document-card__type">${escapeHtml(document.type)}</span>
      </div>
      <h3>${escapeHtml(document.title)}</h3>
      <p>${renderFormattedText(document.description || "")}</p>
      <div class="document-card__footer">
        ${
            published
              ? `<a class="button button--ghost" href="${safeUrl(document.url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`
              : `<span class="button button--disabled" aria-disabled="true">${escapeHtml(label)}</span>`
        }
      </div>
    </article>
  `;
}

function renderDocumentsBody(content) {
  const documents = content.documents || [];
  const sorted = sortDocuments(documents);
  const years = [...new Set(sorted.map((item) => item.year))];
  const currentYear = years[0];
  const currentDocs = sorted.filter((item) => item.year === currentYear);
  const archiveYears = years.filter((year) => year !== currentYear);
  const documentsEyebrow = configuredSectionText(content, "documentsHero", "eyebrow", "Документы");
  const currentEyebrow = configuredSectionText(content, "documentsCurrent", "eyebrow", "Текущий год");
  const archiveEyebrow = configuredSectionText(content, "documentsArchive", "eyebrow", "Архив");

  return `
    <section class="page-hero">
      <div class="container">
        ${documentsEyebrow ? `<span class="eyebrow">${escapeHtml(documentsEyebrow)}</span>` : ""}
        <h1>${escapeHtml(sectionText(content, "documentsHero", "title", "Документы фестиваля"))}</h1>
        <p class="page-hero__lead">${renderFormattedText(sectionText(content, "documentsHero", "description", "Актуальные документы и архив публикаций по годам. Материалы отсортированы по убыванию года."))}</p>
      </div>
    </section>
    <section class="section section--compact">
      <div class="container">
        <div class="docs-search" data-doc-search>
          <label class="docs-search__label" for="docs-search-input">${escapeHtml(text(content, "ui.docsSearchLabel", "Поиск по документам"))}</label>
          <div class="docs-search__row">
            <input
              class="docs-search__input"
              id="docs-search-input"
              type="search"
              placeholder="${escapeAttribute(text(content, "ui.docsSearchPlaceholder", "Введите название, тип, описание или год"))}"
              autocomplete="off"
              data-doc-search-input
            >
            <button class="button button--ghost docs-search__clear" type="button" data-doc-search-clear hidden>${escapeHtml(text(content, "ui.docsSearchClearLabel", "Сбросить"))}</button>
          </div>
          <p class="docs-search__status" data-doc-search-status aria-live="polite"></p>
          <div class="empty-state docs-search__empty" data-doc-search-empty hidden>
            <p>${escapeHtml(text(content, "ui.docsSearchEmptyText", "По вашему запросу документы не найдены. Попробуйте изменить формулировку или очистить поиск."))}</p>
          </div>
        </div>
      </div>
    </section>
    <section class="section" data-documents-search-section>
      <div class="container" data-documents-group>
        <div class="section-heading">
          ${currentEyebrow ? `<span class="eyebrow">${escapeHtml(currentEyebrow)}</span>` : ""}
          <h2>${escapeHtml(String(currentYear))}</h2>
        </div>
        <div class="documents-grid">
          ${currentDocs.map(renderDocumentCard).join("")}
        </div>
      </div>
    </section>
    <section class="section section--light" data-documents-archive data-documents-search-section>
      <div class="container">
        <div class="section-heading">
          ${archiveEyebrow ? `<span class="eyebrow">${escapeHtml(archiveEyebrow)}</span>` : ""}
          <h2>${escapeHtml(sectionText(content, "documentsArchive", "title", "Предыдущие публикации"))}</h2>
          ${sectionText(content, "documentsArchive", "description") ? `<p>${renderFormattedText(sectionText(content, "documentsArchive", "description"))}</p>` : ""}
        </div>
        <div class="docs-archive">
          ${archiveYears
            .map((year) => {
              const items = sorted.filter((item) => item.year === year);
              return `
                <div class="docs-year" data-documents-group>
                  <h3 data-documents-year-title>${escapeHtml(String(year))}</h3>
                  <div class="documents-grid">
                    ${items.map(renderDocumentCard).join("")}
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderContactCarouselSection(id, eyebrow, title, description, items, emptyText, content = null) {
  const hasItems = Array.isArray(items) && items.length > 0;
  const showCarouselUi = hasItems && items.length > 1;
  const showCarouselHint = hasItems && items.length > 3;

  return `
    <section class="section section--light">
      <div class="container">
        <div class="section-heading section-heading--with-actions">
          <div>
            ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
            <h2>${escapeHtml(title)}</h2>
            <p>${renderFormattedText(description)}</p>
            ${showCarouselHint ? `<p class="carousel-hint">${escapeHtml(text(content || {}, "ui.carouselHint", ""))}</p>` : ""}
          </div>
        </div>
        ${
          hasItems
              ? `
                <div class="card-scroller-shell${showCarouselUi ? " is-at-start" : " is-at-start is-at-end"}" data-carousel-shell>
                  ${
                    showCarouselUi
                      ? `
                  <button class="carousel-button carousel-button--overlay carousel-button--prev" type="button" data-carousel-prev="${escapeAttribute(id)}" aria-label="Прокрутить влево"><span class="carousel-button__icon" aria-hidden="true"></span></button>
                  <button class="carousel-button carousel-button--overlay carousel-button--next" type="button" data-carousel-next="${escapeAttribute(id)}" aria-label="Прокрутить вправо"><span class="carousel-button__icon" aria-hidden="true"></span></button>
                  `
                      : ""
                  }
                  <div class="card-scroller" id="${escapeAttribute(id)}" data-carousel-track>
                    ${items
                      .map(
                        (item) => `
                          <article class="contact-person">
                            <div class="contact-person__media">
                              ${renderImage(item)}
                            </div>
                            <div class="contact-person__body">
                              <h3>${escapeHtml(item.name)}</h3>
                              ${item.role ? `<p class="contact-person__role">${escapeHtml(item.role)}</p>` : ""}
                              ${renderPhoneAction(item.phone)}
                              ${renderEmailAction(item.email)}
                            </div>
                          </article>
                        `
                        )
                        .join("")}
                  </div>
                </div>
              `
            : `<div class="empty-state"><p>${escapeHtml(emptyText)}</p></div>`
        }
      </div>
    </section>
  `;
}

function renderContactsVideoSection(contacts) {
  if (!contacts.featuredVideoUrl) {
    return "";
  }

  return `
    <section class="section section--light">
      <div class="container">
        <div class="section-heading">
          <h2>${escapeHtml(contacts.featuredVideoTitle || "Видео")}</h2>
          ${contacts.featuredVideoText ? `<p>${renderFormattedText(contacts.featuredVideoText)}</p>` : ""}
        </div>
        <div class="video-grid video-grid--single">
          ${renderVideoCard({
            url: contacts.featuredVideoUrl,
            poster: contacts.featuredVideoPoster || "",
            hideBody: true
          })}
        </div>
      </div>
    </section>
  `;
}

function renderContactsBody(content) {
  const socials = (content.contacts.socials || [])
    .map((item) => `<a class="social-pill" href="${safeUrl(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>`)
    .join("");
  const organizationLegalName = contactText(content, "organizationLegalName");
  const organizationShortName = contactText(content, "organizationShortName");
  const ogrn = contactText(content, "ogrn");
  const innKpp = contactText(content, "innKpp");

    return `
      <section class="page-hero">
        <div class="container">
          ${sectionText(content, "contactsHero", "eyebrow") ? `<span class="eyebrow">${escapeHtml(sectionText(content, "contactsHero", "eyebrow"))}</span>` : ""}
          <h1>${escapeHtml(content.contacts.pageTitle)}</h1>
          <p class="page-hero__lead">${renderFormattedText(content.contacts.intro)}</p>
        </div>
      </section>
    <section class="section">
      <div class="container contacts-grid">
        <article class="contact-card contact-card--wide">
          <h2>${escapeHtml(sectionText(content, "contactsOrganization", "title", "Организационные сведения"))}</h2>
          ${sectionText(content, "contactsOrganization", "description") ? `<p>${renderFormattedText(sectionText(content, "contactsOrganization", "description"))}</p>` : ""}
          <dl class="contact-list">
            ${organizationLegalName ? `<div>
              <dt>Полное наименование</dt>
              <dd>${renderFormattedText(organizationLegalName)}</dd>
            </div>` : ""}
            ${organizationShortName ? `<div>
              <dt>Сокращённое наименование</dt>
              <dd>${escapeHtml(organizationShortName)}</dd>
            </div>` : ""}
            ${ogrn ? `<div>
              <dt>ОГРН</dt>
              <dd class="contact-list__static-number">${escapeHtml(ogrn)}</dd>
            </div>` : ""}
            ${innKpp ? `<div>
              <dt>ИНН / КПП</dt>
              <dd class="contact-list__static-number">${escapeHtml(innKpp)}</dd>
            </div>` : ""}
            ${content.contacts.phone ? `<div>
              <dt>Телефон</dt>
              <dd>${renderPhoneAction(content.contacts.phone)}</dd>
            </div>` : ""}
            ${content.contacts.email ? `<div>
              <dt>Email</dt>
              <dd>${renderEmailAction(content.contacts.email)}</dd>
            </div>` : ""}
            ${
              content.contacts.address
                ? `
                  <div>
                    <dt>Адрес</dt>
                    <dd>${renderFormattedText(content.contacts.address)}</dd>
                  </div>
                `
                : ""
            }
          </dl>
          ${content.contacts.notes ? `<p class="contact-card__note">${renderFormattedText(content.contacts.notes)}</p>` : ""}
        </article>
        <article class="contact-card">
          <h2>${escapeHtml(sectionText(content, "contactsSocials", "title", "Социальные сети"))}</h2>
          ${sectionText(content, "contactsSocials", "description") ? `<p>${renderFormattedText(sectionText(content, "contactsSocials", "description"))}</p>` : ""}
          <div class="social-row social-row--stack">
            ${socials}
          </div>
        </article>
      </div>
    </section>
      ${renderContactCarouselSection(
        "founders-track",
        sectionText(content, "contactsFounders", "eyebrow"),
        sectionText(content, "contactsFounders", "title", "Учредители"),
      sectionText(content, "contactsFounders", "description", "Контакты учредителей и ключевых представителей фестиваля."),
      content.contacts.founders || [],
      sectionText(content, "contactsFounders", "emptyText", "Карточки учредителей можно дополнить в админке."),
      content
    )}
    ${renderContactCarouselSection(
      "orgcommittee-track",
      sectionText(content, "contactsOrganizers", "eyebrow"),
      sectionText(content, "contactsOrganizers", "title", "Организаторы"),
      sectionText(content, "contactsOrganizers", "description", "Рабочие контакты организаторов фестиваля по вопросам организации, программы и сопровождения."),
      content.contacts.orgCommittee || [],
      sectionText(content, "contactsOrganizers", "emptyText", "Карточки организаторов фестиваля пока не опубликованы."),
      content
    )}
      ${renderContactCarouselSection(
        "media-team-track",
        sectionText(content, "contactsMediaTeam", "eyebrow"),
        sectionText(content, "contactsMediaTeam", "title", "Медиа-команда"),
        sectionText(content, "contactsMediaTeam", "description", "Контакты для визуального сопровождения, публикаций и медийной координации."),
        content.contacts.mediaTeam || [],
        sectionText(content, "contactsMediaTeam", "emptyText", "Карточки медиакоманды пока не заполнены. Их можно добавить в админке."),
        content
      )}
      ${renderContactsVideoSection(content.contacts)}
    `;
  }
function renderHomePage(content) {
  const workshopLeaders = buildWorkshopLeaders(content);
  const videoCollections = getAboutVideoCollections(content.about);

  const body = [
    renderHero(content),
    renderApplicationGuideSection(content.home),
    renderProgramsOverviewSection(content),
    renderStageSection(content),
    renderFactsSection(content),
    renderVideoCarouselSection(
      "stars-on-screen-videos",
      sectionText(content, "homeStarVideos", "eyebrow"),
      sectionText(content, "homeStarVideos", "title", "Звезды на экране"),
      sectionText(content, "homeStarVideos", "description", "Интервью, обращения, встречи и видеоматериалы со звёздными гостями фестиваля."),
      videoCollections.starVideos,
      sectionText(content, "homeStarVideos", "emptyText", "Подборка «Звезды на экране» находится в подготовке."),
      { content }
    ),
    renderPeopleSection(
        "jury-track",
        sectionText(content, "homeJury", "title", "Жюри фестиваля"),
        sectionText(content, "homeJury", "description", "Экспертный состав конкурсной программы фестиваля «Театральная Завалинка»."),
        content.collections.jury,
        sectionText(content, "homeJury", "emptyText", "Состав жюри можно добавить и обновить в админке."),
        { eyebrow: sectionText(content, "homeJury", "eyebrow"), sectionId: "competitive-program", content }
      ),
      renderPeopleSection(
        "workshops-track",
        sectionText(content, "homeWorkshops", "title", "Ведущие мастер-классов"),
        sectionText(content, "homeWorkshops", "description", "Педагоги, режиссёры и представители театрального сообщества, формирующие учебную программу фестиваля."),
        workshopLeaders,
        sectionText(content, "homeWorkshops", "emptyText", "Список ведущих мастер-классов можно добавить и обновить в админке."),
        { eyebrow: sectionText(content, "homeWorkshops", "eyebrow"), sectionId: "educational-program", content }
      ),
      renderPeopleSection(
        "guests-track",
        sectionText(content, "homeGuests", "title", "Гости и звёзды"),
        sectionText(content, "homeGuests", "description", "Специальные гости, приглашённые артисты и участники культурно-досуговой программы фестиваля."),
        content.collections.guests,
        sectionText(content, "homeGuests", "emptyText", "Список гостей можно добавить и обновить в админке."),
        { eyebrow: sectionText(content, "homeGuests", "eyebrow"), sectionId: "cultural-program", content }
      ),
    renderPeopleSection(
      "partners-track",
      sectionText(content, "homePartners", "title", "Партнёры"),
      sectionText(content, "homePartners", "description", "Организации и площадки, поддерживающие фестиваль."),
      content.collections.partners,
      sectionText(content, "homePartners", "emptyText", "Партнёры пока не опубликованы. Их можно добавить в админке."),
      { eyebrow: sectionText(content, "homePartners", "eyebrow"), content }
    )
  ].join("");

  return renderLayout(content, {
    activePath: "/home",
    pageTitle: text(content, "ui.navHome", "Главная"),
    description: content.home.heroSubtitle,
    body
  });
}

function renderAboutPage(content) {
  const videoCollections = getAboutVideoCollections(content.about);
  const body = [
    renderAboutIntro(content),
    renderInfoGrid(content, "aboutAchievements", "Достижения фестиваля", content.about.achievements),
    renderInfoGrid(content, "aboutStatuses", "Официальный статус", content.about.statuses),
    renderVideoCarouselSection(
      "festival-life-videos",
      configuredSectionText(content, "aboutLifeVideos", "eyebrow"),
      sectionText(content, "aboutLifeVideos", "title", "Видео о жизни фестиваля"),
      sectionText(content, "aboutLifeVideos", "description", "Ролики о фестивальной атмосфере, участниках, программе и событиях фестивальных дней."),
      videoCollections.lifeVideos,
      sectionText(content, "aboutLifeVideos", "emptyText", "Подборка видеоматериалов о жизни фестиваля находится в подготовке."),
      { content }
    ),
    renderVideoCarouselSection(
      "guide-videos",
      configuredSectionText(content, "aboutGuideVideos", "eyebrow"),
      sectionText(content, "aboutGuideVideos", "title", "Видео-путеводители: 6 дней"),
      sectionText(content, "aboutGuideVideos", "description", "Серия роликов по дням фестиваля, помогающая быстро ориентироваться в программе и активности каждой даты."),
      videoCollections.guideVideos,
      sectionText(content, "aboutGuideVideos", "emptyText", "Видео-путеводители по дням фестиваля находятся в подготовке."),
      { content }
    ),
    renderVideoCarouselSection(
      "event-videos",
      configuredSectionText(content, "aboutEventVideos", "eyebrow"),
      sectionText(content, "aboutEventVideos", "title", "Видео с каждого основного мероприятия"),
      sectionText(content, "aboutEventVideos", "description", "Отдельные ролики по ключевым мероприятиям фестиваля: показы, встречи, церемонии и специальные события."),
      videoCollections.eventVideos,
      sectionText(content, "aboutEventVideos", "emptyText", "Подборка видео с основных мероприятий находится в подготовке."),
      { light: true, content }
    ),
    renderVideoHubCta(content)
  ].join("");

  return renderLayout(content, {
    activePath: "/info",
    pageTitle: content.about.pageTitle,
    description: content.about.intro,
    body
  });
}

function renderDocumentsPage(content) {
  return renderLayout(content, {
    activePath: "/docs",
    pageTitle: sectionText(content, "documentsHero", "title", "Документы"),
    description: sectionText(content, "documentsHero", "description", "Документы фестиваля, положение, приказы и протоколы по годам."),
    body: renderDocumentsBody(content)
  });
}

function renderContactsPage(content) {
  return renderLayout(content, {
    activePath: "/contacts",
    pageTitle: content.contacts.pageTitle,
    description: content.contacts.intro || sectionText(content, "contactsHero", "description", "Контакты фестиваля, учредители и организационные сведения."),
    body: renderContactsBody(content)
  });
}

module.exports = {
  renderAboutPage,
  renderContactsPage,
  renderDocumentsPage,
  renderHomePage
};
