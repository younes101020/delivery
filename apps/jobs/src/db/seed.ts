import { drizzle } from "drizzle-orm/postgres-js";
import { seed } from "drizzle-seed";

import env from "@/env";
import { hashPassword } from "@/lib/auth";
import { encryptSecret } from "@/lib/utils";

import * as schema from "./schema";

const GITHUB_APP_PRIVATE_KEY
= `-----BEGIN RSA PRIVATE KEY-----
  MIIEowIBAAKCAQEAwYB5P9WtsMG2W8GwGJC0BQ1H6qAyNCN6VGrwqaDl3TRfHlrg
  vqZ6igwgrhFqpyAS1hhYwOgBRH9yal0FMfFxoKu9Fy9Q5XudoEI1L8xVZqVqXtFZ
  KbWwGMzFvVODS8HyPpL6cURu5E/kWFD6t8mTUE3QNkcZpJ9OOeYeEV3Zb2iJM2MY
  qF9FSYaR7sX+jZNNGCDZs3iy3wvnYoMnE/uYkrUw2E2VpBwZTWz/VUJYXwADL8HO
  mL+IHQ/AH6tF0KMlJGQn+IrPIbdkfGJz4I3qVo7yp7JFN3lLfZ/ndndcE+kHGc3R
  rNntHJbXa1rDMDDpP4lmCtmMaX2hYcSsqhN4iQIDAQABAoIBAHfZe0e4zYpR3mGW
  xvd6rCX9Jf3dIJ8nVzzSEk3ZOhtUEZYG+PcZLh6jwwFH1wO7K+LwFlBNr/RMaBOU
  lY1WXHbH+yNGpLlE6Lb7d0oszeC+/yHtjFkQOBgj94xSn9jBTBWRuG6kqz7l3RKG
  FXgbQcYQvB1Ld8r+WBBGrTLRps8v4NyVIcrOO1jYvbNFUAAsBBqaXdKfQzP2PZRg
  sEtWGHY00YhR6gEqUMl9AgXUcGPaZOJHF8e+fMDFnX6qNh+2HvxDcT4+FG98UHZU
  rkIuNKXN3s/nUWbKo1j7GpOPRx3YFKzJmT5mnYZAe0S/O7BvlkfPAobr2kR5A2gy
  YewlLsECgYEA4IhpePe+HmeaCdH1XwkzIfEkbF1H5kp/XUz7mgC2p2ywbxD6hBo1
  jGJ0NnJHhBY4ABiOXrqd8XJzPiQJOhGPqXkTGVg3B2c+0M9vZm3SWfHFbGVaOYsj
  nSAhC+GpqY4LycQEJuKXMBkxGYh/BlDZkfLJDtZ0v+w2MyLWwL0bwR0CgYEA3J8w
  kL3oNaH5RgUWBj3XPbAJD8g9p1v3vHE0AJBj/B5F31FeLXPGZb2QehzL2hBLe8V4
  6n1xyEUoXSRZU5bWFKTWmGtFa7QmP3a7JLHdFuPTQB4bV8kyXEQ8Ry8leymR9FGG
  J7GwRcxJ9DryORrZrGQBfNkikz+8EHSzlezR3j0CgYBSgwEPmXWz5EJlmwrPTBE7
  kxNEp1cDWkwUxHZIGrEeFkLU5sSiVEYUFPytw4UJuGHpVhx4TPV/JQ38EhJlO4Wo
  BFbz8QZFPYrkEp8MXz+kBvvyGXqUDhV+KrONISBQ++GmHLYiF6v/jyyakudzUQBF
  oWZxYpYKOBWPKHpIL/NiqQKBgQDFUL+lHHRX80IXDFvVRPk9+QOoKgaLiTzPnBx7
  4vEtVPgZcGGGLthsOkLIw7kQ9gAFBFROEfpRfWxEPxDfRWi/yK4vgNHJggC2JCPC
  DX2tf1jA2+9cXK1UUFjAY0QrmOTjcQYi+V0Q9O9wSGjUVYxH81kc5D3RlNVbLxYR
  KBhnpQKBgBgHJhBqzJM5Eh0NnZ3tYIwORTXPBGxzjF4g4F1B7KKRBUCYQz+sjMXj
  EuePFvBzgdMaCXtNKPEL6Tkc9Ks+tRiMHIktCbR7FkAY6U9xDBNP6nL2qI9hHXRm
  CwAzvIpMSNgfz6PyKUQr6FQlAgbNWbu5BfiP7IVd7HKUNpEoBZ0k
  -----END RSA PRIVATE KEY-----`;
const SECRET = await encryptSecret(GITHUB_APP_PRIVATE_KEY);

async function main() {
  const db = drizzle(env.DATABASE_URL);
  const passwordHash = await hashPassword(env.TEST_USERS_PASSWORD!);
  await seed(db, schema, { seed: 8475 }).refine(f => ({
    users: {
      columns: {
        passwordHash: f.default({ defaultValue: passwordHash }),
      },
    },
    githubAppSecret: {
      columns: {
        key: f.default({ defaultValue: SECRET.key }),
        iv: f.default({ defaultValue: SECRET.iv }),
        encryptedData: f.default({ defaultValue: SECRET.encryptedData }),
      },
    },
    systemConfig: {
      count: 0,
    },
  }));
  process.exit(0);
}

main().catch((err) => {
  console.error(`Error when seeding database: ${err}`);
  process.exit(1);
});
