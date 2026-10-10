# Mid Day Meal System Full Backup

Run the timestamped full-backup workflow from the project root:

```powershell
npm.cmd run backup
```

Or run `backup_script.ps1`. The wrapper uses its own folder, so the project can
move to another drive or computer without editing the script.

Every successful run creates this structure under `Backup`:

```text
MidDayMeal_Full_Backup_YYYY-MM-DD_HH-mm-ss/
  project/                         editable source snapshot
  database/production-d1-full.sql full production Cloudflare D1 export
  database/production-d1.sqlite   verified portable production snapshot
  database/restore-local-d1.mjs   local restore helper
  database/local-wrangler-state/  local D1 state when available
  metadata/                        Git, runtime and Cloudflare inventory
  instructions.rtf                restore and plug-and-play guide
  backup-manifest.json            machine-readable description
  checksums.sha256                 integrity hashes
  BACKUP_COMPLETE                 completion marker
```

The snapshot excludes `node_modules`, generated builds, caches, `.git`, and
previous backups. Cloudflare secret values cannot be exported; source environment
files may contain secrets, so keep the entire backup private. `package-lock.json` recreates dependencies,
while `metadata/repository.bundle` preserves committed Git history and `project`
preserves the exact working tree, including uncommitted files.

Local SQLite files are captured using the online backup API rather than copying
open database/WAL files. Production table counts, integrity checks, configuration,
and exact Node.js/npm versions are recorded in metadata and the restore guide.
Cloudflare bindings still require credentials and internet access on another PC.

Verify a completed backup from the project root:

```powershell
node verify_backup.mjs "C:\path\to\MidDayMeal_Full_Backup_TIMESTAMP"
```

The command fails when the production D1 export is missing or incomplete. A
failed folder keeps `BACKUP_IN_PROGRESS` and writes `BACKUP_FAILED.txt`; only a
folder containing `BACKUP_COMPLETE` is a valid restore point.
