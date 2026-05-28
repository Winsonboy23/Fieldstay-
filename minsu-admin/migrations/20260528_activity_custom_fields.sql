-- 活動自訂報名欄位
-- activities.custom_fields: [{ label: string, required: boolean }, ...]
-- activity_signups.custom_field_answers: { [label]: string, ... }

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS custom_fields jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE activity_signups
  ADD COLUMN IF NOT EXISTS custom_field_answers jsonb NOT NULL DEFAULT '{}'::jsonb;
