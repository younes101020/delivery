export const DATABASE_INSTANCE_REPLICAS = 1;

export const databases = [
  {
    image: "postgres",
    databaseCredentialsEnvVar: ["POSTGRES_USER", "POSTGRES_PASSWORD"],
    port: 5432,
  },
  {
    image: "mongo",
    databaseCredentialsEnvVar: ["MONGO_INITDB_ROOT_USERNAME", "MONGO_INITDB_ROOT_PASSWORD"],
    port: 27017,
  },
  {
    image: "redis",
    databaseCredentialsEnvVar: ["REDIS_PASSWORD"],
    port: 6379,
  },
  {
    image: "mariadb",
    databaseCredentialsEnvVar: ["MARIADB_ROOT_PASSWORD"],
    port: 3306,
  },
  {
    image: "mysql",
    databaseCredentialsEnvVar: ["MYSQL_ROOT_PASSWORD", "MYSQL_USER", "MYSQL_PASSWORD"],
    port: 3306,
  },
];

export const databasesName = databases.map(db => db.image);

export const UNSUPPORTED_DATABASES_ERROR_MESSAGE = "Database type not supported.";
export const DATABASES_CONTAINER_NOT_FOUND_ERROR_MESSAGE = "Database container not found.";
export const DEFAULT_DATABASES_CREDENTIALS_ENV_VAR_NOT_FOUND_ERROR_MESSAGE = "This database does not have default credentials, you need to set them manually.";

export const NO_APPLICATION_TO_LINK_WITH_ERROR_MESSAGE = "Application target service not found.";

export const NO_CONTAINER_SERVICE_ERROR_MESSAGE = "No container found, make sure the service is a container.";
