export const SESSION_COOKIE_NAME = "homelab_session";

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Web Crypto (not Node's `crypto` module) so this also works from
// middleware.ts, which runs on the Edge runtime. The token is a fixed
// value derived from ADMIN_PASSWORD — no server-side session store needed,
// and rotating ADMIN_PASSWORD invalidates every existing cookie for free.
export async function computeSessionToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`homelab-dash-session-v1:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hash);
}
