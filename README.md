[**Русский**](README.md) | [English](README.en.md)

# Театральная Завалинка

[![CI](https://github.com/almuleev/teatralnaya-zavalinka-site/actions/workflows/ci.yml/badge.svg)](https://github.com/almuleev/teatralnaya-zavalinka-site/actions/workflows/ci.yml)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-386641)](https://nodejs.org/)
[![Лицензия: MIT](https://img.shields.io/badge/license-MIT-c6533c)](LICENSE)

Многостраничный сайт фестиваля «Театральная Завалинка» с серверным рендерингом и встроенной панелью управления содержимым.

Рабочий сайт: [tzavalinka.ru](https://tzavalinka.ru) и [teatrzavalinka.ru](https://teatrzavalinka.ru).

## Скриншоты

На снимках используется вымышленный демонстрационный набор данных из репозитория.

| Главная страница | О фестивале |
| --- | --- |
| [![Главная страница сайта фестиваля](docs/screenshots/demo-home.png)](docs/screenshots/demo-home.png) | [![Страница о фестивале](docs/screenshots/demo-about.png)](docs/screenshots/demo-about.png) |

| Каталог документов | Панель управления |
| --- | --- |
| [![Каталог документов фестиваля](docs/screenshots/demo-documents.png)](docs/screenshots/demo-documents.png) | [![Панель управления сайтом](docs/screenshots/demo-admin.png)](docs/screenshots/demo-admin.png) |

## Возможности

- Публичные страницы: `/home`, `/info`, `/docs` и `/contacts`.
- Защищённая паролем панель управления по адресу `/admin`.
- Хранение структурированного содержимого в JSON и серверный рендеринг страниц.
- Загрузка изображений, документов и видео.
- Оптимизация изображений и очистка неиспользуемых файлов.
- Адаптивный интерфейс на JavaScript без клиентского фреймворка.

## Технологии

- Node.js и Express
- Express Session, Express Rate Limit и Multer
- Vanilla JavaScript и CSS
- PM2 и Nginx для production-развёртывания

## Локальный запуск

Требования: Node.js 18+ и npm 9+.

В Windows запустите `run-local-server.bat` из корня проекта. Скрипт создаст локальный `.env` и рабочую копию демонстрационных данных, если их ещё нет. Если заданный порт занят, скрипт выберет следующий свободный порт и выведет фактический URL.

Альтернативный запуск:

```bash
npm install
copy .env.example .env
copy data\site-content.example.json data\site-content.json
npm run dev
```

Откройте `http://localhost:3000/home` или адрес, показанный скриптом запуска.

Локальные данные для входа в панель управления указаны в `.env.example` и предназначены только для демонстрационного режима.

## Проверки

```bash
npm test
npm audit --omit=dev
```

Тесты проверяют синтаксис, основные HTTP-маршруты, границы авторизации, фильтрацию опасных URL и обработку занятого порта.

## Данные репозитория

Production-содержимое и загруженные файлы не публикуются:

- `data/site-content.json` используется локально и исключён из Git.
- `data/site-content.example.json` содержит вымышленные демонстрационные данные.
- `public/uploads/**` исключён из Git, поскольку может содержать лицензируемые материалы, документы и персональные данные.

После клонирования создайте `data/site-content.json` из файла-примера или используйте `run-local-server.bat`.

## Production-конфигурация

Для production требуется приватный файл `.env`. При `NODE_ENV=production` сервер проверяет:

- `SESSION_SECRET` длиной не менее 32 символов.
- `ADMIN_USERNAME` длиной не менее 3 символов.
- `ADMIN_PASSWORD` длиной не менее 12 символов.

Production-содержимое и медиа должны храниться вне репозитория. Инструкции приведены в [DEPLOY.md](DEPLOY.md).

## Структура проекта

```text
data/
  site-content.example.json  # демонстрационные данные в Git
  site-content.json          # локальные или production-данные, исключены из Git
public/
  assets/
  uploads/                   # локальные или production-медиа, исключены из Git
server/
deploy/
```

## Лицензия

[MIT](LICENSE)
