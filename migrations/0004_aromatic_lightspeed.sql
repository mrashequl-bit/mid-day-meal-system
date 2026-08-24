CREATE TABLE `distribution_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`school_emis_code` text NOT NULL,
	`area_code` text NOT NULL,
	`planned_bread` integer DEFAULT 0 NOT NULL,
	`planned_egg` integer DEFAULT 0 NOT NULL,
	`planned_banana` integer DEFAULT 0 NOT NULL,
	`received_bread` integer DEFAULT 0 NOT NULL,
	`received_egg` integer DEFAULT 0 NOT NULL,
	`received_banana` integer DEFAULT 0 NOT NULL,
	`shortage_bread` integer DEFAULT 0 NOT NULL,
	`shortage_egg` integer DEFAULT 0 NOT NULL,
	`shortage_banana` integer DEFAULT 0 NOT NULL,
	`excess_bread` integer DEFAULT 0 NOT NULL,
	`excess_egg` integer DEFAULT 0 NOT NULL,
	`excess_banana` integer DEFAULT 0 NOT NULL,
	`problem_type` text NOT NULL,
	`reason` text NOT NULL,
	`comments` text,
	`proof_url` text,
	`status` text DEFAULT 'new' NOT NULL,
	`reported_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_emis_code`) REFERENCES `schools`(`emis_code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`area_code`) REFERENCES `areas`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dist_rep_date_school_unique` ON `distribution_reports` (`date`,`school_emis_code`);--> statement-breakpoint
CREATE INDEX `dist_rep_area_idx` ON `distribution_reports` (`area_code`);--> statement-breakpoint
CREATE INDEX `dist_rep_date_idx` ON `distribution_reports` (`date`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`link` text,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notifications_is_read_idx` ON `notifications` (`is_read`);