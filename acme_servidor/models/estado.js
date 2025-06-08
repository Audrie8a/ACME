const mongoose = require('mongoose');

const estadoSchema = new mongoose.Schema({
  IdDispositivo: {
    type: String,
    required: true,
    uppercase: true, // Para mantener consistencia
    trim: true
  },
  FechaHora: {  // O cambia este a FechaHora si prefieres estandarizar
    type: Date,
    required: true,
    index: true
  },
  EstadoCarga: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  OnOff: {
    type: Boolean,
    required: true,
    default: false
  },
  Estado: {
    type: String,
    required: true,
    trim: true,
    default: '000'
  },
  Kilometros: {
    type: Number,
    min: 0,
    required: true
  }
}, {
  collection: 'Estados',
  timestamps: false,
  // Quitamos strict: false para detectar errores temprano
  strict: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices compuestos para mejor performance
estadoSchema.index({ IdDispositivo: 1, Fechadora: -1 }); // Para búsquedas por dispositivo
estadoSchema.index({ Fechadora: -1 }); // Para consultas generales ordenadas

// Podemos agregar un método útil para formatear datos
estadoSchema.methods.toClientFormat = function() {
  const obj = this.toObject();
  // Transformaciones si son necesarias
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Estado', estadoSchema);