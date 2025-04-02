import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";

import env from "@/env";

// This is a temporary patch for: https://github.com/drizzle-team/drizzle-orm/issues/3915

async function main() {
  const db = drizzle(env.DATABASE_URL);
  await db.execute(
    sql`DO $$
DECLARE
    seq_record record;
BEGIN
    FOR seq_record IN 
        SELECT schemaname, sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'  -- adjust schema if needed
    LOOP
        EXECUTE format('SELECT setval(%L, ${sql.raw((env.TEST_ENTITY_COUNT + 1).toString())})', 
            seq_record.schemaname || '.' || seq_record.sequencename);
    END LOOP;
END $$;`,
  );
  process.exit(0);
}

main().catch(() => {
  console.error("Error while defining new sequence");
  process.exit(1);
});
