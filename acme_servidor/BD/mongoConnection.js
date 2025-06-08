const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://Audrie8a:Audrie8a7024.@acme.h1dmjul.mongodb.net/ACME?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('🟢 Conectado a MongoDB - Base de datos:', mongoose.connection.db.databaseName);
    
    // Verificación adicional
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Colecciones disponibles:', collections.map(c => c.name));
    
    // Verificar datos en Estados
    const count = await mongoose.connection.db.collection('Estados').countDocuments();
    console.log(`📊 Documentos en Estados: ${count}`);
    
  } catch (error) {
    console.error('🔴 Error al conectar con MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
