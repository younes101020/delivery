import { describe, expect, it } from "vitest";

import { backupUtils } from "../backup";

describe("database backups", () => {
  it("builds isolated, timestamped backup keys", () => {
    expect(backupUtils.getBackupKey("orders", "postgres", new Date("2026-10-29T02:00:00.000Z")))
      .toBe("databases/orders/postgres/2026-10-29T02-00-00-000Z.dump.gz");
  });

  it("uses a native dump command for every supported engine", () => {
    expect(backupUtils.getBackupCommand("postgres", ["POSTGRES_USER=app", "POSTGRES_PASSWORD=secret"]).command[0]).toBe("pg_dumpall");
    expect(backupUtils.getBackupCommand("mongo", ["MONGO_INITDB_ROOT_USERNAME=app", "MONGO_INITDB_ROOT_PASSWORD=secret"]).command[0]).toBe("mongodump");
    expect(backupUtils.getBackupCommand("redis", ["REDIS_USER=app", "REDIS_PASSWORD=secret"]).command[0]).toBe("redis-cli");
    expect(backupUtils.getBackupCommand("mysql", ["MYSQL_ROOT_PASSWORD=secret"]).command[0]).toBe("mysqldump");
    expect(backupUtils.getBackupCommand("mariadb", ["MARIADB_ROOT_PASSWORD=secret"]).command[0]).toBe("mariadb-dump");
  });
});
