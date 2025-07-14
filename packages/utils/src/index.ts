import { Buffer } from "node:buffer";

export async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function encryptSecret(secretKey: string) {
  const encryptionKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const data = encoder.encode(secretKey);
  const encryptedContent = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    encryptionKey,
    data,
  );

  return {
    encryptedData: Buffer.from(encryptedContent).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
    key: Buffer.from(await crypto.subtle.exportKey("raw", encryptionKey)).toString("base64"),
  };
}
