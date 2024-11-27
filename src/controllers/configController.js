// src/controllers/configController.js
import prisma from '../config/db.js';

export const configController = {
  // Obtener configuración general
  getGeneralConfig: async (req, res) => {
    try {
      const config = await prisma.generalConfig.findFirst();
      res.json(config || {
        schoolName: '',
        schoolYear: new Date().getFullYear()
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la configuración general' });
    }
  },

  // Actualizar configuración general
  updateGeneralConfig: async (req, res) => {
    try {
      const { schoolName, schoolYear } = req.body;

      const config = await prisma.generalConfig.upsert({
        where: { id: 1 },
        update: { schoolName, schoolYear },
        create: { schoolName, schoolYear }
      });

      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la configuración general' });
    }
  },

  // Obtener configuración de horarios
  getScheduleConfig: async (req, res) => {
    try {
      const config = await prisma.scheduleConfig.findFirst();
      
      if (!config) {
        return res.json({
          startTime: '08:00',
          endTime: '16:00',
          blockDuration: 45,
          breakDuration: 15
        });
      }

      res.json({
        startTime: config.startTime.toTimeString().slice(0, 5),
        endTime: config.endTime.toTimeString().slice(0, 5),
        blockDuration: config.blockDuration,
        breakDuration: config.breakDuration
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener la configuración de horarios' });
    }
  },

  // Actualizar configuración de horarios
  updateScheduleConfig: async (req, res) => {
    try {
      const { startTime, endTime, blockDuration, breakDuration } = req.body;

      // Validaciones
      if (blockDuration < 30 || blockDuration > 90) {
        return res.status(400).json({
          error: 'La duración del bloque debe estar entre 30 y 90 minutos'
        });
      }

      if (breakDuration < 5 || breakDuration > 30) {
        return res.status(400).json({
          error: 'La duración del recreo debe estar entre 5 y 30 minutos'
        });
      }

      const config = await prisma.scheduleConfig.upsert({
        where: { id: 1 },
        update: {
          startTime: new Date(`2000-01-01 ${startTime}`),
          endTime: new Date(`2000-01-01 ${endTime}`),
          blockDuration,
          breakDuration
        },
        create: {
          startTime: new Date(`2000-01-01 ${startTime}`),
          endTime: new Date(`2000-01-01 ${endTime}`),
          blockDuration,
          breakDuration
        }
      });

      res.json({
        startTime: config.startTime.toTimeString().slice(0, 5),
        endTime: config.endTime.toTimeString().slice(0, 5),
        blockDuration: config.blockDuration,
        breakDuration: config.breakDuration
      });
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar la configuración de horarios' });
    }
  }
};

