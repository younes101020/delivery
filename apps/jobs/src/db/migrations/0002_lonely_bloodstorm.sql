CREATE TABLE IF NOT EXISTS "databases" (
	"id" serial PRIMARY KEY NOT NULL,
	"image" text NOT NULL,
	"port" integer NOT NULL,
	"credentials_env_var" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
