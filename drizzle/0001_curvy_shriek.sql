CREATE TABLE `stock_balances` (
	`item_code` text PRIMARY KEY NOT NULL,
	`item_name_bn` text NOT NULL,
	`unit` text DEFAULT 'piece' NOT NULL,
	`current_quantity` integer DEFAULT 0 NOT NULL,
	`minimum_level` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stock_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_code` text NOT NULL,
	`transaction_type` text NOT NULL,
	`quantity` integer NOT NULL,
	`previous_balance` integer NOT NULL,
	`new_balance` integer NOT NULL,
	`transaction_date` text NOT NULL,
	`note` text,
	`actor` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`item_code`) REFERENCES `stock_balances`(`item_code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `stock_transactions_item_date_idx` ON `stock_transactions` (`item_code`,`transaction_date`);