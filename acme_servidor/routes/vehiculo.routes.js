const express = require('express');
const router = express.Router();
const { getVehiculos,getVehiculosByFiltro } = require('../controllers/vehiculo.controller');

// Ruta: GET /api/vehiculo
router.get('/', getVehiculos);
// POST con filtros dinámicos
router.post('/filtro', getVehiculosByFiltro);

module.exports = router;
