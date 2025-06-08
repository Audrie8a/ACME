const express = require('express');
const router = express.Router();
const { obtenerTodosEstados } = require('../controllers/simulador.controller'); 
const { guardarDataResumen } = require('../controllers/simulador.controller');

router.get('/ultimosEstados', obtenerTodosEstados);
router.post('/guardarResumen', guardarDataResumen);

module.exports = router;
