# Mid Day Meal System Backup

Each backup folder contains the editable application source, package lockfile,
database migrations, Sites/Cloudflare configuration, public assets, build
support files, and a snapshot of the current local D1 database. The folder also
contains `instructions.rtf` with the complete restore and agent handoff guide.

## Run on another computer

1. Extract the ZIP to a normal writable folder.
2. Install Node.js 22.13 or newer.
3. Open a terminal in the extracted `Mid Day Meal` folder.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open the local URL printed by the development server.

The `.wrangler/state` folder contains the backed-up local database. Keep that
folder with the project if the existing local records are needed. The `build`
folder is also included because `vite.config.ts` depends on its plugin file.

## Production-style local check

Run:

```powershell
npm run build
npm run start
```

For a completely new empty database, provide `INITIAL_ADMIN_PASSWORD` as a
secret environment binding during the first startup. Existing backed-up users
do not need to be recreated.

## Continue editing with an agent

Open the extracted project folder as the agent workspace. Before handing off
changes, run:

```powershell
npm test
npx tsc --noEmit
npm run lint
npx drizzle-kit check
```

## Security

This backup can contain local operational records, user profiles, session
metadata, and password hashes. Store and transfer the ZIP as a private file.
Do not upload it to a public repository or public file-sharing location.
