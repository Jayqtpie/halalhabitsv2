ALTER TABLE quests ADD COLUMN template_id TEXT;
--> statement-breakpoint
CREATE INDEX idx_quest_template ON quests(template_id);
