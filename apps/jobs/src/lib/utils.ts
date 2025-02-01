import { Buffer } from "node:buffer";

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

export async function encryptSecret(secretKey: string, l?: any) {
  try {
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
  catch (error) {
    if (l)
      l.error(error);
    throw error;
  }
}
