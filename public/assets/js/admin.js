const state = {
  content: null,
  dirty: false,
  activeSection: "site",
  activeSubsections: {
    home: "home-main",
    about: "about-main",
    documents: "documents-main",
    contacts: "contacts-main"
  }
};

const uploadLimits = {
  image: { bytes: 10 * 1000 * 1000, label: "10 МБ" },
  document: { bytes: 100 * 1000 * 1000, label: "100 МБ" },
  video: { bytes: 1500 * 1000 * 1000, label: "1,5 ГБ" }
};

const personFields = [
  { name: "name", label: "Имя или заголовок", full: true },
  { name: "role", label: "Роль / подпись", full: true },
  { name: "description", label: "Описание", type: "textarea", rows: 3, full: true },
  { name: "image", label: "Изображение", type: "url", uploadKind: "image", accept: "image/*", full: true },
  { name: "link", label: "Внешняя ссылка", type: "url" },
  { name: "meta", label: "Короткая пометка" }
];

const videoFields = [
  { name: "title", label: "Название", full: true },
  { name: "description", label: "Краткое описание", type: "textarea", rows: 2, full: true },
  { name: "url", label: "Видео файл или URL", type: "url", uploadKind: "video", accept: ".mp4,.webm,.mov", full: true },
  { name: "poster", label: "Постер", type: "url", uploadKind: "image", accept: "image/*", full: true }
];

const defaultPrograms = [
  {
    id: "program-competitive",
    title: "Конкурсная программа",
    description: "Конкурсные показы спектаклей, экспертная оценка заявок и подведение итогов фестиваля-конкурса."
  },
  {
    id: "program-educational",
    title: "Учебная программа",
    description: "Мастер-классы, творческие встречи, профессиональные разборы и обмен опытом для участников и руководителей коллективов."
  },
  {
    id: "program-cultural",
    title: "Культурно-досуговая программа",
    description: "Творческие встречи, специальные события фестиваля и культурная программа для участников и гостей."
  }
];

const defaultUi = {
  navHome: "Главная",
  navAbout: "О фестивале",
  navDocs: "Документы",
  navContacts: "Контакты",
  skipLinkLabel: "Перейти к содержанию",
  brandAriaLabel: "На главную",
  brandSubtitle: "Официальный сайт фестиваля",
  menuLabel: "Меню",
  primaryNavLabel: "Основная навигация",
  headerRegulationLabel: "Положение",
  headerApplicationLabel: "Подать заявку",
  footerNavigationTitle: "Навигация",
  footerContactsTitle: "Связь",
  footerCreatorPrefix: "Сайт разработал",
  homeHeroEyebrow: "Фестиваль 2025",
  heroApplicationLabel: "Подать заявку",
  heroRegulationLabel: "Положение о фестивале",
  heroContactLabel: "Быстрый контакт:",
  personMoreLabel: "Подробнее",
  carouselHint: "",
  docsSearchLabel: "Поиск по документам",
  docsSearchPlaceholder: "Введите название, тип, описание или год",
  docsSearchClearLabel: "Сбросить",
  docsSearchEmptyText: "По вашему запросу документы не найдены. Попробуйте изменить формулировку или очистить поиск."
};

const defaultSections = {
  homePrograms: {
    eyebrow: "Составляющие фестиваля",
    title: "Три программы фестиваля",
    description: "Фестиваль объединяет конкурсную, учебную и культурно-досуговую программы, которые вместе формируют его основную структуру."
  },
  homeStages: {
    eyebrow: "Этапы фестиваля",
    title: "Календарь участия",
    description: "Основные сроки и формат проведения фестиваля «Театральная Завалинка 2025»."
  },
  homeParticipation: {
    eyebrow: "Условия участия",
    title: "Что важно знать участникам",
    description: ""
  },
  homeStarVideos: {
    eyebrow: "",
    title: "Звезды на экране",
    description: "Интервью, обращения, встречи и видеоматериалы со звёздными гостями фестиваля.",
    emptyText: "Подборка «Звезды на экране» находится в подготовке."
  },
  homeJury: {
    eyebrow: "",
    title: "Жюри фестиваля",
    description: "Экспертный состав конкурсной программы фестиваля «Театральная Завалинка».",
    emptyText: "Состав жюри можно добавить и обновить в админке."
  },
  homeWorkshops: {
    eyebrow: "",
    title: "Ведущие мастер-классов",
    description: "Педагоги, режиссёры и представители театрального сообщества, формирующие учебную программу фестиваля.",
    emptyText: "Список ведущих мастер-классов можно добавить и обновить в админке."
  },
  homeGuests: {
    eyebrow: "",
    title: "Гости и звёзды",
    description: "Специальные гости, приглашённые артисты и участники культурно-досуговой программы фестиваля.",
    emptyText: "Список гостей можно добавить и обновить в админке."
  },
  homePartners: {
    eyebrow: "",
    title: "Партнёры",
    description: "Организации и площадки, поддерживающие фестиваль.",
    emptyText: "Партнёры пока не опубликованы. Их можно добавить в админке."
  },
  aboutHero: { eyebrow: "О фестивале" },
  aboutAchievements: { eyebrow: "", title: "Достижения фестиваля", description: "" },
  aboutStatuses: { eyebrow: "", title: "Официальный статус", description: "" },
  aboutLifeVideos: {
    eyebrow: "",
    title: "Видео о жизни фестиваля",
    description: "Ролики о фестивальной атмосфере, участниках, программе и событиях фестивальных дней.",
    emptyText: "Подборка видеоматериалов о жизни фестиваля находится в подготовке."
  },
  aboutGuideVideos: {
    eyebrow: "",
    title: "Видео-путеводители: 6 дней",
    description: "Серия роликов по дням фестиваля, помогающая быстро ориентироваться в программе и активности каждой даты.",
    emptyText: "Видео-путеводители по дням фестиваля находятся в подготовке."
  },
  aboutEventVideos: {
    eyebrow: "",
    title: "Видео с каждого основного мероприятия",
    description: "Отдельные ролики по ключевым мероприятиям фестиваля: показы, встречи, церемонии и специальные события.",
    emptyText: "Подборка видео с основных мероприятий находится в подготовке."
  },
  aboutVideoHub: {
    title: "Больше видеоматериалов",
    description: "Следите за новыми публикациями фестиваля в социальных сетях."
  },
  documentsHero: {
    eyebrow: "Документы",
    title: "Документы фестиваля",
    description: "Актуальные документы и архив публикаций по годам. Материалы отсортированы по убыванию года."
  },
  documentsCurrent: { eyebrow: "Текущий год" },
  documentsArchive: { eyebrow: "Архив", title: "Предыдущие публикации", description: "" },
  contactsHero: { eyebrow: "" },
  contactsOrganization: { title: "Организационные сведения", description: "" },
  contactsSocials: { title: "Социальные сети", description: "" },
  contactsFounders: {
    eyebrow: "",
    title: "Учредители",
    description: "Контакты учредителей и ключевых представителей фестиваля.",
    emptyText: "Карточки учредителей можно дополнить в админке."
  },
  contactsOrganizers: {
    eyebrow: "",
    title: "Организаторы",
    description: "Рабочие контакты организаторов фестиваля по вопросам организации, программы и сопровождения.",
    emptyText: "Карточки организаторов фестиваля пока не опубликованы."
  },
  contactsMediaTeam: {
    eyebrow: "",
    title: "Медиа-команда",
    description: "Контакты для визуального сопровождения, публикаций и медийной координации.",
    emptyText: "Карточки медиакоманды пока не заполнены. Их можно добавить в админке."
  }
};

const listSchemas = {
  "home.programs": {
    idPrefix: "program",
    itemLabel: "Программа",
    fields: [
      { name: "title", label: "Название", full: true },
      { name: "description", label: "Описание", type: "textarea", rows: 3, full: true }
    ]
  },
  "home.stages": {
    idPrefix: "stage",
    itemLabel: "Этап",
    fields: [
      { name: "title", label: "Заголовок", full: true },
      { name: "meta", label: "Срок / формат", full: true },
      { name: "description", label: "Описание", type: "textarea", rows: 3, full: true }
    ]
  },
  "home.facts": {
    idPrefix: "fact",
    itemLabel: "Условие",
    fields: [
      { name: "title", label: "Заголовок", full: true },
      { name: "text", label: "Текст", type: "textarea", rows: 3, full: true }
    ]
  },
  "about.achievements": {
    idPrefix: "achievement",
    itemLabel: "Достижение",
    fields: [
      { name: "title", label: "Заголовок", full: true },
      { name: "text", label: "Текст", type: "textarea", rows: 3, full: true }
    ]
  },
  "about.statuses": {
    idPrefix: "status",
    itemLabel: "Статус",
    fields: [
      { name: "title", label: "Заголовок", full: true },
      { name: "text", label: "Текст", type: "textarea", rows: 3, full: true }
    ]
  },
  "about.lifeVideos": { idPrefix: "life-video", itemLabel: "Видео", fields: videoFields },
  "about.starVideos": { idPrefix: "star-video", itemLabel: "Видео", fields: videoFields },
  "about.guideVideos": { idPrefix: "guide-video", itemLabel: "Видео", fields: videoFields },
  "about.eventVideos": { idPrefix: "event-video", itemLabel: "Видео", fields: videoFields },
  documents: {
    idPrefix: "document",
    itemLabel: "Документ",
    defaults: {
      buttonLabel: "Открыть",
      status: "published"
    },
    fields: [
      { name: "title", label: "Название документа", full: true },
      { name: "year", label: "Год", type: "number", valueType: "number" },
      { name: "type", label: "Тип документа" },
      { name: "buttonLabel", label: "Текст кнопки" },
      {
        name: "status",
        label: "Статус",
        type: "select",
        options: [
          { value: "published", label: "Доступен" },
          { value: "soon", label: "Скоро" },
          { value: "archive", label: "Архив" }
        ]
      },
      { name: "description", label: "Краткое описание", type: "textarea", rows: 3, full: true },
      { name: "url", label: "Файл или внешний URL", type: "url", uploadKind: "document", accept: ".pdf,.doc,.docx", full: true }
    ]
  },
  "contacts.founders": {
    idPrefix: "founder",
    itemLabel: "Карточка",
    fields: [
      { name: "name", label: "Имя", full: true },
      { name: "role", label: "Должность", full: true },
      { name: "phone", label: "Телефон" },
      { name: "email", label: "Email", type: "email" },
      { name: "image", label: "Изображение", type: "url", uploadKind: "image", accept: "image/*", full: true }
    ]
  },
  "contacts.orgCommittee": {
    idPrefix: "organizer",
    itemLabel: "Карточка",
    fields: [
      { name: "name", label: "Имя", full: true },
      { name: "role", label: "Должность", full: true },
      { name: "phone", label: "Телефон" },
      { name: "email", label: "Email", type: "email" },
      { name: "image", label: "Изображение", type: "url", uploadKind: "image", accept: "image/*", full: true }
    ]
  },
  "contacts.mediaTeam": {
    idPrefix: "media",
    itemLabel: "Карточка",
    fields: [
      { name: "name", label: "Имя", full: true },
      { name: "role", label: "Должность", full: true },
      { name: "phone", label: "Телефон" },
      { name: "email", label: "Email", type: "email" },
      { name: "image", label: "Изображение", type: "url", uploadKind: "image", accept: "image/*", full: true }
    ]
  },
  "contacts.socials": {
    idPrefix: "social",
    itemLabel: "Соцсеть",
    fields: [
      { name: "label", label: "Название" },
      { name: "url", label: "Ссылка", type: "url", full: true }
    ]
  },
  "collections.jury": { idPrefix: "jury", itemLabel: "Жюри", fields: personFields },
  "collections.experts": { idPrefix: "expert", itemLabel: "Эксперт", fields: personFields },
  "collections.guests": { idPrefix: "guest", itemLabel: "Гость", fields: personFields },
  "collections.partners": { idPrefix: "partner", itemLabel: "Партнер", fields: personFields },
  "collections.winners": { idPrefix: "winner", itemLabel: "Победитель", fields: personFields }
};

document.addEventListener("DOMContentLoaded", () => {
  if (typeof globalThis.structuredClone !== "function") {
    globalThis.structuredClone = (value) => JSON.parse(JSON.stringify(value));
  }

  bindBaseEvents();
  syncDirtyIndicator();
  checkSession();
});

function bindBaseEvents() {
  document.querySelector("[data-login-form]")?.addEventListener("submit", handleLogin);
  document.querySelector("[data-save-button]")?.addEventListener("click", saveContent);
  document.querySelector("[data-reload-button]")?.addEventListener("click", loadContent);
  document.querySelector("[data-cleanup-media-button]")?.addEventListener("click", cleanupUnusedMedia);
  document.querySelector("[data-logout-button]")?.addEventListener("click", handleLogout);

  document.querySelectorAll("[data-section-link]").forEach((button) => {
    button.addEventListener("click", () => setActiveSection(button.dataset.sectionLink));
  });

  document.querySelectorAll("[data-subsection-link]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveSubsection(button.dataset.parentSection, button.dataset.subsectionLink);
    });
  });

  document.querySelectorAll("[data-path]").forEach((field) => {
    field.addEventListener("input", () => updateSimpleField(field));
    field.addEventListener("change", () => updateSimpleField(field));
  });

  document.querySelectorAll("[data-add-list-item]").forEach((button) => {
    button.addEventListener("click", () => insertListItem(button.dataset.addListItem));
  });

  document.addEventListener("input", handleDynamicInput);
  document.addEventListener("change", handleDynamicInput);
  document.addEventListener("click", handleDynamicClick);
  document.addEventListener("click", handleStaticUploadClick);
  document.addEventListener("keydown", handleRichTextShortcut);

  window.addEventListener("beforeunload", (event) => {
    if (!state.dirty) {
      return;
    }

    event.preventDefault();
    event.returnValue = "";
  });
}

function handleStaticUploadClick(event) {
  const button = event.target.closest("[data-upload-button]");

  if (!button) {
    return;
  }

  event.preventDefault();
  uploadStaticField(button.dataset.uploadButton);
}

async function checkSession() {
  try {
    const response = await fetch("/api/admin/session");
    const session = await response.json();

    if (session.authenticated) {
      showAdmin();
      await loadContent();
      return;
    }

    showLogin();
  } catch (error) {
    showLogin();
    setMessage("[data-auth-message]", "Не удалось проверить сессию.", "error");
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const username = form.elements.username.value.trim();
  const password = form.elements.password.value;

  try {
    setMessage("[data-auth-message]", "Проверяем доступ...");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Не удалось войти.");
    }

    form.reset();
    showAdmin();
    await loadContent();
  } catch (error) {
    setMessage("[data-auth-message]", error.message, "error");
  }
}

async function handleLogout() {
  try {
    await fetch("/api/admin/logout", { method: "POST" });
  } finally {
    state.content = null;
    updateDirtyState(false);
    showLogin();
  }
}

async function loadContent() {
  try {
    setMessage("[data-global-message]", "Загружаем данные...");
    const response = await fetch("/api/admin/content");
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Не удалось загрузить контент.");
    }

    state.content = normalizeContentShape(payload);
    updateDirtyState(false);
    syncSimpleFields();
    syncDynamicText();
    renderAllLists();
    setActiveSection(state.activeSection);
    setMessage("[data-global-message]", "Данные загружены.", "success");
  } catch (error) {
    if (error.message) {
      setMessage("[data-global-message]", error.message, "error");
    }
  }
}

async function saveContent() {
  if (!state.content) {
    return;
  }

  if (document.querySelector(".upload-row.is-uploading")) {
    setMessage("[data-global-message]", "Дождитесь завершения загрузки файла, затем сохраните изменения.", "error");
    return;
  }

  const pendingFileInput = Array.from(document.querySelectorAll(".upload-row input[type=\"file\"]")).find(
    (input) => input instanceof HTMLInputElement && input.files && input.files.length > 0
  );

  if (pendingFileInput) {
    const pendingRow = pendingFileInput.closest(".upload-row");
    setUploadRowStatus(pendingRow, "Сначала загрузите выбранный файл.", "error");
    setMessage("[data-global-message]", "Есть выбранный файл без загрузки. Нажмите «Загрузить» рядом с ним.", "error");
    return;
  }

  try {
    setMessage("[data-global-message]", "Сохраняем изменения...");
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.content)
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Не удалось сохранить изменения.");
    }

    state.content = normalizeContentShape(payload);
    updateDirtyState(false);
    syncSimpleFields();
    syncDynamicText();
    renderAllLists();
    setMessage("[data-global-message]", "Изменения сохранены.", "success");
  } catch (error) {
    setMessage("[data-global-message]", error.message, "error");
  }
}

async function cleanupUnusedMedia() {
  if (document.querySelector(".upload-row.is-uploading")) {
    setMessage("[data-global-message]", "Дождитесь завершения загрузки файла перед очисткой медиа.", "error");
    return;
  }

  try {
    setMessage("[data-global-message]", "Проверяем неиспользуемые фото и видео...");

    const previewResponse = await fetch("/api/admin/uploads/cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dryRun: true })
    });
    const previewPayload = await previewResponse.json();

    if (!previewResponse.ok) {
      throw new Error(previewPayload.error || "Не удалось проверить неиспользуемые файлы.");
    }

    const summary = previewPayload.summary || {};
    const orphanCount = Number(summary.totalOrphanFiles || 0);

    if (orphanCount === 0) {
      setMessage("[data-global-message]", "Неиспользуемые фото и видео не найдены.", "success");
      return;
    }

    const previewMessage = [
      `Найдено неиспользуемых файлов: ${orphanCount}.`,
      `Фото: ${summary.images?.orphan || 0}`,
      `Видео: ${summary.videos?.orphan || 0}`,
      "",
      "Удалить эти файлы? Действие необратимо."
    ].join("\n");

    if (!window.confirm(previewMessage)) {
      setMessage("[data-global-message]", "Очистка отменена.", "success");
      return;
    }

    setMessage("[data-global-message]", "Удаляем неиспользуемые файлы...");

    const cleanupResponse = await fetch("/api/admin/uploads/cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dryRun: false })
    });
    const cleanupPayload = await cleanupResponse.json();

    if (!cleanupResponse.ok) {
      throw new Error(cleanupPayload.error || "Не удалось удалить неиспользуемые файлы.");
    }

    const cleanupSummary = cleanupPayload.summary || {};
    const deletedCount = Number(cleanupSummary.totalDeletedFiles || 0);
    const failedCount = Number(cleanupSummary.totalFailedFiles || 0);

    if (failedCount > 0) {
      setMessage(
        "[data-global-message]",
        `Удалено файлов: ${deletedCount}. Не удалось удалить: ${failedCount}.`,
        "error"
      );
      return;
    }

    setMessage("[data-global-message]", `Удалено неиспользуемых файлов: ${deletedCount}.`, "success");
  } catch (error) {
    setMessage("[data-global-message]", error.message, "error");
  }
}

function showLogin() {
  document.querySelector("[data-auth-panel]")?.classList.remove("is-hidden");
  document.querySelector("[data-admin-app]")?.classList.add("is-hidden");
  document.querySelector("[data-logout-button]")?.classList.add("is-hidden");
}

function showAdmin() {
  document.querySelector("[data-auth-panel]")?.classList.add("is-hidden");
  document.querySelector("[data-admin-app]")?.classList.remove("is-hidden");
  document.querySelector("[data-logout-button]")?.classList.remove("is-hidden");
  setMessage("[data-auth-message]", "");
  syncDirtyIndicator();
  syncSaveButtonState();
}

function setActiveSection(sectionName) {
  state.activeSection = sectionName;

  document.querySelectorAll("[data-section-link]").forEach((button) => {
    const isActive = button.dataset.sectionLink === sectionName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  document.querySelectorAll("[data-section]").forEach((section) => {
    section.classList.toggle("is-active", section.dataset.section === sectionName);
  });

  ensureActiveSubsection(sectionName);
  syncSubsections();
}

function setActiveSubsection(parentSection, subsectionName) {
  if (!parentSection || !subsectionName) {
    return;
  }

  state.activeSubsections[parentSection] = subsectionName;
  syncSubsections();
}

function ensureActiveSubsection(sectionName) {
  const firstSubsection = getFirstSubsection(sectionName);

  if (!firstSubsection) {
    return;
  }

  if (!state.activeSubsections[sectionName]) {
    state.activeSubsections[sectionName] = firstSubsection;
  }
}

function getFirstSubsection(sectionName) {
  return document.querySelector(`[data-subsection-link][data-parent-section="${sectionName}"]`)?.dataset.subsectionLink || null;
}

function syncSubsections() {
  document.querySelectorAll("[data-subsection-link]").forEach((button) => {
    const parentSection = button.dataset.parentSection;
    const isActive =
      parentSection === state.activeSection &&
      button.dataset.subsectionLink === state.activeSubsections[parentSection];

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  document.querySelectorAll("[data-subsection]").forEach((section) => {
    const parentSection = section.dataset.parentSection;
    const isActive =
      parentSection === state.activeSection &&
      section.dataset.subsection === state.activeSubsections[parentSection];

    section.classList.toggle("is-active", isActive);
  });
}

function updateSimpleField(field) {
  if (!state.content) {
    return;
  }

  setByPath(state.content, field.dataset.path, field.value);
  syncDynamicText();
  markDirty();
}

function syncSimpleFields() {
  document.querySelectorAll("[data-path]").forEach((field) => {
    const value = getByPath(state.content, field.dataset.path);
    field.value = value == null ? "" : value;
  });
}

function syncDynamicText() {
  document.querySelectorAll("[data-dynamic-text]").forEach((element) => {
    const value = getByPath(state.content, element.dataset.dynamicText);
    const fallback = element.dataset.dynamicFallback || "";
    element.textContent = value == null || value === "" ? fallback : value;
  });
}

function normalizeContentShape(content) {
  const next = content || {};
  const legacyVideos = Array.isArray(next.about?.videos) ? next.about.videos : [];

  next.ui = { ...defaultUi, ...(next.ui || {}) };
  next.sections = mergeDefaults(defaultSections, next.sections || {});

  if (next.contacts == null) {
    next.contacts = {};
  }

  if (!next.contacts.organizationLegalName && next.meta?.organizationLegalName) {
    next.contacts.organizationLegalName = next.meta.organizationLegalName;
  }

  if (!next.contacts.ogrn && next.meta?.ogrn) {
    next.contacts.ogrn = next.meta.ogrn;
  }

  const paths = [
    "home.programs",
    "home.stages",
    "home.facts",
    "about.achievements",
    "about.statuses",
    "about.lifeVideos",
    "about.starVideos",
    "about.guideVideos",
    "about.eventVideos",
    "documents",
    "contacts.founders",
    "contacts.orgCommittee",
    "contacts.mediaTeam",
    "contacts.socials",
    "collections.jury",
    "collections.experts",
    "collections.guests",
    "collections.partners",
    "collections.winners"
  ];

  paths.forEach((path) => {
    if (getByPath(next, path) != null) {
      return;
    }

    setByPath(next, path, path === "about.lifeVideos" ? legacyVideos : path === "home.programs" ? structuredClone(defaultPrograms) : []);
  });

  return next;
}

function mergeDefaults(defaults, value) {
  return Object.entries(defaults).reduce((result, [key, defaultValue]) => {
    const currentValue = value[key];
    result[key] =
      defaultValue && typeof defaultValue === "object" && !Array.isArray(defaultValue)
        ? { ...defaultValue, ...(currentValue || {}) }
        : currentValue ?? defaultValue;
    return result;
  }, { ...value });
}

function renderAllLists() {
  document.querySelectorAll("[data-list]").forEach((container) => {
    renderList(container.dataset.list);
  });
}

function renderList(listPath) {
  const container = document.querySelector(`[data-list="${listPath}"]`);
  const schema = listSchemas[listPath];
  const items = getByPath(state.content, listPath) || [];

  if (!container || !schema) {
    return;
  }

  if (!items.length) {
    container.className = "";
    container.innerHTML = '<div class="empty-state">Пока ничего нет. Используйте кнопку «Добавить».</div>';
    return;
  }

  container.className = "list-stack";
  container.innerHTML = items.map((item, index) => renderItemCard(listPath, schema, item, index)).join("");
}

function renderItemCard(listPath, schema, item, index) {
  const title = escapeHtml(item.name || item.title || item.label || `${schema.itemLabel} ${index + 1}`);
  const meta = item.role || item.meta || item.type || "";
  const fieldsHtml = schema.fields.map((field) => renderField(listPath, index, field, item[field.name])).join("");

  return `
    <article class="item-card">
      <div class="item-card__header">
        <div>
          <h4 class="item-card__title">${title}</h4>
          ${meta ? `<p class="item-card__meta">${escapeHtml(meta)}</p>` : ""}
        </div>
        <div class="item-card__actions">
          <button class="admin-button admin-button--ghost" type="button" data-action="insert-before" data-list-path="${escapeAttribute(listPath)}" data-index="${index}">Добавить выше</button>
          <button class="admin-button admin-button--ghost" type="button" data-action="insert-after" data-list-path="${escapeAttribute(listPath)}" data-index="${index}">Добавить ниже</button>
          <button class="admin-button admin-button--ghost" type="button" data-action="move-up" data-list-path="${escapeAttribute(listPath)}" data-index="${index}">Вверх</button>
          <button class="admin-button admin-button--ghost" type="button" data-action="move-down" data-list-path="${escapeAttribute(listPath)}" data-index="${index}">Вниз</button>
          <button class="admin-button admin-button--danger" type="button" data-action="remove-item" data-list-path="${escapeAttribute(listPath)}" data-index="${index}">Удалить</button>
        </div>
      </div>
      <div class="item-card__grid">
        ${fieldsHtml}
      </div>
    </article>
  `;
}

function renderField(listPath, index, field, value) {
  const itemPath = `${listPath}.${index}.${field.name}`;
  const fieldClass = field.full ? "field field--full" : "field";
  const safeValue = value == null ? "" : value;

  if (field.uploadKind) {
    return `
      <div class="${fieldClass}">
        <span>${escapeHtml(field.label)}</span>
        <div class="upload-row" data-upload-row data-upload-kind="${field.uploadKind}" data-upload-path="${escapeAttribute(itemPath)}">
          <input type="${field.type || "url"}" value="${escapeAttribute(safeValue)}" data-item-path="${escapeAttribute(itemPath)}">
          <input type="file" accept="${escapeAttribute(field.accept || "*/*")}" data-upload-file>
          <button class="admin-button admin-button--ghost" type="button" data-action="upload">Загрузить</button>
          <span class="upload-note">Если загружаете файл с компьютера, сначала нажмите «Загрузить», затем «Сохранить изменения».</span>
        </div>
      </div>
    `;
  }

  if (field.type === "textarea") {
    return `
      <label class="${fieldClass}">
        <span>${escapeHtml(field.label)}</span>
        <textarea rows="${field.rows || 3}" data-item-path="${escapeAttribute(itemPath)}" data-rich-text="true">${escapeHtml(safeValue)}</textarea>
      </label>
    `;
  }

  if (field.type === "select") {
    const options = (field.options || [])
      .map((option) => {
        const selected = option.value === safeValue ? " selected" : "";
        return `<option value="${escapeAttribute(option.value)}"${selected}>${escapeHtml(option.label)}</option>`;
      })
      .join("");

    return `
      <label class="${fieldClass}">
        <span>${escapeHtml(field.label)}</span>
        <select data-item-path="${escapeAttribute(itemPath)}">
          ${options}
        </select>
      </label>
    `;
  }

  return `
    <label class="${fieldClass}">
      <span>${escapeHtml(field.label)}</span>
      <input type="${field.type || "text"}" value="${escapeAttribute(safeValue)}" data-item-path="${escapeAttribute(itemPath)}">
    </label>
  `;
}

function insertListItem(listPath, index) {
  const schema = listSchemas[listPath];
  const current = getByPath(state.content, listPath) || [];

  if (!schema) {
    return;
  }

  const insertIndex = Number.isInteger(index) ? Math.max(0, Math.min(index, current.length)) : current.length;
  current.splice(insertIndex, 0, buildItem(schema));
  setByPath(state.content, listPath, current);
  renderList(listPath);
  markDirty();
}

function buildItem(schema) {
  const item = {
    id: `${schema.idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  };

  (schema.fields || []).forEach((field) => {
    item[field.name] = "";
  });

  return { ...item, ...(schema.defaults || {}) };
}

function handleDynamicInput(event) {
  const target = event.target;

  if (!target.matches("[data-item-path]") || !state.content) {
    return;
  }

  const path = target.dataset.itemPath;
  const field = getFieldSchema(path);
  setByPath(state.content, path, castValue(target.value, field));
  markDirty();
}

function handleDynamicClick(event) {
  const button = event.target.closest("button");

  if (!button || !state.content) {
    return;
  }

  const action = button.dataset.action;

  if (action === "move-up" || action === "move-down") {
    const direction = action === "move-up" ? -1 : 1;
    moveItem(button.dataset.listPath, Number(button.dataset.index), direction);
    return;
  }

  if (action === "insert-before" || action === "insert-after") {
    const offset = action === "insert-before" ? 0 : 1;
    insertListItem(button.dataset.listPath, Number(button.dataset.index) + offset);
    return;
  }

  if (action === "remove-item") {
    removeItem(button.dataset.listPath, Number(button.dataset.index));
    return;
  }

  if (action === "upload") {
    uploadFromRow(button.closest("[data-upload-row]"));
    return;
  }
}

function handleRichTextShortcut(event) {
  const target = event.target;
  const isBoldShortcut = (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "b";

  if (!isBoldShortcut || !target.matches("textarea[data-rich-text='true']")) {
    return;
  }

  event.preventDefault();
  wrapSelectionWithBold(target);
}

function moveItem(listPath, index, direction) {
  const items = [...(getByPath(state.content, listPath) || [])];
  const nextIndex = index + direction;

  if (nextIndex < 0 || nextIndex >= items.length) {
    return;
  }

  [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
  setByPath(state.content, listPath, items);
  renderList(listPath);
  markDirty();
}

function removeItem(listPath, index) {
  const items = [...(getByPath(state.content, listPath) || [])];

  if (!window.confirm("Удалить этот элемент?")) {
    return;
  }

  items.splice(index, 1);
  setByPath(state.content, listPath, items);
  renderList(listPath);
  markDirty();
}

async function uploadStaticField(path) {
  const fileInput = document.querySelector(`[data-upload-input="${path}"]`);
  const targetInput = document.querySelector(`[data-upload-target="${path}"]`);
  const kind = fileInput?.dataset.uploadKind;
  const row = fileInput?.closest("[data-upload-row], .upload-row");

  if (!fileInput || !targetInput || !fileInput.files?.length) {
    setMessage("[data-global-message]", "Сначала выберите файл для загрузки.", "error");
    setUploadRowStatus(row, "Сначала выберите файл для загрузки.", "error");
    return;
  }

  const result = await uploadFile(fileInput.files[0], kind, row);

  if (!result) {
    return;
  }

  applyUploadedUrl(path, targetInput, result.url);
  fileInput.value = "";
  markDirty();
  setMessage("[data-global-message]", "Файл загружен.", "success");
}

async function uploadFromRow(row) {
  if (!row) {
    return;
  }

  const path = row.dataset.uploadPath;
  const kind = row.dataset.uploadKind;
  const fileInput = row.querySelector("[data-upload-file]");
  const targetInput = row.querySelector("[data-item-path]");

  if (!fileInput?.files?.length || !targetInput) {
    setMessage("[data-global-message]", "Сначала выберите файл для загрузки.", "error");
    setUploadRowStatus(row, "Сначала выберите файл для загрузки.", "error");
    return;
  }

  const result = await uploadFile(fileInput.files[0], kind, row);

  if (!result) {
    return;
  }

  applyUploadedUrl(path, targetInput, result.url);
  fileInput.value = "";
  markDirty();
  setMessage("[data-global-message]", "Файл загружен.", "success");
}

function applyUploadedUrl(path, targetInput, url) {
  targetInput.value = url;

  if (!state.content || typeof state.content !== "object") {
    state.content = {};
  }

  setByPath(state.content, path, url);
}

async function uploadFile(file, kind, row = null) {
  const limit = uploadLimits[kind];

  if (limit && file.size > limit.bytes) {
    const errorText = `Файл слишком большой. Максимум: ${limit.label}.`;
    setMessage("[data-global-message]", errorText, "error");
    setUploadRowStatus(row, errorText, "error");
    return null;
  }

  try {
    setUploadRowBusy(row, true);
    setUploadRowStatus(row, "Ожидайте, файл загружается", "loading");
    setMessage("[data-global-message]", "Загружаем файл...");
    const formData = new FormData();
    formData.append("file", file);

    const endpoint =
      kind === "image"
        ? "/api/admin/upload/image"
        : kind === "video"
          ? "/api/admin/upload/video"
          : "/api/admin/upload/document";
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData
    });
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok) {
      if (response.status === 413 && limit) {
        throw new Error(`Файл слишком большой. Максимум: ${limit.label}.`);
      }

      throw new Error((payload && payload.error) || "Не удалось загрузить файл.");
    }

    setUploadRowStatus(row, "");
    return payload;
  } catch (error) {
    setMessage("[data-global-message]", error.message, "error");
    setUploadRowStatus(row, error.message || "Не удалось загрузить файл.", "error");
    return null;
  } finally {
    setUploadRowBusy(row, false);
  }
}

function ensureUploadStatusElement(row) {
  if (!row) {
    return null;
  }

  let status = row.querySelector("[data-upload-status]");

  if (status) {
    return status;
  }

  status = document.createElement("span");
  status.className = "upload-status";
  status.dataset.uploadStatus = "true";
  status.hidden = true;
  status.setAttribute("aria-live", "polite");
  status.setAttribute("aria-atomic", "true");

  const fileInput = row.querySelector("[data-upload-file], input[type=\"file\"]");

  if (fileInput && fileInput.nextSibling) {
    row.insertBefore(status, fileInput.nextSibling);
  } else if (fileInput) {
    fileInput.insertAdjacentElement("afterend", status);
  } else {
    row.appendChild(status);
  }

  return status;
}

function setUploadRowStatus(row, text = "", type = "") {
  const status = ensureUploadStatusElement(row);

  if (!status) {
    return;
  }

  status.textContent = text || "";
  status.hidden = !text;
  status.classList.toggle("is-loading", type === "loading");
  status.classList.toggle("is-error", type === "error");
}

function setUploadRowBusy(row, isBusy) {
  if (!row) {
    syncSaveButtonState();
    return;
  }

  row.classList.toggle("is-uploading", Boolean(isBusy));

  const button = row.querySelector("[data-action=\"upload\"], [data-upload-button]");
  const fileInput = row.querySelector("[data-upload-file], input[type=\"file\"]");

  if (button instanceof HTMLButtonElement) {
    button.disabled = Boolean(isBusy);
  }

  if (fileInput instanceof HTMLInputElement) {
    fileInput.disabled = Boolean(isBusy);
  }

  syncSaveButtonState();
}

function syncSaveButtonState() {
  const saveButton = document.querySelector("[data-save-button]");
  const cleanupButton = document.querySelector("[data-cleanup-media-button]");
  const hasActiveUpload = Boolean(document.querySelector(".upload-row.is-uploading"));

  if (saveButton instanceof HTMLButtonElement) {
    saveButton.disabled = hasActiveUpload;
    saveButton.setAttribute("aria-disabled", String(hasActiveUpload));
  }

  if (cleanupButton instanceof HTMLButtonElement) {
    cleanupButton.disabled = hasActiveUpload;
    cleanupButton.setAttribute("aria-disabled", String(hasActiveUpload));
  }
}

function getFieldSchema(itemPath) {
  const parts = itemPath.split(".");
  const fieldName = parts[parts.length - 1];
  let listPath = "";

  if (parts.length >= 4 && /^\d+$/.test(parts[2])) {
    listPath = parts.slice(0, 2).join(".");
  } else if (parts.length >= 3 && /^\d+$/.test(parts[1])) {
    listPath = parts[0];
  }

  const schema = listSchemas[listPath];
  return schema?.fields.find((field) => field.name === fieldName) || null;
}

function castValue(value, field) {
  if (field?.valueType === "number") {
    return value === "" ? "" : Number(value);
  }

  return value;
}

function markDirty() {
  updateDirtyState(true);
}

function updateDirtyState(isDirty) {
  state.dirty = isDirty;
  syncDirtyIndicator();
}

function syncDirtyIndicator() {
  const labels = document.querySelectorAll("[data-dirty-indicator]");

  document.body.classList.toggle("is-dirty", state.dirty);
  labels.forEach((label) => {
    label.textContent = state.dirty ? "Есть несохраненные изменения" : "Все изменения сохранены";
    label.classList.toggle("is-dirty", state.dirty);
    label.classList.toggle("admin-chip--muted", !state.dirty);
  });
}

function setMessage(selector, text, type = "") {
  const element = document.querySelector(selector);

  if (!element) {
    return;
  }

  element.textContent = text || "";
  element.classList.toggle("is-error", type === "error");
  element.classList.toggle("is-success", type === "success");
}

function getByPath(source, path) {
  return path.split(".").reduce((accumulator, key) => (accumulator == null ? undefined : accumulator[key]), source);
}

function setByPath(source, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((accumulator, key) => {
    if (accumulator[key] == null) {
      accumulator[key] = /^\d+$/.test(key) ? [] : {};
    }

    return accumulator[key];
  }, source);

  target[lastKey] = value;
}

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

function wrapSelectionWithBold(textarea) {
  const start = textarea.selectionStart || 0;
  const end = textarea.selectionEnd || 0;
  const value = textarea.value || "";
  const selected = value.slice(start, end);
  const content = selected || "жирный текст";
  const wrapped = `**${content}**`;

  textarea.focus();
  textarea.setRangeText(wrapped, start, end, "end");

  if (!selected) {
    const innerStart = start + 2;
    const innerEnd = innerStart + content.length;
    textarea.setSelectionRange(innerStart, innerEnd);
  }

  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.dispatchEvent(new Event("change", { bubbles: true }));
}
