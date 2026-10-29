import type Dockerode from "dockerode";

import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PassThrough } from "node:stream";
import { createGzip } from "node:zlib";

import env from "@/env";
import { getDocker } from "@/lib/remote-docker";

import type { Database } from "../dto";

const BACKUP_PREFIX = "databases";
const RETENTION_DAYS = 7;

function getS3Client() {
  if (!env.S3_ENDPOINT || !env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY)
    throw new Error("S3 backup configuration is missing. Set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.");

  return new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION ?? "us-east-1",
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
}

function parseEnvironment(environment: string[], key: string) {
  return environment.find(item => item.startsWith(`${key}=`))?.slice(key.length + 1);
}

function getBackupCommand(database: Database, environment: string[]) {
  if (database === "postgres") {
    const user = parseEnvironment(environment, "POSTGRES_USER");
    const password = parseEnvironment(environment, "POSTGRES_PASSWORD");
    return { command: ["pg_dumpall", "-U", user ?? "postgres"], environment: password ? [`PGPASSWORD=${password}`] : [] };
  }
  if (database === "mongo") {
    const user = parseEnvironment(environment, "MONGO_INITDB_ROOT_USERNAME");
    const password = parseEnvironment(environment, "MONGO_INITDB_ROOT_PASSWORD");
    return { command: ["mongodump", "--archive", "--username", user ?? "", "--password", password ?? "", "--authenticationDatabase", "admin"], environment: [] };
  }
  if (database === "redis") {
    const user = parseEnvironment(environment, "REDIS_USER");
    const password = parseEnvironment(environment, "REDIS_PASSWORD");
    return { command: ["redis-cli", "--user", user ?? "default", "--pass", password ?? "", "--rdb", "-"], environment: [] };
  }
  const password = parseEnvironment(environment, database === "mysql" ? "MYSQL_ROOT_PASSWORD" : "MARIADB_ROOT_PASSWORD");
  return {
    command: [database === "mysql" ? "mysqldump" : "mariadb-dump", "--all-databases", "--single-transaction", "--routines", "--events", "-uroot"],
    environment: password ? [`MYSQL_PWD=${password}`] : [],
  };
}

async function getRunningContainer(docker: Dockerode, serviceName: string) {
  const tasks = await docker.listTasks({ filters: { "service": [serviceName], "desired-state": ["running"] } });
  const containerId = tasks.find(task => task.Status.State === "running")?.Status.ContainerStatus?.ContainerID;
  if (!containerId)
    throw new Error(`No running container found for database service "${serviceName}".`);

  return docker.getContainer(containerId);
}

async function createDumpStream(docker: Dockerode, container: Dockerode.Container, database: Database) {
  const metadata = await container.inspect();
  const { command, environment } = getBackupCommand(database, metadata.Config.Env ?? []);
  const execution = await container.exec({ AttachStdout: true, AttachStderr: true, Cmd: command, Env: environment });
  const stream = await execution.start({ hijack: true, stdin: false });
  const gzip = createGzip();
  const stderrStream = new PassThrough();
  let stderr = "";
  stderrStream.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  docker.modem.demuxStream(stream, gzip, stderrStream);

  const completed = new Promise<void>((resolve, reject) => {
    stream.on("end", resolve);
    stream.on("error", reject);
  }).then(async () => {
    const result = await execution.inspect();
    if (result.ExitCode !== 0)
      throw new Error(`Database dump failed: ${stderr || "unknown command error"}`);

    gzip.end();
  });
  return { dump: gzip, completed };
}

function getBackupKey(serviceName: string, database: Database, createdAt = new Date()) {
  const timestamp = createdAt.toISOString().replace(/[:.]/g, "-");
  return `${BACKUP_PREFIX}/${serviceName}/${database}/${timestamp}.dump.gz`;
}

async function removeExpiredBackups(client: S3Client, serviceName: string, now = new Date()) {
  const prefix = `${BACKUP_PREFIX}/${serviceName}/`;
  const expiration = new Date(now);
  expiration.setUTCDate(expiration.getUTCDate() - RETENTION_DAYS);
  let continuationToken: string | undefined;

  do {
    const response = await client.send(new ListObjectsV2Command({ Bucket: env.S3_BUCKET, Prefix: prefix, ContinuationToken: continuationToken }));
    const expired = response.Contents?.filter(object => object.Key && object.LastModified && object.LastModified < expiration)
      .map(object => ({ Key: object.Key })) ?? [];
    if (expired.length > 0)
      await client.send(new DeleteObjectsCommand({ Bucket: env.S3_BUCKET, Delete: { Objects: expired, Quiet: true } }));
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);
}

export async function backupDatabaseService(serviceName: string) {
  const docker = await getDocker();
  const services = await docker.listServices({ filters: { name: [serviceName], label: ["resource=database"] } });
  const service = services[0];
  const database = service?.Spec?.Labels?.["delivery.database.type"] as Database | undefined;
  if (!service || !database)
    throw new Error(`Database service "${serviceName}" was not found or has no database type label.`);

  const container = await getRunningContainer(docker, serviceName);
  const { dump, completed } = await createDumpStream(docker, container, database);
  const client = getS3Client();
  const key = getBackupKey(serviceName, database);
  await Promise.all([
    client.send(new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Body: dump, ContentEncoding: "gzip" })),
    completed,
  ]);
  await removeExpiredBackups(client, serviceName);
  return key;
}

export const backupUtils = { getBackupCommand, getBackupKey, removeExpiredBackups };
