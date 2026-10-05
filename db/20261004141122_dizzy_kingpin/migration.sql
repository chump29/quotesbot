CREATE TABLE `quotes` (
	`author` text NOT NULL,
	`id` integer PRIMARY KEY,
	`quote` text NOT NULL UNIQUE
);
