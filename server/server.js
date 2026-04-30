const express = require("express");
const session = require("express-session");
const path = require("path");

const config = require("./config");
const { ensureProjectStructure } = require("./storage");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");

async function createServer() {
  await ensureProjectStructure();

  const app = express();
  const isProduction = process.env.NODE_ENV === "production";

  app.disable("x-powered-by");
  if (isProduction) {
    app.set("trust proxy", 1);
  }
  app.use(express.json({ limit: "3mb" }));
  app.use(
    session({
      name: "tz-session",
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 12
      }
    })
  );

  app.use("/assets", express.static(path.join(config.publicDir, "assets")));
  app.use("/uploads", express.static(path.join(config.publicDir, "uploads")));
  app.use("/api/admin", adminRoutes);
  app.use(publicRoutes);

  app.use((req, res) => {
    res.status(404).type("html").send("<!doctype html><html lang=\"ru\"><head><meta charset=\"utf-8\"><title>Страница не найдена</title></head><body><h1>404</h1><p>Страница не найдена.</p></body></html>");
  });

  app.use((error, req, res, next) => {
    console.error(error);
    const message = process.env.NODE_ENV === "production" ? "Внутренняя ошибка сервера." : error.message;

    if (req.path.startsWith("/api/")) {
      return res.status(500).json({ error: message });
    }

    return res.status(500).type("html").send(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Ошибка сервера</title></head><body><h1>Ошибка сервера</h1><p>${message}</p></body></html>`);
  });

  return app;
}

createServer()
  .then((app) => {
    app.listen(config.port, () => {
      console.log(`Teatralnaya Zavalinka is running on http://localhost:${config.port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
