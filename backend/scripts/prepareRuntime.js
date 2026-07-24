'use strict';
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  if (!['true', '1'].includes(process.env.ALLOW_SCHEMA_MIGRATION || '')) throw new Error('ALLOW_SCHEMA_MIGRATION=true is required');
  const email = (process.env.PROVISION_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.PROVISION_ADMIN_PASSWORD || '';
  const name = (process.env.PROVISION_ADMIN_NAME || '').trim();
  if (!email || !name || password.length < 12) throw new Error('runtime administrator configuration is incomplete');
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const migration = fs.readFileSync(path.resolve(__dirname, '../migrations/001_governed_workflows.sql'), 'utf8');
  await pool.query(migration);
  await pool.query(`CREATE TABLE IF NOT EXISTS visual_ai_results (
    id BIGSERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), tenant_id TEXT NOT NULL,
    feature_type TEXT NOT NULL, input_data JSONB NOT NULL, result JSONB NOT NULL,
    model_used TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users(email,password,name) VALUES($1,$2,$3)
     ON CONFLICT(email) DO UPDATE SET password=EXCLUDED.password,name=EXCLUDED.name,updated_at=NOW()`,
    [email, hash, name]
  );
  console.log('Runtime schema and administrator are ready.');
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
