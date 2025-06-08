const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'acme',
  password: 'Audrie8a7024.',
  port: 5432, // Puerto por defecto de PostgreSQL
});

// Verificar la conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error al conectarse a PostgreSQL', err.stack);
  }
  console.log('Conexión a PostgreSQL exitosa');
  release();
});

module.exports = pool;
