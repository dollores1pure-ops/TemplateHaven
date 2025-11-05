import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@shared/schema";

const databaseUrl =
  process.env.DATABASE_URL ??
  "mysql://ADMINDB:OUv%3CNS%2BE%60%251U%26o44aNS~%7D3%235@localhost:3306/store";

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = mysql.createPool(databaseUrl);
export const db = drizzle(pool, { schema });
