# Database persistence and backups

Each managed database service has a named Docker volume. Delivery mounts the volume at the engine's data directory, so data survives a container restart.

Database services use local Docker volumes and are constrained to a dedicated Swarm node. Before creating a database, label that node:

```sh
docker node update --label-add delivery.database=true <node-name>
```

## S3-compatible backups

The jobs service creates one backup per database every day at 02:00 UTC. Backups are written under `databases/<service>/<engine>/` in the configured bucket and objects older than seven days are removed.

Configure these environment variables on the jobs service:

```sh
S3_ENDPOINT=https://s3.example.com
S3_REGION=us-east-1
S3_BUCKET=delivery-backups
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_FORCE_PATH_STYLE=false
```

`S3_FORCE_PATH_STYLE=true` is commonly required by MinIO and other S3-compatible providers. The credentials need permission to list, put, and delete objects below the `databases/` prefix of the bucket.

Backups are logical exports made with the database engine's native tool. Restoring an archive is intentionally not automated by Delivery in this release. Local volumes are durable only on the labelled node; use a shared Docker volume driver if databases must move between Swarm nodes.
