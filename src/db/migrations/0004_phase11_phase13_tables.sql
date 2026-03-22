--> statement-breakpoint
CREATE TABLE `buddies` (
	`id` text PRIMARY KEY NOT NULL,
	`user_a` text NOT NULL REFERENCES `users`(`id`),
	`user_b` text NOT NULL REFERENCES `users`(`id`),
	`status` text DEFAULT 'pending' NOT NULL,
	`invite_code` text,
	`created_at` text NOT NULL,
	`accepted_at` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_buddy_user_a` ON `buddies` (`user_a`);
--> statement-breakpoint
CREATE INDEX `idx_buddy_user_b` ON `buddies` (`user_b`);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_buddy_invite_code` ON `buddies` (`invite_code`);
--> statement-breakpoint
CREATE TABLE `boss_battles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL REFERENCES `users`(`id`),
	`archetype` text NOT NULL,
	`boss_hp` integer NOT NULL,
	`boss_max_hp` integer NOT NULL,
	`current_day` integer DEFAULT 1 NOT NULL,
	`max_days` integer NOT NULL,
	`daily_log` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`mercy_mode` integer DEFAULT false NOT NULL,
	`started_at` text NOT NULL,
	`ended_at` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_boss_user_status` ON `boss_battles` (`user_id`, `status`);
--> statement-breakpoint
CREATE TABLE `detox_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL REFERENCES `users`(`id`),
	`variant` text NOT NULL,
	`duration_hours` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`xp_earned` integer DEFAULT 0 NOT NULL,
	`xp_penalty` integer DEFAULT 0 NOT NULL,
	`started_at` text NOT NULL,
	`ended_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_detox_user_status` ON `detox_sessions` (`user_id`, `status`);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`buddy_pair_id` text NOT NULL REFERENCES `buddies`(`id`),
	`sender_id` text NOT NULL REFERENCES `users`(`id`),
	`content` text NOT NULL,
	`status` text DEFAULT 'sent' NOT NULL,
	`created_at` text NOT NULL,
	`synced_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_message_pair_created` ON `messages` (`buddy_pair_id`, `created_at`);
--> statement-breakpoint
CREATE INDEX `idx_message_sender` ON `messages` (`sender_id`);
--> statement-breakpoint
CREATE TABLE `shared_habits` (
	`id` text PRIMARY KEY NOT NULL,
	`buddy_pair_id` text NOT NULL REFERENCES `buddies`(`id`),
	`created_by_user_id` text NOT NULL REFERENCES `users`(`id`),
	`habit_type` text NOT NULL,
	`name` text NOT NULL,
	`target_frequency` text DEFAULT 'daily' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_shared_habit_pair` ON `shared_habits` (`buddy_pair_id`);
--> statement-breakpoint
CREATE INDEX `idx_shared_habit_creator` ON `shared_habits` (`created_by_user_id`);
--> statement-breakpoint
CREATE TABLE `duo_quests` (
	`id` text PRIMARY KEY NOT NULL,
	`buddy_pair_id` text NOT NULL REFERENCES `buddies`(`id`),
	`created_by_user_id` text NOT NULL REFERENCES `users`(`id`),
	`title` text NOT NULL,
	`description` text NOT NULL,
	`xp_reward_each` integer NOT NULL,
	`xp_reward_bonus` integer DEFAULT 0 NOT NULL,
	`target_type` text NOT NULL,
	`target_value` integer NOT NULL,
	`user_a_progress` integer DEFAULT 0 NOT NULL,
	`user_b_progress` integer DEFAULT 0 NOT NULL,
	`user_a_completed` integer DEFAULT false NOT NULL,
	`user_b_completed` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`expires_at` text NOT NULL,
	`completed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_duo_quest_pair_status` ON `duo_quests` (`buddy_pair_id`, `status`);
--> statement-breakpoint
CREATE INDEX `idx_duo_quest_expires` ON `duo_quests` (`expires_at`);
