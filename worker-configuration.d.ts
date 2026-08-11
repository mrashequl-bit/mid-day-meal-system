declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    INITIAL_ADMIN_PASSWORD?: string;
    SETTINGS_ENCRYPTION_KEY?: string;
  }
}
