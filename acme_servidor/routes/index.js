const express = require('express');
const router = express.Router();

// router.use('/login', require('./login.routes'));
router.use('/vehiculo', require('./vehiculo.routes'));
router.use('/dataHistorica', require('./dataHistorica.routes'));
// router.use('/ubicacion', require('./ubicacion.routes'));
// router.use('/sucursal', require('./sucursal.routes'));
// router.use('/propietario', require('./propietario.routes'));
// router.use('/bitacora', require('./bitacora.routes'));

router.use('/realTimeData', require('./simulador.routes'));
module.exports = router;
