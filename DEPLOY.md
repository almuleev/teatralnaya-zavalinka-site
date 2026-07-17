# Deploy на VPS (Ubuntu 24.04, Nginx, Let's Encrypt)

## 1) Установка пакетов на сервер

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx curl git ffmpeg rclone
```

Node.js 20 LTS + PM2:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 2) Загрузка проекта

```bash
sudo mkdir -p /var/www/teatralnaya-zavalinka
sudo chown -R $USER:$USER /var/www/teatralnaya-zavalinka
cd /var/www/teatralnaya-zavalinka
git clone <YOUR_REPO_URL> app
cd app
```

## 3) Установка зависимостей

```bash
npm install --omit=dev
```

## 4) Настройка `.env`

```bash
cp .env.example .env
```

Обязательные переменные:

```env
PORT=3000
NODE_ENV=production
SESSION_SECRET=change_me_long_random_string
ADMIN_USERNAME=your_admin_login
ADMIN_PASSWORD=your_admin_password
PUBLIC_SITE_URL=https://tzavalinka.ru
```

`PUBLIC_SITE_URL` используется для абсолютных ссылок и OpenGraph. Домен не зашит в коде и меняется через `.env`.

## 5) Сохранность `data` и `uploads` при обновлениях

Сделайте persistent-хранилище вне кода:

```bash
mkdir -p /var/www/teatralnaya-zavalinka/shared/data
mkdir -p /var/www/teatralnaya-zavalinka/shared/uploads/{docs,images,videos}
```

Один раз перенесите текущие данные:

```bash
cp -n data/site-content.json /var/www/teatralnaya-zavalinka/shared/data/site-content.json
rsync -a public/uploads/ /var/www/teatralnaya-zavalinka/shared/uploads/
```

И подключите их симлинками:

```bash
rm -rf data public/uploads
ln -s /var/www/teatralnaya-zavalinka/shared/data data
ln -s /var/www/teatralnaya-zavalinka/shared/uploads public/uploads
```

После этого обновления кода не затирают контент и загруженные файлы.

## 6) Запуск через PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

Проверка:

```bash
pm2 status
pm2 logs teatralnaya-zavalinka
```

## 7) Настройка Nginx

1. Скопируйте шаблон:

```bash
sudo cp deploy/nginx.site.conf.example /etc/nginx/sites-available/teatralnaya-zavalinka
```

2. Замените `tzavalinka.ru` на ваш домен, если вы разворачиваете копию.
3. Включите конфиг:

```bash
sudo ln -s /etc/nginx/sites-available/teatralnaya-zavalinka /etc/nginx/sites-enabled/teatralnaya-zavalinka
sudo nginx -t
sudo systemctl reload nginx
```

Маршруты:
- сайт: `/`, `/home`, `/info`, `/docs`, `/contacts`
- админка: `/admin`
- API: `/api/admin`
- загрузки: `/uploads`

В production `/uploads` отдает Nginx напрямую через `alias`, а Node.js использует эту раздачу только локально.

## 8) Выпуск SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d tzavalinka.ru -d www.tzavalinka.ru
```

Проверка автообновления:

```bash
sudo certbot renew --dry-run
```

## 9) Обновление сайта без потери данных

```bash
cd /var/www/teatralnaya-zavalinka/app
git pull
npm install --omit=dev
pm2 restart teatralnaya-zavalinka
```

`data/site-content.json` и `public/uploads` сохраняются, потому что это симлинки на `/shared`.

## 10) Бэкап на Яндекс.Диск

Для бэкапа используется `deploy/backup.sh` и `rclone` с remote `yadisk`.

Есть две линии резервных копий:
- `biweekly` - обновляется раз в 2 недели
- `bimonthly` - обновляется раз в 2 месяца

Они сохраняются раздельно:
- локально: `/var/backups/teatralnaya-zavalinka/biweekly/backup-latest.tar.gz`
- локально: `/var/backups/teatralnaya-zavalinka/bimonthly/backup-latest.tar.gz`
- на Яндекс.Диске: `teatralnaya-zavalinka-backups/biweekly/backup-latest.tar.gz`
- на Яндекс.Диске: `teatralnaya-zavalinka-backups/bimonthly/backup-latest.tar.gz`

Проверка вручную:

```bash
bash deploy/backup.sh biweekly
bash deploy/backup.sh bimonthly
```

Рекомендуемый cron-файл: `deploy/backup.cron.example`.

Важно: cron можно запускать каждый день, а сам скрипт будет пропускать запуск, пока интервал еще не наступил.
