#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash deploy/backup.sh weekly
#   bash deploy/backup.sh monthly
#
# Optional args:
#   2: shared dir (default: /var/www/teatralnaya-zavalinka/shared)
#   3: local backup dir (default: /var/backups/teatralnaya-zavalinka)
#
# Environment variables:
#   RCLONE_REMOTE (default: yadisk)
#   RCLONE_REMOTE_DIR (default: teatralnaya-zavalinka-backups)

BACKUP_KIND="${1:-}"
SHARED_DIR="${2:-/var/www/teatralnaya-zavalinka/shared}"
LOCAL_BACKUP_DIR="${3:-/var/backups/teatralnaya-zavalinka}"
RCLONE_REMOTE="${RCLONE_REMOTE:-yadisk}"
RCLONE_REMOTE_DIR="${RCLONE_REMOTE_DIR:-teatralnaya-zavalinka-backups}"

if [[ "${BACKUP_KIND}" != "weekly" && "${BACKUP_KIND}" != "monthly" ]]; then
  echo "ERROR: backup kind must be 'weekly' or 'monthly'"
  exit 1
fi

if ! command -v rclone >/dev/null 2>&1; then
  echo "ERROR: rclone is not installed"
  exit 1
fi

if [[ ! -f "${SHARED_DIR}/data/site-content.json" ]]; then
  echo "ERROR: ${SHARED_DIR}/data/site-content.json not found"
  exit 1
fi

if [[ ! -d "${SHARED_DIR}/uploads" ]]; then
  echo "ERROR: ${SHARED_DIR}/uploads not found"
  exit 1
fi

mkdir -p "${LOCAL_BACKUP_DIR}"

LOCAL_ARCHIVE="${LOCAL_BACKUP_DIR}/${BACKUP_KIND}-latest.tar.gz"
REMOTE_ARCHIVE="${RCLONE_REMOTE}:${RCLONE_REMOTE_DIR}/${BACKUP_KIND}-latest.tar.gz"

tar -czf "${LOCAL_ARCHIVE}" -C "${SHARED_DIR}" data/site-content.json uploads
rclone copyto "${LOCAL_ARCHIVE}" "${REMOTE_ARCHIVE}"

echo "Backup updated:"
echo "  Local : ${LOCAL_ARCHIVE}"
echo "  Remote: ${REMOTE_ARCHIVE}"
