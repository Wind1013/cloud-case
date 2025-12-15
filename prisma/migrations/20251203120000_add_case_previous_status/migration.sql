-- Add previousStatus column to store the last non-archived status
ALTER TABLE "cases"
ADD COLUMN IF NOT EXISTS "previousStatus" "CaseStatus";

