CREATE TABLE `suppliers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_code` text NOT NULL,
	`name` text NOT NULL,
	`owner_name` text,
	`mobile` text,
	`address` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`item_code`) REFERENCES `stock_balances`(`item_code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `suppliers_item_code_idx` ON `suppliers` (`item_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `suppliers_item_name_unique` ON `suppliers` (`item_code`,`name`);--> statement-breakpoint
ALTER TABLE `stock_transactions` ADD `supplier_id` integer REFERENCES suppliers(id);--> statement-breakpoint
ALTER TABLE `stock_transactions` ADD `unit_price_poisha` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `stock_transactions` ADD `total_amount_poisha` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `stock_transactions` ADD `paid_amount_poisha` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `stock_transactions` ADD `due_amount_poisha` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `stock_transactions` ADD `updated_at` text;--> statement-breakpoint
UPDATE `stock_transactions` SET `updated_at` = CURRENT_TIMESTAMP WHERE `updated_at` IS NULL;--> statement-breakpoint
CREATE INDEX `stock_transactions_supplier_idx` ON `stock_transactions` (`supplier_id`);
