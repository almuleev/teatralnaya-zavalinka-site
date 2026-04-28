const state = {
  content: null,
  dirty: false,
  activeSection: "overview"
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

const listSchemas = {
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
    itemLabel: "Факт",
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
    idPrefix: "person",
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
    idPrefix: "org",
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
  "collections.partners": { idPrefix: "partner", itemLabel: "Партнёр", fields: personFields },
  "collections.winners": { idPrefix: "winner", itemLabel: "Победитель", fields: personFields }
};

document.addEventListener("DOMContentLoaded", () => {
  bindBaseEvents();
  checkSession();
});

function bindBaseEvents() {
  document.querySelector("[data-login-form]")?.addEventListener("submit", handleLogin);
  document.querySelector("[data-save-button]")?.addEventListener("click", saveContent);
  document.querySelector("[data-reload-button]")?.addEventListener("click", loadContent);
  document.querySelector("[data-logout-button]")?.addEventListener("click", handleLogout);

  document.querySelectorAll("[data-section-link]").forEach((button) => {
    button.addEventListener("click", () => setActiveSection(button.dataset.sectionLink));
  });

  document.querySelectorAll("[data-path]").forEach((field) => {
    field.addEventListener("input", () => updateSimpleField(field));
    field.addEventListener("change", () => updateSimpleField(field));
  });

  document.querySelectorAll("[data-add-list-item]").forEach((button) => {
    button.addEventListener("click", () => addListItem(button.dataset.addListItem));
  });

  document.querySelectorAll("[data-upload-button]").forEach((button) => {
    button.addEventListener("click", () => uploadStaticField(button.dataset.uploadButton));
  });

  document.addEventListener("input", handleDynamicInput);
  document.addEventListener("change", handleDynamicInput);
  document.addEventListener("click", handleDynamicClick);

  window.addEventListener("beforeunload", (event) => {
    if (!state.dirty) {
      return;
    }

    event.preventDefault();
    event.returnValue = "";
  });
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
    state.dirty = false;
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
    state.dirty = false;
    syncSimpleFields();
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
    state.dirty = false;
    syncSimpleFields();
    renderAllLists();
    setMessage("[data-global-message]", "Изменения сохранены.", "success");
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
}

function setActiveSection(sectionName) {
  state.activeSection = sectionName;

  document.querySelectorAll("[data-section-link]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.sectionLink === sectionName);
  });

  document.querySelectorAll("[data-section]").forEach((section) => {
    section.classList.toggle("is-active", section.dataset.section === sectionName);
  });
}

function updateSimpleField(field) {
  if (!state.content) {
    return;
  }

  setByPath(state.content, field.dataset.path, field.value);
  markDirty();
}

function syncSimpleFields() {
  document.querySelectorAll("[data-path]").forEach((field) => {
    const value = getByPath(state.content, field.dataset.path);
    field.value = value == null ? "" : value;
  });
}

function normalizeContentShape(content) {
  const next = content || {};
  const legacyVideos = Array.isArray(next.about?.videos) ? next.about.videos : [];
  const paths = [
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

    setByPath(next, path, path === "about.lifeVideos" ? legacyVideos : []);
  });

  return next;
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
    container.innerHTML = `<div class="empty-state">Пока ничего нет. Используйте кнопку «Добавить».</div>`;
    return;
  }

  container.className = "list-stack";
  container.innerHTML = items
    .map((item, index) => renderItemCard(listPath, schema, item, index))
    .join("");
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
          <button class="admin-button admin-button--ghost" type="button" data-action="clear-upload">Очистить</button>
        </div>
      </div>
    `;
  }

  if (field.type === "textarea") {
    return `
      <label class="${fieldClass}">
        <span>${escapeHtml(field.label)}</span>
        <textarea rows="${field.rows || 3}" data-item-path="${escapeAttribute(itemPath)}">${escapeHtml(safeValue)}</textarea>
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

function addListItem(listPath) {
  const schema = listSchemas[listPath];
  const current = getByPath(state.content, listPath) || [];

  if (!schema) {
    return;
  }

  current.push(buildItem(schema));
  setByPath(state.content, listPath, current);
  renderList(listPath);
  markDirty();
}

function buildItem(schema) {
  const item = {
    id: `${schema.idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  };

  (schema.fields || []).forEach((field) => {
    if (field.type === "number") {
      item[field.name] = "";
      return;
    }

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

  if (action === "remove-item") {
    removeItem(button.dataset.listPath, Number(button.dataset.index));
    return;
  }

  if (action === "upload") {
    uploadFromRow(button.closest("[data-upload-row]"));
    return;
  }

  if (action === "clear-upload") {
    clearUpload(button.closest("[data-upload-row]"));
  }
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

  if (!fileInput || !targetInput || !fileInput.files?.length) {
    setMessage("[data-global-message]", "Сначала выберите файл для загрузки.", "error");
    return;
  }

  const result = await uploadFile(fileInput.files[0], kind);

  if (!result) {
    return;
  }

  targetInput.value = result.url;
  setByPath(state.content, path, result.url);
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
    return;
  }

  const result = await uploadFile(fileInput.files[0], kind);

  if (!result) {
    return;
  }

  targetInput.value = result.url;
  setByPath(state.content, path, result.url);
  fileInput.value = "";
  markDirty();
  setMessage("[data-global-message]", "Файл загружен.", "success");
}

async function clearUpload(row) {
  if (!row) {
    return;
  }

  const path = row.dataset.uploadPath;
  const targetInput = row.querySelector("[data-item-path]");
  const currentUrl = targetInput?.value.trim();

  if (!targetInput) {
    return;
  }

  if (currentUrl.startsWith("/uploads/")) {
    await fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: currentUrl })
    });
  }

  targetInput.value = "";
  setByPath(state.content, path, "");
  markDirty();
  setMessage("[data-global-message]", "Ссылка на файл очищена.", "success");
}

async function uploadFile(file, kind) {
  try {
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
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Не удалось загрузить файл.");
    }

    return payload;
  } catch (error) {
    setMessage("[data-global-message]", error.message, "error");
    return null;
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
  state.dirty = true;
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
