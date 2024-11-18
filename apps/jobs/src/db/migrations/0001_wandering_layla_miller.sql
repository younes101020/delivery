CREATE TABLE `application_environment_variables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` integer NOT NULL,
	`environment_variable_id` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`environment_variable_id`) REFERENCES `environment_variables`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`fqdn` text NOT NULL,
	`github_repo_url` text NOT NULL,
	`github_branch` text NOT NULL,
	`logs` text,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `environment_variables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`is_build_time` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`deleted_at` integer,
	`email_verified` integer DEFAULT false,
	`email_verification_token` text,
	`email_verification_token_expires_at` integer
);
--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
CREATE UNIQUE INDEX `applications_fqdn_unique` ON `applications` (`fqdn`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);