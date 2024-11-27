// scripts/initConfig.js
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function initializeConfig() {
  try {
    console.log('Verificando configuración existente...');
    
    // Verificar si ya existe una configuración
    const existingConfig = await prisma.scheduleConfig.findFirst();
    
    if (!existingConfig) {
      console.log('No se encontró configuración. Creando configuración inicial...');
      
      // Crear configuración inicial
      const config = await prisma.scheduleConfig.create({
        data: {
          startTime: new Date('2000-01-01T08:00:00'),
          endTime: new Date('2000-01-01T16:00:00'),
          blockDuration: 45,
          breakDuration: 15
        }
      });
      
      console.log('Configuración inicial creada:', config);
    } else {
      console.log('Configuración existente encontrada:', existingConfig);
    }
  } catch (error) {
    console.error('Error al inicializar la configuración:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Conexión a la base de datos cerrada');
  }
}

initializeConfig();