import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";

try { admin.app(); } catch { admin.initializeApp(); }

const bucket = admin.storage().bucket();

export async function ensureUrlFromImage(input) {
  if (typeof input === "string" && /^https?:\/\//.test(input)) return input;

  if (typeof input === "string" && input.startsWith("data:")) {
    const m = input.match(/^data:(.+?);base64,(.+)$/);
    if (!m) throw new Error("Invalid data URL");
    const contentType = m[1];
    const buf = Buffer.from(m[2], "base64");
    const name = `tmp/${uuidv4()}.png`;
    const file = bucket.file(name);
    await file.save(buf, { contentType, resumable: false });
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 60 * 60 * 1000
    });
    return url;
  }

  throw new Error("Unsupported image input");
}
