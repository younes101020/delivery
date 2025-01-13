ALTER TABLE "application_environment_variables" DROP CONSTRAINT "application_environment_variables_application_id_applications_id_fk";
--> statement-breakpoint
ALTER TABLE "applications" DROP CONSTRAINT "applications_github_app_id_github_app_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "application_environment_variables" ADD CONSTRAINT "application_environment_variables_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "applications" ADD CONSTRAINT "applications_github_app_id_github_app_id_fk" FOREIGN KEY ("github_app_id") REFERENCES "public"."github_app"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
