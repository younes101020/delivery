export function transformEnvVars(envs: string) {
  if (!envs) {
    return [];
  }

  return envs
    .trim()
    .split(/\s+/)
    .map((env) => {
      const [key, value] = env.split("=");
      return {
        key,
        value,
      };
    });
}
