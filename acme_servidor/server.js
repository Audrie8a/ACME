const express = require('express');
const http = require('http');
const cors = require('cors');
const routes = require('./routes/index');
const connectToMongo = require('./BD/mongoConnection');
const { setupSocketIO } = require('./sockets/socketManager');

// Configuración inicial
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
connectToMongo();

// Rutas HTTP
app.use('/api', routes);

// Configuración de Socket.io
setupSocketIO(server);

// Manejo de errores global
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});