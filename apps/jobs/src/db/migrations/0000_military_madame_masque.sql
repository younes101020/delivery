CREATE TABLE IF NOT EXISTS "application_environment_variables" (
	"application_id" integer NOT NULL,
	"environment_variable_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"fqdn" text NOT NULL,
	"logs" text,
	"port" integer NOT NULL,
	"github_app_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	CONSTRAINT "applications_fqdn_unique" UNIQUE("fqdn")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "databases" (
	"id" serial PRIMARY KEY NOT NULL,
	"image" text NOT NULL,
	"port" integer NOT NULL,
	"credentialsEnvVar" json NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "environment_variables" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"is_build_time" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "github_app" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"webhook_secret" text NOT NULL,
	"client_id" text NOT NULL,
	"client_secret" text NOT NULL,
	"installation_id" serial NOT NULL,
	"app_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "github_app_secret" (
	"id" serial PRIMARY KEY NOT NULL,
	"encrypted_data" text NOT NULL,
	"iv" text NOT NULL,
	"key" text NOT NULL,
	"github_app_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"onboarding_completed" boolean DEFAULT false,
	"onboarding_completed_at" timestamp,
	"completed_by_user_id" text,
	"domain_name" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"email_verified" boolean DEFAULT false,
	"email_verification_token" text,
	"email_verification_token_expires_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "application_environment_variables" ADD CONSTRAINT "application_environment_variables_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "application_environment_variables" ADD CONSTRAINT "application_environment_variables_environment_variable_id_environment_variables_id_fk" FOREIGN KEY ("environment_variable_id") REFERENCES "public"."environment_variables"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "applications" ADD CONSTRAINT "applications_github_app_id_github_app_id_fk" FOREIGN KEY ("github_app_id") REFERENCES "public"."github_app"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "github_app_secret" ADD CONSTRAINT "github_app_secret_github_app_id_github_app_id_fk" FOREIGN KEY ("github_app_id") REFERENCES "public"."github_app"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
