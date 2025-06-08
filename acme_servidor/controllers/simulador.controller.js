const Estado = require('../models/estado');
const pool = require('../BD/connection');

const obtenerEstadosFiltrados = async (filtros = {}) => {
  try {
    console.log("Filtros Aplicados: ",filtros); 
    const query = Estado.find(filtros)
      .sort({ FechaHora: -1 })
      .limit(20)
      .lean();

    return await query.exec();
  } catch (error) {
    console.error('Error en obtenerEstadosFiltrados:', error);
    throw error;
  }
};

const obtenerTodosEstados = async (req, res) => {
  const { vin, estado, desde, hasta, limite } = req.query;
  
  try {
    // Construir filtros
    const filtros = {};
    
    if (vin) filtros.IdDispositivo = vin.toUpperCase();
    if (estado) filtros.Estado = estado;
    
    if (desde || hasta) {
      filtros.Fechadora = {};
      if (desde) filtros.Fechadora.$gte = new Date(desde);
      if (hasta) filtros.Fechadora.$lte = new Date(hasta);
    }

    console.log('🔍 Filtros aplicados (HTTP):', filtros);

    const query = Estado.find(filtros).sort({ Fechadora: -1 });
    if (limite) query.limit(parseInt(limite));

    const datos = await query.lean();
    
    res.status(200).json({
      success: true,
      count: datos.length,
      data: datos
    });
    
  } catch (error) {
    console.error('❌ Error en la consulta HTTP:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al consultar estados',
      details: error.message 
    });
  }
};

const guardarDataResumen = async (req, res) => {
  const { fecha } = req.body; // 'YYYY-MM-DD'

  // 1) Definir rango
  const inicio = new Date(`${fecha}T00:00:00Z`);
  const fin = new Date(inicio);
  fin.setUTCDate(fin.getUTCDate() + 1);

  try {
    // 2) Pipeline inicial para obtener agregados básicos
    const agregados = await Estado.aggregate([
      { $match: { FechaHora: { $gte: inicio, $lt: fin } } },
      {
        $group: {
          _id: '$IdDispositivo',
          total:        { $sum: 1 },
          off_count:    { $sum: { $cond: [{ $eq: ['$OnOff', false] }, 1, 0] } },
          active_count: { $sum: { $cond: [{ $eq: ['$OnOff', true] }, 1, 0] } },
          error_count:  { $sum: { $cond: [{ $ne: ['$Estado', '000'] }, 1, 0] } },
          errores:      { $push: '$Estado' },
          km_min:       { $min: '$Kilometros' },
          km_max:       { $max: '$Kilometros' }
        }
      },
      {
        $project: {
          vin:               '$_id',
          fecha:             inicio,
          off_count:         1,
          porcentaje_activo: {
            $multiply: [
              { $divide: ['$active_count', '$total'] },
              100
            ]
          },
          error_count:       1,
          errores_frecuentes: {
            $slice: [
              {
                $map: {
                  input: {
                    $objectToArray: {
                      $arrayToObject: {
                        $map: {
                          input: { $setUnion: ['$errores', []] },
                          as: 'e',
                          in: {
                            k: '$$e',
                            v: {
                              $size: {
                                $filter: {
                                  input: '$errores',
                                  cond: { $eq: ['$$this', '$$e'] }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  as: 'pair',
                  in: { estado: '$$pair.k', count: '$$pair.v' }
                }
              },
              5 // top 5 errores más frecuentes
            ]
          },
          km_recorridos:      { $subtract: ['$km_max', '$km_min'] }
        }
      }
    ]);

    // 3) Si no hay documentos, salir sin tocar Postgres
    if (agregados.length === 0) {
      return res.status(200).json({ message: `No se encontró data para ${fecha}` });
    }

    // 4) Calcular promedios de tiempo por segmento
    for (const d of agregados) {
      const eventos = await Estado.find({
        IdDispositivo: d.vin,
        FechaHora: { $gte: inicio, $lt: fin }
      }).sort({ FechaHora: 1 }).lean();

      let lastState = eventos[0]?.OnOff;
      let lastTime = eventos[0]?.FechaHora;
      let activeDur = 0, inactiveDur = 0;
      let activeCount = 0, inactiveCount = 0;

      for (let i = 1; i < eventos.length; i++) {
        const ev = eventos[i];
        if (ev.OnOff !== lastState) {
          const diff = (ev.FechaHora - lastTime) / 1000; // segundos
          if (lastState) {
            activeDur += diff;
            activeCount++;
          } else {
            inactiveDur += diff;
            inactiveCount++;
          }
          lastState = ev.OnOff;
          lastTime = ev.FechaHora;
        }
      }
      d.promTiempoActivo = activeCount ? (activeDur / activeCount) : 0;
      d.promTiempoDesconectado = inactiveCount ? (inactiveDur / inactiveCount) : 0;
    }

    // 5) Insertar en Postgres con nuevos campos
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM resumen WHERE fecha = $1', [fecha]);

      const insertQ = `
        INSERT INTO resumen
          (vin, fecha, off_count, porcentaje_activo,
           error_count, errores_frecuentes, km_recorridos,
           prom_tiempo_activo, prom_tiempo_desconectado)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `;

      for (const d of agregados) {
        await client.query(insertQ, [
          d.vin,
          fecha,
          d.off_count,
          d.porcentaje_activo,
          d.error_count,
          JSON.stringify(d.errores_frecuentes),
          d.km_recorridos,
          d.promTiempoActivo,
          d.promTiempoDesconectado
        ]);
      }

      await client.query('COMMIT');
      return res.status(200).json({ inserted: agregados.length });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error en transacción:', err);
      return res.status(500).json({ error: 'Error al guardar resumen' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error generar resumen:', err);
    return res.status(500).json({ error: 'Error interno al generar resumen' });
  }
};


module.exports = {
  obtenerEstadosFiltrados,
  obtenerTodosEstados, 
  guardarDataResumen
};