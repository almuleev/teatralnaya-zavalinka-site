# Post-backup recovery checklist

Use these commands after restoring from a backup to re-apply production fixes.

## 1) Nginx config (tz.muleev.site)

```bash
sudo cp /var/www/teatralnaya-zavalinka/app/deploy/nginx.site.conf.example /etc/nginx/sites-available/teatralnaya-zavalinka
sudo nano /etc/nginx/sites-available/teatralnaya-zavalinka
```

Required settings:

- `server_name tz.muleev.site;`
- `client_max_body_size 1512m;`
- `location /uploads/` with `alias /var/www/teatralnaya-zavalinka/shared/uploads/;`
- caching headers (`expires 7d;`, `add_header Cache-Control "public";`)

Apply:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 2) PM2 restart

```bash
cd /var/www/teatralnaya-zavalinka/app
pm2 restart teatralnaya-zavalinka
pm2 save
pm2 status
```

## 3) Fix filesystem permissions (EACCES)

```bash
sudo chown -R $USER:$USER /var/www/teatralnaya-zavalinka
sudo chmod -R u+rwX /var/www/teatralnaya-zavalinka
sudo chmod -R go+rX /var/www/teatralnaya-zavalinka/shared
```
