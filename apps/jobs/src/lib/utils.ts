import { randomBytes } from "node:crypto";

interface Secret {
  encryptedData: BufferSource;
  iv: BufferSource;
  key: CryptoKey;
}

export async function decryptSecret({ encryptedData, iv, key }: Secret) {
  const decryptedContent = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedData);
  const decoder = new TextDecoder();
  return decoder.decode(decryptedContent);
}

export function generateRandomString() {
  return randomBytes(16).toString("hex");
}
