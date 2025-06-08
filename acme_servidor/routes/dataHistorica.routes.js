// routes/resumen.routes.js
const express = require('express');
const router  = express.Router();
const { getResumen } = require('../controllers/dataHistorica.controller');

router.get('/resumen', getResumen);

module.exports = router;
