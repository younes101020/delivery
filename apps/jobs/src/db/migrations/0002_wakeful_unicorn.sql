CREATE TABLE IF NOT EXISTS "github_app_secret" (
	"id" serial PRIMARY KEY NOT NULL,
	"encrypted_data" text NOT NULL,
	"iv" text NOT NULL,
	"key" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "github_app" ADD COLUMN "secret_id" serial NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "github_app" ADD CONSTRAINT "github_app_secret_id_github_app_secret_id_fk" FOREIGN KEY ("secret_id") REFERENCES "public"."github_app_secret"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
