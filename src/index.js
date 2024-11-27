// src/index.js
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

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api/schedules', scheduleRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/config', configRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Verificar conexión a la base de datos
prisma.$connect()
  .then(() => {
    console.log('Database connected successfully');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Mode: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });

// Handle termination
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing HTTP server...');
  await prisma.$disconnect();
  process.exit(0);
});