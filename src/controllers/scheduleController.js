import prisma from '../config/db.js';
import { ScheduleGenerator } from '../utils/scheduleGenerator.js';
import ExcelJS from 'exceljs';

const calculateWeeklyBlocks = (hoursPerWeek, blockDuration) => {
  const minutesPerWeek = hoursPerWeek * 60;
  return Math.ceil(minutesPerWeek / blockDuration);
};

export const scheduleController = {
  getAll: async (req, res) => {
    try {
      console.log('Obteniendo todos los horarios...');
      
      const schedules = await prisma.schedule.findMany({
        where: { isActive: true },
        include: {
          teacher: true,
          subject: true,
          course: true
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { blockNumber: 'asc' }
        ]
      });

      const formattedSchedule = {
        byTeacher: {},
        byCourse: {},
        byDay: Array(5).fill().map(() => Array(10).fill(null))
      };

      schedules.forEach(schedule => {
        if (schedule.dayOfWeek >= 1 && schedule.dayOfWeek <= 5 &&
            schedule.blockNumber >= 1 && schedule.blockNumber <= 10) {
          
          formattedSchedule.byDay[schedule.dayOfWeek - 1][schedule.blockNumber - 1] = {
            id: schedule.id,
            teacher: `${schedule.teacher.firstName} ${schedule.teacher.lastName}`,
            subject: schedule.subject.name,
            course: schedule.course.name
          };

          if (!formattedSchedule.byTeacher[schedule.teacherId]) {
            formattedSchedule.byTeacher[schedule.teacherId] = {
              teacher: `${schedule.teacher.firstName} ${schedule.teacher.lastName}`,
              schedule: Array(5).fill().map(() => Array(10).fill(null))
            };
          }
          formattedSchedule.byTeacher[schedule.teacherId]
            .schedule[schedule.dayOfWeek - 1][schedule.blockNumber - 1] = {
              subject: schedule.subject.name,
              course: schedule.course.name
            };

          if (!formattedSchedule.byCourse[schedule.courseId]) {
            formattedSchedule.byCourse[schedule.courseId] = {
              course: schedule.course.name,
              schedule: Array(5).fill().map(() => Array(10).fill(null))
            };
          }
          formattedSchedule.byCourse[schedule.courseId]
            .schedule[schedule.dayOfWeek - 1][schedule.blockNumber - 1] = {
              subject: schedule.subject.name,
              teacher: `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
            };
        }
      });

      res.json(formattedSchedule);
    } catch (error) {
      console.error('Error al obtener horarios:', error);
      res.status(500).json({ 
        error: 'Error al obtener los horarios',
        details: error.message 
      });
    }
  },

  // ... [resto del código hasta getBlocksByCourse sin cambios]

  createBlock: async (req, res) => {
    try {
      const { teacherId, subjectId, courseId, dayOfWeek, blockNumber } = req.body;

      // Validar que no exista un bloque en el mismo horario
      const existingBlock = await prisma.schedule.findFirst({
        where: {
          OR: [
            { teacherId, dayOfWeek, blockNumber },
            { courseId, dayOfWeek, blockNumber }
          ],
          isActive: true
        }
      });

      if (existingBlock) {
        return res.status(400).json({
          error: 'Conflicto de horario',
          details: 'Ya existe un bloque asignado en este horario'
        });
      }

      const block = await prisma.schedule.create({
        data: {
          teacherId: parseInt(teacherId),
          subjectId: parseInt(subjectId),
          courseId: parseInt(courseId),
          dayOfWeek: parseInt(dayOfWeek),
          blockNumber: parseInt(blockNumber),
          isActive: true
        },
        include: {
          teacher: true,
          subject: true,
          course: true
        }
      });

      res.status(201).json(block);
    } catch (error) {
      console.error('Error al crear bloque:', error);
      res.status(500).json({ error: 'Error al crear el bloque' });
    }
  },

  updateBlock: async (req, res) => {
    try {
      const { id } = req.params;
      const { teacherId, subjectId, courseId, dayOfWeek, blockNumber } = req.body;

      const block = await prisma.schedule.update({
        where: { id: parseInt(id) },
        data: {
          teacherId: parseInt(teacherId),
          subjectId: parseInt(subjectId),
          courseId: parseInt(courseId),
          dayOfWeek: parseInt(dayOfWeek),
          blockNumber: parseInt(blockNumber)
        },
        include: {
          teacher: true,
          subject: true,
          course: true
        }
      });

      res.json(block);
    } catch (error) {
      console.error('Error al actualizar bloque:', error);
      res.status(500).json({ error: 'Error al actualizar el bloque' });
    }
  },

  deleteBlock: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.schedule.delete({
        where: { id: parseInt(id) }
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar bloque:', error);
      res.status(500).json({ error: 'Error al eliminar el bloque' });
    }
  }
};

export default scheduleController;