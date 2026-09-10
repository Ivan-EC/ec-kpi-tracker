CREATE TABLE `tracker_values` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
