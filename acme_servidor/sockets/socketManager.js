const { Server } = require('socket.io');
const { obtenerEstadosFiltrados } = require('../controllers/simulador.controller');

const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true
    }
  });

  const activeFilters = new Map();

  const buildSocketFilter = (filterData) => {
    const filter = {};
    if (filterData.vin) filter.IdDispositivo = filterData.vin.toUpperCase();
    if (filterData.estado) filter.Estado = filterData.estado;
    return filter;
  };

  const emitStatesToSocket = async (socket) => {
    try {
      const filters = activeFilters.get(socket.id) || {};
      const queryFilters = buildSocketFilter(filters);
      
      const estados = await obtenerEstadosFiltrados(queryFilters);
      
      console.log("Total Estados: ",estados.length);
      socket.emit('estado_actualizado', {
        success: true,
        count: estados.length,
        data: estados,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error(`Error al emitir estados a ${socket.id}:`, error);
      socket.emit('socket_error', {
        success: false,
        error: error.message
      });
    }
  };

  io.on('connection', (socket) => {
    console.log(`🟢 Nuevo cliente conectado: ${socket.id}`);
    activeFilters.set(socket.id, {});

    // Manejar filtros
    socket.on('setFilter', (filterData) => {
      try {
        activeFilters.set(socket.id, filterData);
        emitStatesToSocket(socket);
      } catch (error) {
        console.error(`Error al aplicar filtro:`, error);
      }
    });

    // Emitir datos iniciales
    emitStatesToSocket(socket);

    // Configurar intervalo de actualización
    const interval = setInterval(() => emitStatesToSocket(socket), 5000);

    // Manejar desconexión
    socket.on('disconnect', () => {
      clearInterval(interval);
      activeFilters.delete(socket.id);
      console.log(`🔴 Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

module.exports = { setupSocketIO };