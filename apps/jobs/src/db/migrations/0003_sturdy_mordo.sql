CREATE TABLE `github_app` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`webhook_secret` text NOT NULL,
	`client_id` text NOT NULL,
	`client_secret` text NOT NULL,
	`private_key` text NOT NULL,
	`app_id` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `applications` ADD `github_app_id` integer REFERENCES github_app(id);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
ALTER TABLE `applications` DROP COLUMN `github_repo_url`;--> statement-breakpoint
ALTER TABLE `applications` DROP COLUMN `github_branch`;