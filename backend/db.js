const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => console.log('Conectado ao PostgreSQL!'))
  .catch(err => console.error('Erro de conexão com o PostgreSQL:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
};
