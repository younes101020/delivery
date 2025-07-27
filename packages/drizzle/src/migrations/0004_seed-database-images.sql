INSERT INTO databases (image, port, "credentialsEnvVar") VALUES
    ('postgres', 5432, '["POSTGRES_USER", "POSTGRES_PASSWORD"]'),
    ('mongo', 27017, '["MONGO_INITDB_ROOT_USERNAME", "MONGO_INITDB_ROOT_PASSWORD"]'),
    ('redis', 6379, '["REDIS_PASSWORD", "REDIS_USER"]'),
    ('mariadb', 3306, '["MARIADB_ROOT_PASSWORD"]'),
    ('mysql', 3306, '["MYSQL_ROOT_PASSWORD", "MYSQL_USER", "MYSQL_PASSWORD"]');