const { Client } = require("pg");

function connect() {
  return new Client({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? "rentaldb",
    user: process.env.DB_USER ?? "rental",
    password: process.env.DB_PASSWORD ?? "rental",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : false,
  });
}

async function markOverdueRentals() {
  const client = connect();
  await client.connect();
  try {
    const { rows } = await client.query(`
      UPDATE rentals r
         SET status = 'OVERDUE', updated_at = now()
        FROM items i
       WHERE i.id = r.item_id
         AND r.status = 'ACTIVE'
         AND r.due_date < (now() AT TIME ZONE 'UTC')::date
      RETURNING r.id, i.name AS item_name, r.renter_name, r.renter_email, r.due_date::text AS due_date`);
    return rows;
  } finally {
    await client.end();
  }
}

module.exports = { markOverdueRentals };
