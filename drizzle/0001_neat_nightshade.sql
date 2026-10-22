CREATE TABLE `match_records` (
	`id` text PRIMARY KEY NOT NULL,
	`device` text NOT NULL,
	`name` text NOT NULL,
	`at` integer NOT NULL,
	`win` integer NOT NULL,
	`points` integer NOT NULL,
	`size` integer NOT NULL,
	`result` text NOT NULL
);
