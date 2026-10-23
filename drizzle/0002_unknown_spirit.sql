CREATE TABLE `shared_scores` (
	`id` text PRIMARY KEY NOT NULL,
	`device` text NOT NULL,
	`name` text NOT NULL,
	`mode` text NOT NULL,
	`size` integer NOT NULL,
	`kind` text NOT NULL,
	`score` integer NOT NULL,
	`at` integer NOT NULL,
	`entry_id` text NOT NULL
);
