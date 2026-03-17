ALTER TABLE sync_queue ADD COLUMN retry_count integer NOT NULL DEFAULT 0;
--> statement-breakpoint
ALTER TABLE sync_queue ADD COLUMN last_error text;
--> statement-breakpoint
ALTER TABLE users ADD COLUMN expo_push_token text;
