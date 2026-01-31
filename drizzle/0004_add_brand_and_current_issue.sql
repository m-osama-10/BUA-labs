-- Add brand and currentIssue columns to devices table
ALTER TABLE devices 
ADD COLUMN brand VARCHAR(255) NULL AFTER name,
ADD COLUMN currentIssue TEXT NULL AFTER currentStatus;

-- Create index for currentIssue
CREATE INDEX device_currentIssue_idx ON devices(currentIssue(100));
