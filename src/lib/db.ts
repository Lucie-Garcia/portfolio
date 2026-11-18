import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const databasePath = import.meta.env.DATABASE_PATH ?? "./data/db.sqlite";
const schemaPath = new URL("../../db/schema.sql", import.meta.url);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(fs.readFileSync(schemaPath, "utf8"));
