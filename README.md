# Teatralnaya Zavalinka

[![CI](https://github.com/almuleev/teatralnaya-zavalinka-site/actions/workflows/ci.yml/badge.svg)](https://github.com/almuleev/teatralnaya-zavalinka-site/actions/workflows/ci.yml)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-386641)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-c6533c)](LICENSE)

Public portfolio version of a multi-page festival website with server-side rendering and a lightweight content administration area.

Live project: [tzavalinka.ru](https://tzavalinka.ru) and [teatrzavalinka.ru](https://teatrzavalinka.ru).

## Features

- Public pages: `/home`, `/info`, `/docs`, and `/contacts`.
- Password-protected admin area at `/admin`.
- JSON-based content model with immediate server rendering.
- Upload workflows for images, documents, and video.
- Image optimisation and unused-upload cleanup tools.
- Responsive vanilla JavaScript interface.

## Stack

- Node.js and Express
- Express Session, Express Rate Limit, Multer
- Vanilla JavaScript and CSS
- PM2 and Nginx for production deployment

## Run Locally

Requirements: Node.js 18+ and npm 9+.

On Windows, run `run-local-server.bat` from the project root. It creates a local `.env` and a runtime copy of the demo content when they are missing.

Alternatively:

```bash
npm install
copy .env.example .env
copy data\site-content.example.json data\site-content.json
npm run dev
```

Open `http://localhost:3000/home`.

Run the automated syntax and HTTP smoke checks with:

```bash
npm test
```

The local admin credentials are the public development values in `.env.example`. They are intentionally for local demos only.

## Portfolio Data Policy

This repository does not include production content or media:

- `data/site-content.json` is local-only and ignored by Git.
- `data/site-content.example.json` is a fictional, safe demo data set committed to the repository.
- `public/uploads/**` is ignored because it may contain licensed media, documents, and personal data.

After a fresh clone, create `data/site-content.json` from the example file, or let `run-local-server.bat` do it automatically.

## Production Configuration

Production deployment requires a private `.env` file. Never commit it. When `NODE_ENV=production`, the server requires:

- `SESSION_SECRET` with at least 32 characters.
- `ADMIN_USERNAME` with at least 3 characters.
- `ADMIN_PASSWORD` with at least 12 characters.

The production server also needs private production content and media mounted outside the repository. See [DEPLOY.md](DEPLOY.md) for the deployment-oriented setup.

## Project Structure

```text
data/
  site-content.example.json  # versioned fictional content
  site-content.json          # local or production content, ignored by Git
public/
  assets/
  uploads/                   # local or production media, ignored by Git
server/
deploy/
```

## License

[MIT](LICENSE)
