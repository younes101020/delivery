ALTER TABLE "users" DROP COLUMN IF EXISTS "role";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verified";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verification_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verification_token_expires_at";