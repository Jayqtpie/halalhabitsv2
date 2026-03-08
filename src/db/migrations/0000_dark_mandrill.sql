CREATE TABLE `habit_completions` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`completed_at` text NOT NULL,
	`xp_earned` integer NOT NULL,
	`streak_multiplier` real NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_completion_habit_date` ON `habit_completions` (`habit_id`,`completed_at`);--> statement-breakpoint
CREATE INDEX `idx_completion_date` ON `habit_completions` (`completed_at`);--> statement-breakpoint
CREATE TABLE `habits` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`preset_key` text,
	`category` text NOT NULL,
	`frequency` text NOT NULL,
	`frequency_days` text,
	`time_window_start` text,
	`time_window_end` text,
	`difficulty_tier` text DEFAULT 'medium' NOT NULL,
	`base_xp` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`icon` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_habit_user_status` ON `habits` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_habit_user_sort` ON `habits` (`user_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `muhasabah_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`prompt_1_text` text NOT NULL,
	`prompt_1_response` text,
	`prompt_2_text` text,
	`prompt_2_response` text,
	`prompt_3_text` text,
	`prompt_3_response` text,
	`tomorrow_intention` text,
	`xp_earned` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_muhasabah_user_date` ON `muhasabah_entries` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `niyyah` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`text` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_niyyah_user` ON `niyyah` (`user_id`);--> statement-breakpoint
CREATE TABLE `quests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`xp_reward` integer NOT NULL,
	`target_type` text NOT NULL,
	`target_value` integer NOT NULL,
	`target_habit_id` text,
	`progress` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`expires_at` text NOT NULL,
	`completed_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_quest_user_status` ON `quests` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_quest_expires` ON `quests` (`expires_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`prayer_calc_method` text DEFAULT 'ISNA' NOT NULL,
	`location_lat` real,
	`location_lng` real,
	`location_name` text,
	`isha_end_time` text DEFAULT 'midnight' NOT NULL,
	`notification_prayers` integer DEFAULT true NOT NULL,
	`notification_muhasabah` integer DEFAULT true NOT NULL,
	`notification_quests` integer DEFAULT false NOT NULL,
	`notification_titles` integer DEFAULT true NOT NULL,
	`muhasabah_reminder_time` text DEFAULT '21:00' NOT NULL,
	`dark_mode` text DEFAULT 'auto' NOT NULL,
	`sound_enabled` integer DEFAULT true NOT NULL,
	`haptic_enabled` integer DEFAULT true NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_settings_user` ON `settings` (`user_id`);--> statement-breakpoint
CREATE TABLE `streaks` (
	`id` text PRIMARY KEY NOT NULL,
	`habit_id` text NOT NULL,
	`current_count` integer DEFAULT 0 NOT NULL,
	`longest_count` integer DEFAULT 0 NOT NULL,
	`last_completed_at` text,
	`multiplier` real DEFAULT 1 NOT NULL,
	`is_rebuilt` integer DEFAULT false NOT NULL,
	`rebuilt_at` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_streak_habit` ON `streaks` (`habit_id`);--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`operation` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL,
	`synced_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_sync_entity` ON `sync_queue` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `titles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rarity` text NOT NULL,
	`unlock_type` text NOT NULL,
	`unlock_value` integer NOT NULL,
	`unlock_habit_type` text,
	`flavor_text` text NOT NULL,
	`sort_order` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `titles_name_unique` ON `titles` (`name`);--> statement-breakpoint
CREATE INDEX `idx_title_rarity` ON `titles` (`rarity`);--> statement-breakpoint
CREATE TABLE `user_titles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title_id` text NOT NULL,
	`earned_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`title_id`) REFERENCES `titles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_usertitle_user_title` ON `user_titles` (`user_id`,`title_id`);--> statement-breakpoint
CREATE INDEX `idx_usertitle_user` ON `user_titles` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`active_title_id` text,
	`current_level` integer DEFAULT 1 NOT NULL,
	`total_xp` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_user_level` ON `users` (`current_level`);--> statement-breakpoint
CREATE TABLE `xp_ledger` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` integer NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text,
	`earned_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_xp_user_date` ON `xp_ledger` (`user_id`,`earned_at`);--> statement-breakpoint
CREATE INDEX `idx_xp_user` ON `xp_ledger` (`user_id`);--> statement-breakpoint
CREATE TABLE `_zustand_store` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
