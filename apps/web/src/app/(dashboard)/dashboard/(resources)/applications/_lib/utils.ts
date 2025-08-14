export function plainEnvVarsToStructured(envs: string) {
  return envs
    .trim()
    .split(/\s+(?=\w+=")/)
    .map((env) => {
      const [key, value] = env.split("=");
      return {
        key,
        value,
      };
    });
}
