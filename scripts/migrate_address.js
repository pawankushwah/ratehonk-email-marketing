import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  try {
    await sql`ALTER TABLE audience_contacts ALTER COLUMN address TYPE jsonb USING address::jsonb`;
    console.log('Successfully altered address column to jsonb.');
  } catch (err) {
    console.error('Error altering column:', err);
  } finally {
    await sql.end();
  }
}

run();
