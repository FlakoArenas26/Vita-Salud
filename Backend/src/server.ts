import app from './app';
import { initializeDatabase } from './config/init-db';
import './models'; // registra todos los modelos y asociaciones

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // Inicializar base de datos, modelos y semillas
    await initializeDatabase();
    
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📚 Swagger disponible en http://localhost:${PORT}/api-docs`);
    app.listen(PORT);
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();
