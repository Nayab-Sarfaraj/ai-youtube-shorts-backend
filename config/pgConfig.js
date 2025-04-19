import pg from "pg";

const { Pool } = pg;

const { PGPASSWORD, PGUSER, PGDATABASE, PGHOST } = process.env;

const pool = new Pool({
  host: PGHOST,
  user: PGUSER,
  database: PGDATABASE,
  password: PGPASSWORD,
  port: 5432,
  ssl: { required: true, rejectUnauthorized: false },
});

export default pool;
