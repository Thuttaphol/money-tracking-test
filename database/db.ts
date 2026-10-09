import { Pool } from "pg";
import { environment } from "../config/environment";

export const db = new Pool({
  connectionString: environment.databaseUrl,
});

export async function closeDatabase() {
  await db.end();
}
