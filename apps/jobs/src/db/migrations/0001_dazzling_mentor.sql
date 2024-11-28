ALTER TABLE "application_environment_variables" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "application_environment_variables" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "application_environment_variables" ALTER COLUMN "application_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "application_environment_variables" ALTER COLUMN "environment_variable_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "github_app_id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "github_app_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "environment_variables" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "environment_variables" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "github_app" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "github_app" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;