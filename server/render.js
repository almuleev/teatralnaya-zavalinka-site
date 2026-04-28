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

function phoneHref(value = "") {
  return value.replace(/[^\d+]/g, "");
}

function pageUrl(pathname) {
  if (!config.publicSiteUrl) {
    return pathname;
  }

  return `${config.publicSiteUrl}${pathname === "/" ? "" : pathname}`;
}

function emailComposeUrl(email = "", preferWebmail = false) {
  if (preferWebmail && /@gmail\.com$/i.test(email)) {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
  }

  return `mailto:${email}`;
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

function renderImage(item, className = "card__image") {
  if (item && item.image) {
    return `<img class="${className}" src="${safeUrl(item.image)}" alt="${escapeAttribute(item.name || item.title || "Изображение")}" loading="lazy">`;
  }

  return `<div class="${className} ${className}--placeholder" aria-hidden="true">${initials(item && (item.name || item.title))}</div>`;
}

function renderMeta(description) {
  return escapeHtml(description || "");
}

function emphasizeSince1994(value = "") {
  const text = String(value || "");
  const exactPhrase = "ежегодно с 1994 года";
  const fallbackPhrase = "с 1994 года";
  const lowerText = text.toLowerCase();

  const wrapSlice = (start, end, html) => {
    return `${escapeHtml(text.slice(0, start))}${html}${escapeHtml(text.slice(end))}`;
  };

  const exactStart = lowerText.indexOf(exactPhrase);
  if (exactStart !== -1) {
    const exactEnd = exactStart + exactPhrase.length;
    return wrapSlice(
      exactStart,
      exactEnd,
      `<strong>${escapeHtml(text.slice(exactStart, exactEnd))}</strong>`
    );
  }

  const fallbackStart = lowerText.indexOf(fallbackPhrase);
  if (fallbackStart !== -1) {
    const fallbackEnd = fallbackStart + fallbackPhrase.length;
    return wrapSlice(
      fallbackStart,
      fallbackEnd,
      `<strong>${escapeHtml(text.slice(fallbackStart, fallbackEnd))}</strong>`
    );
  }

  return escapeHtml(text);
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

function renderNavigation(activePath, links) {
  const items = [
    { href: "/home", label: "Главная" },
    { href: "/info", label: "О фестивале" },
    { href: "/docs", label: "Документы" },
    { href: "/contacts", label: "Контакты" }
  ];

  const navItems = items
    .map((item) => {
      const active = activePath === item.href || (item.href === "/home" && activePath === "/");
      return `<li><a href="${item.href}"${active ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a></li>`;
    })
    .join("");

  return `
    <header class="site-header">
      <a class="skip-link" href="#main-content">Перейти к содержанию</a>
      <div class="container site-header__row">
        <a class="brand" href="/home" aria-label="На главную">
          <span class="brand__mark">
            <img class="brand__logo" src="/assets/images/logo-main.png" alt="" width="52" height="52">
          </span>
          <span class="brand__text">
            <span class="brand__title">Театральная Завалинка</span>
            <span class="brand__subtitle">Официальный сайт фестиваля</span>
          </span>
        </a>

        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" data-menu-toggle>
          Меню
        </button>

        <nav id="primary-nav" class="site-nav" aria-label="Основная навигация" data-menu>
          <ul>${navItems}</ul>
          <div class="site-nav__actions">
            <a class="button button--ghost" href="${safeUrl(links.festivalRegulation)}" target="_blank" rel="noreferrer">Положение</a>
            <a class="button" href="${safeUrl(links.applicationForm)}" target="_blank" rel="noreferrer">Подать заявку</a>
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
      `<a href="${escapeAttribute(emailComposeUrl(creatorEmail, true))}" target="_blank" rel="noreferrer">${escapeHtml(creatorEmail)}</a>`
    );
  }

  if (creatorContactLabel && creatorContactUrl) {
    creatorLinks.push(
      `<a href="${safeUrl(creatorContactUrl)}" target="_blank" rel="noreferrer">${escapeHtml(creatorContactLabel)}</a>`
    );
  }

  const creatorMarkup = creatorName
    ? `<div class="site-footer__credit">
        <p class="site-footer__credit-line">Сайт разработал ${escapeHtml(creatorName)}</p>
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
          <p class="site-footer__heading">Навигация</p>
          <div class="site-footer__links">
            <a href="/home">Главная</a>
            <a href="/info">О фестивале</a>
            <a href="/docs">Документы</a>
            <a href="/contacts">Контакты</a>
          </div>
        </div>
        <div>
          <p class="site-footer__heading">Связь</p>
          <div class="site-footer__links">
            <a href="mailto:${escapeAttribute(content.contacts.email)}">${escapeHtml(content.contacts.email)}</a>
            <a href="tel:${escapeAttribute(phoneHref(content.contacts.phone))}">${escapeHtml(content.contacts.phone)}</a>
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
    <link rel="stylesheet" href="/assets/css/main.css">
    <script defer src="/assets/js/site.js"></script>
  </head>
  <body class="${bodyClass}">
    ${renderNavigation(activePath, content.links)}
    <main id="main-content">
      ${body}
    </main>
    ${renderFooter(content)}
  </body>
</html>`;
}

function renderHero(content) {
  return `
    <section class="hero">
      <div class="container hero__layout">
        <div class="hero__content">
          <span class="eyebrow">Фестиваль 2025</span>
          <h1>${escapeHtml(content.home.heroTitle)}</h1>
          <p class="hero__subtitle">${escapeHtml(content.home.heroSubtitle)}</p>
          <p class="hero__lead">${emphasizeSince1994(content.home.heroLead)}</p>
          <div class="hero__actions">
            <a class="button" href="${safeUrl(content.links.applicationForm)}" target="_blank" rel="noreferrer">Подать заявку</a>
            <a class="button button--ghost" href="${safeUrl(content.links.festivalRegulation)}" target="_blank" rel="noreferrer">Положение о фестивале</a>
          </div>
        </div>
        <div class="hero__panel">
          <div class="hero-card">
            <span class="eyebrow">${escapeHtml(content.home.descriptionTitle || "Ключевая информация")}</span>
            <p>${escapeHtml(content.home.descriptionText)}</p>
          </div>
          <div class="hero-note">
            <strong>Быстрый контакт:</strong>
            <a href="tel:${escapeAttribute(phoneHref(content.contacts.phone))}">${escapeHtml(content.contacts.phone)}</a>
            <a href="mailto:${escapeAttribute(content.contacts.email)}">${escapeHtml(content.contacts.email)}</a>
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
            <p>${escapeHtml(text)}</p>
          </div>
          <div class="cta-panel__actions">
            ${action}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderStageSection(stages) {
  const cards = (stages || [])
    .map(
      (stage) => `
        <article class="timeline-card">
          <span class="timeline-card__meta">${escapeHtml(stage.meta)}</span>
          <h3>${escapeHtml(stage.title)}</h3>
          <p>${escapeHtml(stage.description)}</p>
        </article>
      `
    )
    .join("");

  return `
    <section class="section section--light">
      <div class="container">
        <div class="section-heading">
          <span class="eyebrow">Этапы фестиваля</span>
          <h2>Календарь участия</h2>
          <p>Основные сроки и формат проведения фестиваля «Театральная Завалинка 2025».</p>
        </div>
        <div class="timeline-grid">
          ${cards}
        </div>
      </div>
    </section>
  `;
}

function renderFactsSection(facts) {
  const cards = (facts || [])
    .map(
      (item) => `
        <article class="fact-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `
    )
    .join("");

  return `
    <section class="section">
      <div class="container">
        <div class="section-heading">
          <span class="eyebrow">Условия участия</span>
          <h2>Что важно знать участникам</h2>
        </div>
        <div class="facts-grid">
          ${cards}
        </div>
      </div>
    </section>
  `;
}

function normalizeLookup(value = "") {
  return String(value).trim().toLowerCase();
}

function dedupePeopleByName(items) {
  const seen = new Set();

  return (items || []).filter((item) => {
    const key = normalizeLookup(item && (item.name || item.id));

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function isWorkshopLeader(item) {
  const text = normalizeLookup(`${item && item.meta ? item.meta : ""} ${item && item.description ? item.description : ""}`);
  return text.includes("мастер-класс") || text.includes("курс мастер-классов");
}

function buildWorkshopLeaders(content) {
  const experts = (content.collections && content.collections.experts) || [];
  const guestLeaders = ((content.collections && content.collections.guests) || []).filter(isWorkshopLeader);

  return dedupePeopleByName([...guestLeaders, ...experts]);
}

function renderProgramsOverviewSection() {
  const programs = [
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

  return `
    <section class="section section--light">
      <div class="container">
        <div class="section-heading">
          <span class="eyebrow">Составляющие фестиваля</span>
          <h2>Три программы фестиваля</h2>
          <p>Фестиваль объединяет конкурсную, учебную и культурно-досуговую программы, которые вместе формируют его основную структуру.</p>
        </div>
        <div class="program-grid">
          ${programs
            .map(
              (program) => `
                <article class="program-card">
                  <h3>${escapeHtml(program.title)}</h3>
                  <p>${escapeHtml(program.description)}</p>
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

  return `
    <section class="section section--people"${sectionId}>
      <div class="container">
        <div class="section-heading section-heading--with-actions">
          <div>
            ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(description)}</p>
          </div>
        </div>
        ${
          hasItems
              ? `
              <div class="card-scroller-shell${showCarouselUi ? " is-at-start" : " is-at-start is-at-end"}" data-carousel-shell>
                ${
                  showCarouselUi
                    ? `
                <button class="carousel-button carousel-button--overlay carousel-button--prev" type="button" data-carousel-prev="${escapeAttribute(id)}" aria-label="Прокрутить влево">‹</button>
                <button class="carousel-button carousel-button--overlay carousel-button--next" type="button" data-carousel-next="${escapeAttribute(id)}" aria-label="Прокрутить вправо">›</button>
                `
                    : ""
                }
                <div class="card-scroller" id="${escapeAttribute(id)}" data-carousel-track>
                  ${items
                    .map(
                      (item) => `
                        <article class="person-card">
                          <div class="person-card__media">
                            ${renderImage(item)}
                          </div>
                          <div class="person-card__body">
                            ${item.meta ? `<span class="chip">${escapeHtml(item.meta)}</span>` : ""}
                            <h3>${escapeHtml(item.name)}</h3>
                            ${item.role ? `<p class="person-card__role">${escapeHtml(item.role)}</p>` : ""}
                            ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
                            ${item.link ? `<a class="text-link" href="${safeUrl(item.link)}" target="_blank" rel="noreferrer">Подробнее</a>` : ""}
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

function renderAboutIntro(about) {
  return `
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow">О фестивале</span>
        <h1>${escapeHtml(about.pageTitle)}</h1>
        <p class="page-hero__lead">${escapeHtml(about.intro)}</p>
      </div>
    </section>
    <section class="section">
      <div class="container feature-panel">
        <div class="feature-panel__main">
          <span class="eyebrow">${escapeHtml(about.themeTitle)}</span>
          <h2>${escapeHtml(about.themeText)}</h2>
        </div>
        <div class="feature-panel__aside">
          <h3>${escapeHtml(about.missionTitle)}</h3>
          <p>${escapeHtml(about.missionText)}</p>
        </div>
      </div>
    </section>
  `;
}

function renderInfoGrid(title, items) {
  const cards = (items || [])
    .map(
      (item) => `
        <article class="info-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `
    )
    .join("");

  return `
    <section class="section section--light">
      <div class="container">
        <div class="section-heading">
          <h2>${escapeHtml(title)}</h2>
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
  const poster = video.poster ? ` poster="${safeUrl(video.poster)}"` : "";
  const hasBody = !video.hideBody && (video.title || video.description);
  const frame = isDirectVideoFile(video.url)
    ? `
      <video controls preload="metadata"${poster}>
          <source src="${safeUrl(video.url)}">
          Ваш браузер не поддерживает встроенное воспроизведение видео.
      </video>
    `
    : `<iframe src="${safeUrl(video.url)}" title="${escapeAttribute(video.title)}" loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>`;

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
          ${video.description ? `<p>${escapeHtml(video.description)}</p>` : ""}
        </div>
        `
            : ""
        }
      </article>
    `;
  }

function getAboutVideoCollections(about = {}) {
  const legacyVideos = Array.isArray(about.videos) ? about.videos : [];

  return {
    lifeVideos: Array.isArray(about.lifeVideos) ? about.lifeVideos : legacyVideos,
    starVideos: Array.isArray(about.starVideos) ? about.starVideos : [],
    guideVideos: Array.isArray(about.guideVideos) ? about.guideVideos : [],
    eventVideos: Array.isArray(about.eventVideos) ? about.eventVideos : []
  };
}

function renderVideoCarouselSection(id, eyebrow, title, description, videos, emptyText, options = {}) {
  const hasItems = Array.isArray(videos) && videos.length > 0;
  const showCarouselUi = hasItems && videos.length > 1;
  const sectionClass = options.light ? "section section--light" : "section";

  return `
    <section class="${sectionClass}">
      <div class="container">
        <div class="section-heading section-heading--with-actions">
          <div>
            ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(description)}</p>
            ${showCarouselUi ? `<p class="carousel-hint">Листайте карточки или используйте стрелки, чтобы посмотреть все видео подборки.</p>` : ""}
          </div>
        </div>
        ${
          hasItems
            ? `
              <div class="card-scroller-shell${showCarouselUi ? " is-at-start" : " is-at-start is-at-end"}" data-carousel-shell>
                ${
                  showCarouselUi
                    ? `
                <button class="carousel-button carousel-button--overlay carousel-button--prev" type="button" data-carousel-prev="${escapeAttribute(id)}" aria-label="Прокрутить видеоподборку влево">‹</button>
                <button class="carousel-button carousel-button--overlay carousel-button--next" type="button" data-carousel-next="${escapeAttribute(id)}" aria-label="Прокрутить видеоподборку вправо">›</button>
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

function renderVideoHubCta(links) {
  return `
    <section class="section">
      <div class="container">
        <div class="cta-panel">
          <div>
            <h3>Больше видеоматериалов</h3>
            <p>Следите за новыми публикациями фестиваля в Telegram, ВКонтакте и Rutube.</p>
          </div>
          <div class="cta-panel__actions">
            <a class="button button--ghost" href="${safeUrl(links.vk)}" target="_blank" rel="noreferrer">ВКонтакте</a>
            <a class="button button--ghost" href="${safeUrl(links.rutube)}" target="_blank" rel="noreferrer">Rutube</a>
            <a class="button" href="${safeUrl(links.telegram)}" target="_blank" rel="noreferrer">Telegram</a>
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
      <p>${escapeHtml(document.description || "")}</p>
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

function renderDocumentsBody(documents) {
  const sorted = sortDocuments(documents);
  const years = [...new Set(sorted.map((item) => item.year))];
  const currentYear = years[0];
  const currentDocs = sorted.filter((item) => item.year === currentYear);
  const archiveYears = years.filter((year) => year !== currentYear);

  return `
    <section class="page-hero">
      <div class="container">
        <span class="eyebrow">Документы</span>
        <h1>Документы фестиваля</h1>
        <p class="page-hero__lead">Актуальные документы и архив публикаций по годам. Материалы отсортированы по убыванию года.</p>
      </div>
    </section>
    <section class="section section--compact">
      <div class="container">
        <div class="docs-search" data-doc-search>
          <label class="docs-search__label" for="docs-search-input">Поиск по документам</label>
          <div class="docs-search__row">
            <input
              class="docs-search__input"
              id="docs-search-input"
              type="search"
              placeholder="Введите название, тип, описание или год"
              autocomplete="off"
              data-doc-search-input
            >
            <button class="button button--ghost docs-search__clear" type="button" data-doc-search-clear hidden>Сбросить</button>
          </div>
          <p class="docs-search__status" data-doc-search-status aria-live="polite"></p>
          <div class="empty-state docs-search__empty" data-doc-search-empty hidden>
            <p>По вашему запросу документы не найдены. Попробуйте изменить формулировку или очистить поиск.</p>
          </div>
        </div>
      </div>
    </section>
    <section class="section" data-documents-search-section>
      <div class="container" data-documents-group>
        <div class="section-heading">
          <span class="eyebrow">Текущий год</span>
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
          <span class="eyebrow">Архив</span>
          <h2>Предыдущие публикации</h2>
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

function renderContactCarouselSection(id, eyebrow, title, description, items, emptyText) {
  const hasItems = Array.isArray(items) && items.length > 0;
  const showCarouselUi = hasItems && items.length > 1;

  return `
    <section class="section section--light">
      <div class="container">
        <div class="section-heading section-heading--with-actions">
          <div>
            ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ""}
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(description)}</p>
          </div>
        </div>
        ${
          hasItems
              ? `
                <div class="card-scroller-shell${showCarouselUi ? " is-at-start" : " is-at-start is-at-end"}" data-carousel-shell>
                  ${
                    showCarouselUi
                      ? `
                  <button class="carousel-button carousel-button--overlay carousel-button--prev" type="button" data-carousel-prev="${escapeAttribute(id)}" aria-label="Прокрутить влево">‹</button>
                  <button class="carousel-button carousel-button--overlay carousel-button--next" type="button" data-carousel-next="${escapeAttribute(id)}" aria-label="Прокрутить вправо">›</button>
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
                              ${item.phone ? `<a href="tel:${escapeAttribute(phoneHref(item.phone))}">${escapeHtml(item.phone)}</a>` : ""}
                              ${item.email ? `<a href="mailto:${escapeAttribute(item.email)}">${escapeHtml(item.email)}</a>` : ""}
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
          ${contacts.featuredVideoText ? `<p>${escapeHtml(contacts.featuredVideoText)}</p>` : ""}
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

    return `
      <section class="page-hero">
        <div class="container">
          <h1>${escapeHtml(content.contacts.pageTitle)}</h1>
          <p class="page-hero__lead">${escapeHtml(content.contacts.intro)}</p>
        </div>
      </section>
    <section class="section">
      <div class="container contacts-grid">
        <article class="contact-card contact-card--wide">
          <h2>Организационные сведения</h2>
          <p>${escapeHtml(content.meta.organizationLegalName)}</p>
          <dl class="contact-list">
            <div>
              <dt>ОГРН</dt>
              <dd>${escapeHtml(content.meta.ogrn)}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd><a href="mailto:${escapeAttribute(content.contacts.email)}">${escapeHtml(content.contacts.email)}</a></dd>
            </div>
            <div>
              <dt>Телефон</dt>
              <dd><a href="tel:${escapeAttribute(phoneHref(content.contacts.phone))}">${escapeHtml(content.contacts.phone)}</a></dd>
            </div>
            ${
              content.contacts.address
                ? `
                  <div>
                    <dt>Адрес</dt>
                    <dd>${escapeHtml(content.contacts.address)}</dd>
                  </div>
                `
                : ""
            }
          </dl>
          ${content.contacts.notes ? `<p class="contact-card__note">${escapeHtml(content.contacts.notes)}</p>` : ""}
        </article>
        <article class="contact-card">
          <h2>Социальные сети</h2>
          <div class="social-row social-row--stack">
            ${socials}
          </div>
        </article>
      </div>
    </section>
      ${renderContactCarouselSection(
        "founders-track",
        "",
        "Учредители",
      "Контакты учредителей и ключевых представителей фестиваля.",
      content.contacts.founders || [],
      "Карточки учредителей можно дополнить в админке."
    )}
    ${renderContactCarouselSection(
      "orgcommittee-track",
      "",
      "Организаторы",
      "Рабочие контакты организаторов фестиваля по вопросам организации, программы и сопровождения.",
      content.contacts.orgCommittee || [],
      "Карточки организаторов фестиваля пока не опубликованы."
    )}
      ${renderContactCarouselSection(
        "media-team-track",
        "",
        "Медиа-команда",
        "Контакты для визуального сопровождения, публикаций и медийной координации.",
        content.contacts.mediaTeam || [],
        "Карточки медиакоманды пока не заполнены. Их можно добавить в админке."
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
    renderProgramsOverviewSection(),
    renderStageSection(content.home.stages),
    renderFactsSection(content.home.facts),
    renderVideoCarouselSection(
      "stars-on-screen-videos",
      "",
      "Звезды на экране",
      "Интервью, обращения, встречи и видеоматериалы со звёздными гостями фестиваля.",
      videoCollections.starVideos,
      "Подборка «Звезды на экране» находится в подготовке."
    ),
    renderPeopleSection(
        "jury-track",
        "Жюри фестиваля",
        "Экспертный состав конкурсной программы фестиваля «Театральная Завалинка».",
        content.collections.jury,
        "Состав жюри можно добавить и обновить в админке.",
        { eyebrow: "", sectionId: "competitive-program" }
      ),
      renderPeopleSection(
        "workshops-track",
        "Ведущие мастер-классов",
        "Педагоги, режиссёры и представители театрального сообщества, формирующие учебную программу фестиваля.",
        workshopLeaders,
        "Список ведущих мастер-классов можно добавить и обновить в админке.",
        { eyebrow: "", sectionId: "educational-program" }
      ),
      renderPeopleSection(
        "guests-track",
        "Гости и звёзды",
        "Специальные гости, приглашённые артисты и участники культурно-досуговой программы фестиваля.",
        content.collections.guests,
        "Список гостей можно добавить и обновить в админке.",
        { eyebrow: "", sectionId: "cultural-program" }
      ),
    renderPeopleSection(
      "partners-track",
      "Партнёры",
      "Организации и площадки, поддерживающие фестиваль.",
      content.collections.partners,
      "Партнёры пока не опубликованы. Их можно добавить в админке.",
      { eyebrow: "" }
    )
  ].join("");

  return renderLayout(content, {
    activePath: "/home",
    pageTitle: "Главная",
    description: content.home.heroSubtitle,
    body
  });
}

function renderAboutPage(content) {
  const videoCollections = getAboutVideoCollections(content.about);
  const body = [
    renderAboutIntro(content.about),
    renderInfoGrid("Достижения фестиваля", content.about.achievements),
    renderInfoGrid("Официальный статус", content.about.statuses),
    renderVideoCarouselSection(
      "festival-life-videos",
      "",
      "Видео о жизни фестиваля",
      "Ролики о фестивальной атмосфере, участниках, программе и событиях фестивальных дней.",
      videoCollections.lifeVideos,
      "Подборка видеоматериалов о жизни фестиваля находится в подготовке."
    ),
    renderVideoCarouselSection(
      "guide-videos",
      "",
      "Видео-путеводители: 6 дней",
      "Серия роликов по дням фестиваля, помогающая быстро ориентироваться в программе и активности каждой даты.",
      videoCollections.guideVideos,
      "Видео-путеводители по дням фестиваля находятся в подготовке."
    ),
    renderVideoCarouselSection(
      "event-videos",
      "",
      "Видео с каждого основного мероприятия",
      "Отдельные ролики по ключевым мероприятиям фестиваля: показы, встречи, церемонии и специальные события.",
      videoCollections.eventVideos,
      "Подборка видео с основных мероприятий находится в подготовке.",
      { light: true }
    ),
    renderVideoHubCta(content.links)
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
    pageTitle: "Документы",
    description: "Документы фестиваля, положение, приказы и протоколы по годам.",
    body: renderDocumentsBody(content.documents)
  });
}

function renderContactsPage(content) {
  return renderLayout(content, {
    activePath: "/contacts",
    pageTitle: content.contacts.pageTitle,
    description: "Контакты фестиваля, учредители и организационные сведения.",
    body: renderContactsBody(content)
  });
}

module.exports = {
  renderAboutPage,
  renderContactsPage,
  renderDocumentsPage,
  renderHomePage
};

