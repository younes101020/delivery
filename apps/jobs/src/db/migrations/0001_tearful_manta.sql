ALTER TABLE "applications" 
ALTER COLUMN "port" 
SET DATA TYPE integer 
USING CASE 
    WHEN port IS NULL OR port = '' THEN NULL 
    WHEN port LIKE '%:%' THEN SPLIT_PART(port, ':', 2)::integer
    ELSE port::integer 
END;