// Carrega envs do .env.local
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import pkg from "pg";
const { Client } = pkg;

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lê a connection string
const connectionString = process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error("SUPABASE_DB_URL não definido. Usa o string de conexão Postgres do Supabase.");
  process.exit(1);
}

// Diretório das migrações (ajusta se usares outra estrutura)
const migrationsDir = path.resolve(__dirname, "../migrations");

async function run() {
console.log("Ligando ao Supabase...");
const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

  try {
    await client.connect();

    if (!fs.existsSync(migrationsDir)) {
      console.log("Diretório de migrações não encontrado:", migrationsDir);
      process.exit(0);
    }

    // Ler ficheiros .sql por ordem alfanumérica
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.toLowerCase().endsWith(".sql"))
      .sort();

    for (const f of files) {
      const full = path.join(migrationsDir, f);
      const sql = fs.readFileSync(full, "utf8");
      console.log(`\n▶️  A aplicar migração: ${f}`);
      await client.query(sql);
      console.log(`✅  OK: ${f}`);
    }

    console.log("\n🎉 Migrações aplicadas com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao aplicar migrações:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
