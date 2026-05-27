#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash deploy/backup.sh biweekly
#   bash deploy/backup.sh bimonthly
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

case "${BACKUP_KIND}" in
  biweekly|weekly)
    BACKUP_KIND="biweekly"
    BACKUP_INTERVAL="+14 days"
    ;;
  bimonthly|monthly)
    BACKUP_KIND="bimonthly"
    BACKUP_INTERVAL="+2 months"
    ;;
  *)
    echo "ERROR: backup kind must be 'biweekly' or 'bimonthly'"
    exit 1
    ;;
esac

if ! command -v date >/dev/null 2>&1; then
  echo "ERROR: date is not available"
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

STATE_DIR="${LOCAL_BACKUP_DIR}/.backup-state"
STATE_FILE="${STATE_DIR}/${BACKUP_KIND}.last-run"
LOCAL_ARCHIVE="${LOCAL_BACKUP_DIR}/${BACKUP_KIND}/backup-latest.tar.gz"
REMOTE_ARCHIVE="${RCLONE_REMOTE}:${RCLONE_REMOTE_DIR}/${BACKUP_KIND}/backup-latest.tar.gz"

should_run_backup() {
  if [[ ! -f "${STATE_FILE}" ]]; then
    return 0
  fi

  local last_run next_due now
  last_run="$(cat "${STATE_FILE}")"
  next_due="$(date -u -d "${last_run} ${BACKUP_INTERVAL}" +%s 2>/dev/null || true)"

  if [[ -z "${next_due}" ]]; then
    return 0
  fi

  now="$(date -u +%s)"
  [[ "${now}" -ge "${next_due}" ]]
}

if ! should_run_backup; then
  echo "Backup skipped: ${BACKUP_KIND} archive is not due yet."
  exit 0
fi

mkdir -p "$(dirname "${LOCAL_ARCHIVE}")" "${STATE_DIR}"

tar -czf "${LOCAL_ARCHIVE}" -C "${SHARED_DIR}" data/site-content.json uploads
rclone copyto "${LOCAL_ARCHIVE}" "${REMOTE_ARCHIVE}"
date -u +%Y-%m-%dT%H:%M:%SZ > "${STATE_FILE}"

echo "Backup updated:"
echo "  Local : ${LOCAL_ARCHIVE}"
echo "  Remote: ${REMOTE_ARCHIVE}"
