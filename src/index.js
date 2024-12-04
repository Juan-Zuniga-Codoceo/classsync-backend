import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scheduleRoutes from './routes/scheduleRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import configRoutes from './routes/configRoutes.js';
import prisma from './config/db.js';

dotenv.config();

const app = express();

// Configuración básica de CORS para desarrollo
app.use(cors({
  origin: 'http://localhost:5173', // Vite default
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`
    );
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/schedules', scheduleRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/config', configRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: 'Error de base de datos',
      details: err.message
    });
  }

  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    details: err.message,
    stack: err.stack
  });
});

// Database connection and server startup
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Base de datos conectada');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`🔧 Modo: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} recibido. Iniciando apagado...`);
  try {
    await prisma.$disconnect();
    console.log('Base de datos desconectada');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el apagado:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
startServer();