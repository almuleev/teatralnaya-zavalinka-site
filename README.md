# Театральная Завалинка

Сайт фестиваля на `Node.js + Express` с серверным рендерингом страниц и админ-панелью.

## Что есть в проекте

- Публичные страницы: `/home`, `/info`, `/docs`, `/contacts`.
- Админка: `/admin` (авторизация по логину/паролю из `.env`).
- Контент хранится в `data/site-content.json`.
- Загрузка медиа и документов через админку:
  - `public/uploads/docs`
  - `public/uploads/images`
  - `public/uploads/videos`

## Структура

```text
teatralnaya-zavalinka-site/
  data/
    site-content.json
  public/
    admin.html
    assets/
      css/
      images/
      js/
    uploads/
      docs/
      images/
      videos/
  server/
    auth.js
    config.js
    render.js
    server.js
    storage.js
    routes/
      admin.js
      public.js
  .env.example
  package.json
  README.md
```

## Требования

- Node.js 18+
- npm 9+

## Запуск

```bash
npm install
cp .env.example .env
npm start
```

Для разработки:

```bash
npm run dev
```

## Переменные окружения

```env
PORT=3000
SESSION_SECRET=change-me-please
ADMIN_USERNAME=manager
ADMIN_PASSWORD=change-me-too
PUBLIC_SITE_URL=http://localhost:3000
```

## Работа с админкой

1. Откройте `http://localhost:3000/admin`.
2. Войдите под учеткой из `.env`.
3. Внесите изменения в нужных разделах.
4. Для локального файла сначала нажмите кнопку `Загрузить`, затем `Сохранить изменения`.

## Где лежат данные

- Основной контент: `data/site-content.json`
- Загруженные документы: `public/uploads/docs`
- Загруженные изображения: `public/uploads/images`
- Загруженные видео: `public/uploads/videos`

## Примечание

Публичные страницы рендерятся сервером напрямую из `data/site-content.json`, поэтому изменения из админки применяются сразу, без сборки фронтенда.

## Публикация на сервере

Для развёртывания на VPS используйте [DEPLOY.md](./DEPLOY.md).

На сервере понадобятся:
- Node.js 20 LTS
- PM2
- Nginx
- `ffmpeg` для `webp`-картинок
- `rclone` для бэкапов на Яндекс.Диск
