import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("SUPABASE_DB_URL não definido. Usa o string de conexão Postgres do Supabase.");
  process.exit(1);
}

const migrationsDir = path.resolve("supabase/migrations");

async function run() {
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();
  const client = new Client({ connectionString });
  await client.connect();
  try {
    for (const file of files) {
      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      console.log(`\n▶ Executando ${file}`);
      await client.query(sql);
    }
    console.log("\n✅ Migrações concluídas");
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
