ALTER TABLE "databases" ADD COLUMN "credentialsEnvVar" json NOT NULL;--> statement-breakpoint
ALTER TABLE "databases" DROP COLUMN IF EXISTS "credentials_env_var";