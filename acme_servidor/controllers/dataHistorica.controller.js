// controllers/resumen.controller.js
const pool = require('../BD/connection');

/**
 * GET /api/resumen?fecha=YYYY-MM-DD[&vin=VIN00001]
 * Devuelve los resúmenes para la fecha indicada, y opcionalmente filtra por VIN.
 * Si no llega fecha, usa la fecha actual.
 */
const getResumen = async (req, res) => {
  try {
    const { fechaIni, fechaFin, vin } = req.query;

    // Valida que lleguen ambas fechas
    if (!fechaIni || !fechaFin) {
      return res.status(400).json({ error: 'fechaIni y fechaFin son requeridos' });
    }

    // Construye params y SQL para rango
    const params = [fechaIni, fechaFin];
    let sql = `
      SELECT
        vin,
        fecha,
        off_count,
        porcentaje_activo,
        error_count,
        km_recorridos,
        prom_tiempo_activo,
        prom_tiempo_desconectado
      FROM resumen
      WHERE fecha >= $1
        AND fecha <= $2
    `;

    // Filtrar por VIN si viene
    if (vin) {
      params.push(vin);
      sql += ` AND vin = $${params.length}`;
    }

    sql += ` ORDER BY vin`;

    const { rows } = await pool.query(sql, params);
    return res.json(rows);
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno' });
  }
};



module.exports = { getResumen };
