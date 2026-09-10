declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    TRACKER_OWNER_EMAIL?: string;
    BUCKET?: R2Bucket;
  }
}
