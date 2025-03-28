export const credentialsEnvKeys = {
  postgres: ["POSTGRES_USER", "POSTGRES_PASSWORD"],
  mongo: ["MONGO_INITDB_ROOT_USERNAME", "MONGO_INITDB_ROOT_PASSWORD"],
  redis: ["REDIS_PASSWORD"],
  mariadb: ["MARIADB_ROOT_PASSWORD"],
  mysql: ["MYSQL_ROOT_PASSWORD", "MYSQL_USER", "MYSQL_PASSWORD"],
};

export const databases = Object.keys(credentialsEnvKeys);
