const pool = require('../BD/connection');

// Obtener todos los vehículos
const getVehiculos = async (req, res) => {
  try {
    const query = 'SELECT v.vin, v.modelo, v.anio,v.id_sucursal_fk idsucursal,s.nombre sucursal, v.fecha_venta, p.usuario_acceso usuario FROM vehiculo v JOIN sucursal s ON s.id_sucursal = v.id_sucursal_fk JOIN propietario p ON p.id_propietario = v.propietario_id_fk';
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getVehiculosByFiltro = async (req, res) => {
    const {
      vin,
      modelo,
      anio,
      id_sucursal_fk, 
      fecha_venta,
      propietario_id_fk
    } = req.body;
  
    try {
      const condiciones = [];
      const valores = [];
  
      if (vin && vin.trim() !== '') {
        condiciones.push(`vin = $${valores.length + 1}`);
        valores.push(vin);
      }
      if (modelo && modelo.trim() !== '') {
        condiciones.push(`modelo ILIKE $${valores.length + 1}`);
        valores.push(`%${modelo}%`);
      }
      if (anio && anio !== 0) {
        condiciones.push(`anio = $${valores.length + 1}`);
        valores.push(anio);
      }
      if (id_sucursal_fk && id_sucursal_fk !== 0) {
        condiciones.push(`id_sucursal_fk = $${valores.length + 1}`);
        valores.push(id_sucursal_fk);
      }
      if (fecha_venta && fecha_venta.trim() !== '') {
        condiciones.push(`fecha_venta = $${valores.length + 1}`);
        valores.push(fecha_venta);
      }
      if (propietario_id_fk && propietario_id_fk !== 0) {
        condiciones.push(`propietario_id_fk = $${valores.length + 1}`);
        valores.push(propietario_id_fk);
      }
  
      let query = 'SELECT * FROM vehiculo';
      if (condiciones.length > 0) {
        query += ' WHERE ' + condiciones.join(' AND ');
      }
  
      const result = await pool.query(query, valores);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error al filtrar vehículos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  module.exports = {
    getVehiculos,
    getVehiculosByFiltro,
  };
