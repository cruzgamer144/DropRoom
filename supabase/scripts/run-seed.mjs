import { readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error("SUPABASE_DB_URL não definido. Usa o string de conexão Postgres do Supabase.");
  process.exit(1);
}

const seedsDir = path.resolve("supabase/seeds");

async function run() {
  const files = ["0001_seed.sql"]; // ordem explícita
  const client = new Client({ connectionString });
  await client.connect();
  try {
    for (const file of files) {
      const sql = await readFile(path.join(seedsDir, file), "utf8");
      console.log(`\n▶ Inserindo seed ${file}`);
      await client.query(sql);
    }
    console.log("\n✅ Seeds concluídas");
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
