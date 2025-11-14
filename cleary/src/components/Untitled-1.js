const pool = require('./supabaseClient');

async function testConnection() {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    console.log('Connected to Supabase PostgreSQL:', rows[0]);
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();