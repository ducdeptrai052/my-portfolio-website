import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const rawConnectionString = process.env.DATABASE_URL;
if (!rawConnectionString) {
  throw new Error("DATABASE_URL is required to initialize PrismaClient");
}

// Allow self-signed certs (e.g., Supabase pooler). For stricter security, provide a CA instead.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Force sslmode=no-verify if not provided to avoid self-signed cert errors (Supabase/RDS)
const url = new URL(rawConnectionString);
if (!url.searchParams.has("sslmode")) {
  url.searchParams.set("sslmode", "no-verify");
}
const connectionString = url.toString();

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
