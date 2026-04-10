import "server-only";

const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin";

export const ADMIN_COOKIE_NAME = "trayati_admin_session";

export function validateAdminCredentials(username: string, password: string) {
  const expectedUsername =
    process.env.TRAYATI_ADMIN_USERNAME ?? DEFAULT_ADMIN_USERNAME;
  const expectedPassword =
    process.env.TRAYATI_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;

  return username === expectedUsername && password === expectedPassword;
}
