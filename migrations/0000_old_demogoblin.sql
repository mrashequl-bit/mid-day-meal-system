CREATE TABLE `areas` (
	`code` text PRIMARY KEY NOT NULL,
	`name_bn` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`manager_name` text,
	`manager_mobile` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `areas_name_bn_unique` ON `areas` (`name_bn`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`before_json` text,
	`after_json` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_created_at_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `school_demand_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`school_emis_code` text NOT NULL,
	`previous_demand` integer NOT NULL,
	`new_demand` integer NOT NULL,
	`effective_from` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'approved' NOT NULL,
	`changed_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`school_emis_code`) REFERENCES `schools`(`emis_code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `demand_history_school_date_idx` ON `school_demand_history` (`school_emis_code`,`effective_from`);--> statement-breakpoint
CREATE TABLE `schools` (
	`emis_code` text PRIMARY KEY NOT NULL,
	`name_bn` text NOT NULL,
	`area_code` text NOT NULL,
	`head_teacher` text,
	`legacy_mobile` text,
	`current_daily_demand` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`area_code`) REFERENCES `areas`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `schools_area_code_idx` ON `schools` (`area_code`);--> statement-breakpoint
CREATE INDEX `schools_name_bn_idx` ON `schools` (`name_bn`);