async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyPassword(password: string, hash: string) {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

export { hashPassword, verifyPassword };
