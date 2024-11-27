// src/controllers/scheduleController.js

import prisma from '../config/db.js';
import { ScheduleGenerator } from '../utils/scheduleGenerator.js';
import ExcelJS from 'exceljs';

// Clase para manejar errores de validación
class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}
// Funciones de validación
const validateScheduleBlock = (block) => {
  const errors = [];
  
  if (!block.teacherId) errors.push('teacherId es requerido');
  if (!block.subjectId) errors.push('subjectId es requerido');
  if (!block.courseId) errors.push('courseId es requerido');
  if (!block.dayOfWeek || block.dayOfWeek < 1 || block.dayOfWeek > 5) {
    errors.push('dayOfWeek debe estar entre 1 y 5');
  }
  if (!block.blockNumber || block.blockNumber < 1 || block.blockNumber > 10) {
    errors.push('blockNumber debe estar entre 1 y 10');
  }

  return errors;
};

const validateScheduleConfig = (config) => {
  const errors = [];
  
  if (!config.startTime) errors.push('startTime es requerido');
  if (!config.endTime) errors.push('endTime es requerido');
  if (!config.blockDuration || config.blockDuration < 30 || config.blockDuration > 90) {
    errors.push('blockDuration debe estar entre 30 y 90 minutos');
  }
  if (!config.breakDuration || config.breakDuration < 5 || config.breakDuration > 30) {
    errors.push('breakDuration debe estar entre 5 y 30 minutos');
  }

  return errors;
};

export const scheduleController = {
  getAll: async (req, res) => {
    try {
      console.log('Obteniendo todos los horarios...');
      
      const schedules = await prisma.schedule.findMany({
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
          // Por día
          formattedSchedule.byDay[schedule.dayOfWeek - 1][schedule.blockNumber - 1] = {
            id: schedule.id,
            teacher: `${schedule.teacher.firstName} ${schedule.teacher.lastName}`,
            subject: schedule.subject.name,
            course: schedule.course.name
          };

          // Por profesor
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

          // Por curso
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

      console.log(`Se procesaron ${schedules.length} horarios`);
      res.json(formattedSchedule);
    } catch (error) {
      console.error('Error getting schedules:', error);
      res.status(500).json({ 
        error: 'Error al obtener los horarios',
        details: error.message 
      });
    }
  },

  generate: async (req, res) => {
    try {
      console.log('Iniciando generación de horario...');
  
      // 1. Verificar configuración
      const config = await prisma.scheduleConfig.findFirst();
      if (!config) {
        return res.status(400).json({
          error: 'Configuración no encontrada',
          details: 'Debe configurar los parámetros del horario primero'
        });
      }
  
      // 2. Obtener datos necesarios
      const [teachers, subjects, courses] = await Promise.all([
        prisma.teacher.findMany({
          include: {
            subjects: {
              include: {
                subject: true,
                course: true
              }
            }
          }
        }),
        prisma.subject.findMany(),
        prisma.course.findMany()
      ]);
  
      console.log(`Datos cargados: ${teachers.length} profesores, ${subjects.length} materias, ${courses.length} cursos`);
  
      // 3. Validaciones iniciales
      if (teachers.length === 0) {
        return res.status(400).json({
          error: 'No hay profesores',
          details: 'Debe registrar al menos un profesor en el sistema'
        });
      }
  
      if (subjects.length === 0) {
        return res.status(400).json({
          error: 'No hay asignaturas',
          details: 'Debe registrar al menos una asignatura en el sistema'
        });
      }
  
      if (courses.length === 0) {
        return res.status(400).json({
          error: 'No hay cursos',
          details: 'Debe registrar al menos un curso en el sistema'
        });
      }
  
      // 4. Validar asignaciones
      const teachersWithSubjects = teachers.filter(t => t.subjects.length > 0);
      if (teachersWithSubjects.length === 0) {
        return res.status(400).json({
          error: 'No hay profesores con asignaturas asignadas',
          details: 'Debe asignar materias y cursos a los profesores antes de generar el horario'
        });
      }
  
      // 5. Validar que cada asignatura tenga al menos un profesor asignado
      const assignedSubjectIds = new Set(
        teachersWithSubjects.flatMap(t => t.subjects.map(s => s.subjectId))
      );
      const unassignedSubjects = subjects.filter(s => !assignedSubjectIds.has(s.id));
      
      if (unassignedSubjects.length > 0) {
        return res.status(400).json({
          error: 'Hay asignaturas sin profesores',
          details: `Las siguientes asignaturas no tienen profesores asignados: ${unassignedSubjects.map(s => s.name).join(', ')}`
        });
      }
  
      // 6. Validar que cada curso tenga todas sus asignaturas asignadas
      const courseSubjects = new Map(); // Map para rastrear asignaturas por curso
      teachersWithSubjects.forEach(teacher => {
        teacher.subjects.forEach(assignment => {
          const courseId = assignment.courseId;
          if (!courseSubjects.has(courseId)) {
            courseSubjects.set(courseId, new Set());
          }
          courseSubjects.get(courseId).add(assignment.subjectId);
        });
      });
  
      const coursesWithMissingSubjects = courses.filter(course => {
        const assignedSubjects = courseSubjects.get(course.id)?.size || 0;
        return assignedSubjects < subjects.length;
      });
  
      if (coursesWithMissingSubjects.length > 0) {
        return res.status(400).json({
          error: 'Hay cursos con asignaturas faltantes',
          details: `Los siguientes cursos no tienen todas las asignaturas asignadas: ${coursesWithMissingSubjects.map(c => c.name).join(', ')}`
        });
      }
  
      // 7. Calcular carga horaria
      let totalHoursNeeded = 0;
      teachersWithSubjects.forEach(teacher => {
        teacher.subjects.forEach(assignment => {
          totalHoursNeeded += assignment.subject.hoursPerWeek;
        });
      });
  
      const blocksPerDay = Math.floor(
        (new Date(`2000-01-01 ${config.endTime}`) - new Date(`2000-01-01 ${config.startTime}`)) / 
        (1000 * 60 * config.blockDuration)
      );
      const totalBlocksAvailable = blocksPerDay * 5;
  
      if (totalHoursNeeded > totalBlocksAvailable) {
        return res.status(400).json({
          error: 'Exceso de horas',
          details: `Se necesitan ${totalHoursNeeded} horas pero solo hay ${totalBlocksAvailable} bloques disponibles`,
          suggestion: 'Reduzca la carga horaria o aumente los bloques disponibles'
        });
      }
  
      // 8. Generar horario
      console.log('Iniciando generación con ScheduleGenerator...');
      const generator = new ScheduleGenerator(
        teachersWithSubjects,
        subjects,
        courses,
        {
          startTime: config.startTime.toTimeString().slice(0, 5),
          endTime: config.endTime.toTimeString().slice(0, 5),
          blockDuration: config.blockDuration,
          breakDuration: config.breakDuration
        }
      );
  
      try {
        const generatedSchedule = generator.generate();
        
        // 9. Guardar horario
        await prisma.$transaction([
          prisma.schedule.deleteMany(),
          prisma.schedule.createMany({
            data: generatedSchedule.map(schedule => ({
              teacherId: parseInt(schedule.teacherId),
              subjectId: parseInt(schedule.subjectId),
              courseId: parseInt(schedule.courseId),
              dayOfWeek: parseInt(schedule.dayOfWeek),
              blockNumber: parseInt(schedule.blockNumber)
            }))
          })
        ]);
  
        console.log('Horario generado y guardado exitosamente');
        res.json({
          message: 'Horario generado exitosamente',
          schedule: generatedSchedule
        });
      } catch (genError) {
        console.error('Error en generación:', genError);
        return res.status(400).json({
          error: 'Error en generación',
          details: genError.message,
          suggestion: 'Verifique que las asignaciones de profesores y cursos sean coherentes con las horas requeridas por cada asignatura'
        });
      }
    } catch (error) {
      console.error('Error general en generate:', error);
      res.status(500).json({
        error: 'Error al generar el horario',
        details: error.message
      });
    }
  },
  
  checkConfig: async (req, res) => {
    try {
      console.log('Verificando configuración...');
      
      // Obtener configuración
      const config = await prisma.scheduleConfig.findFirst();
      
      if (!config) {
        console.log('No se encontró configuración');
        return res.status(400).json({
          configured: false,
          error: 'Debe configurar los parámetros del horario primero',
          checks: {
            hasConfig: false,
            message: 'No hay configuración inicial'
          }
        });
      }
  
      // Verificar datos necesarios
      const [teachersCount, subjectsCount, coursesCount] = await Promise.all([
        prisma.teacher.count(),
        prisma.subject.count(),
        prisma.course.count()
      ]);
  
      const checks = {
        hasConfig: true,
        hasTeachers: teachersCount > 0,
        hasSubjects: subjectsCount > 0,
        hasCourses: coursesCount > 0,
        config: {
          startTime: config.startTime,
          endTime: config.endTime,
          blockDuration: config.blockDuration,
          breakDuration: config.breakDuration
        }
      };
  
      console.log('Resultado de verificación:', checks);
  
      if (!checks.hasTeachers || !checks.hasSubjects || !checks.hasCourses) {
        return res.status(400).json({
          configured: false,
          error: 'Faltan datos necesarios para generar el horario',
          checks
        });
      }
  
      res.json({
        configured: true,
        checks
      });
    } catch (error) {
      console.error('Error al verificar configuración:', error);
      res.status(500).json({
        error: 'Error al verificar la configuración',
        details: error.message
      });
    }
  },

  getConfig: async (req, res) => {
    try {
      const config = await prisma.scheduleConfig.findFirst();

      if (!config) {
        return res.json({
          startTime: '08:00',
          endTime: '16:00',
          blockDuration: 45,
          breakDuration: 15,
          isDefault: true
        });
      }

      res.json({
        startTime: config.startTime.toTimeString().slice(0, 5),
        endTime: config.endTime.toTimeString().slice(0, 5),
        blockDuration: config.blockDuration,
        breakDuration: config.breakDuration,
        isDefault: false
      });
    } catch (error) {
      console.error('Error getting config:', error);
      res.status(500).json({ error: 'Error al obtener la configuración' });
    }
  },

  updateConfig: async (req, res) => {
    try {
      console.log('Actualizando configuración...', req.body);
      const { startTime, endTime, blockDuration, breakDuration } = req.body;

      // Validaciones
      const errors = validateScheduleConfig({ startTime, endTime, blockDuration, breakDuration });
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: errors
        });
      }

      // Verificar tiempos
      const start = new Date(`2000-01-01 ${startTime}`);
      const end = new Date(`2000-01-01 ${endTime}`);
      const totalMinutes = (end - start) / (1000 * 60);
      const totalBlocks = Math.floor(totalMinutes / (parseInt(blockDuration) + parseInt(breakDuration)));

      if (totalBlocks < 4) {
        return res.status(400).json({
          error: 'Configuración inválida',
          details: 'La configuración debe permitir al menos 4 bloques de clase'
        });
      }

      const config = await prisma.scheduleConfig.upsert({
        where: { id: 1 },
        update: {
          startTime: new Date(`2000-01-01 ${startTime}`),
          endTime: new Date(`2000-01-01 ${endTime}`),
          blockDuration: parseInt(blockDuration),
          breakDuration: parseInt(breakDuration)
        },
        create: {
          startTime: new Date(`2000-01-01 ${startTime}`),
          endTime: new Date(`2000-01-01 ${endTime}`),
          blockDuration: parseInt(blockDuration),
          breakDuration: parseInt(breakDuration)
        }
      });

      console.log('Configuración actualizada:', config);
      res.json({
        startTime: config.startTime.toTimeString().slice(0, 5),
        endTime: config.endTime.toTimeString().slice(0, 5),
        blockDuration: config.blockDuration,
        breakDuration: config.breakDuration,
        possibleBlocks: totalBlocks
      });
    } catch (error) {
      console.error('Error updating config:', error);
      res.status(500).json({ error: 'Error al actualizar la configuración' });
    }
  },

  exportToExcel: async (req, res) => {
    try {
      console.log('Iniciando exportación a Excel...');
      const schedules = await prisma.schedule.findMany({
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

      if (!schedules.length) {
        return res.status(400).json({
          error: 'No hay datos para exportar',
          details: 'No se encontraron horarios registrados'
        });
      }

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'ClassSync';
      workbook.lastModifiedBy = 'ClassSync System';
      workbook.created = new Date();
      workbook.modified = new Date();

      const worksheet = workbook.addWorksheet('Horarios', {
        properties: { tabColor: { argb: '2e60ff' } }
      });

      // Configurar encabezados
      worksheet.columns = [
        { header: 'Día', key: 'day', width: 12 },
        { header: 'Bloque', key: 'block', width: 10 },
        { header: 'Profesor', key: 'teacher', width: 30 },
        { header: 'Asignatura', key: 'subject', width: 20 },
        { header: 'Curso', key: 'course', width: 15 }
      ];

      // Agregar datos
      const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      schedules.forEach(schedule => {
        worksheet.addRow({
          day: days[schedule.dayOfWeek - 1],
          block: `Bloque ${schedule.blockNumber}`,
          teacher: `${schedule.teacher.firstName} ${schedule.teacher.lastName}`,
          subject: schedule.subject.name,
          course: schedule.course.name
        });
      });

      // Estilos
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Configurar respuesta
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=horarios_${new Date().toISOString().split('T')[0]}.xlsx`
      );

      await workbook.xlsx.write(res);
      console.log('Excel generado y enviado exitosamente');
      res.end();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      res.status(500).json({ error: 'Error al exportar a Excel' });
    }
  },

  getStats: async (req, res) => {
    try {
      const [schedules, totalTeachers, totalSubjects, totalCourses] = await Promise.all([
        prisma.schedule.findMany({
          include: {
            teacher: true,
            subject: true,
            course: true
          }
        }),
        prisma.teacher.count(),
        prisma.subject.count(),
        prisma.course.count()
      ]);

      const stats = {
        totalTeachers,
        totalSubjects,
        totalCourses,
        totalBlocks: schedules.length,
        byDay: {},
        byTeacher: {},
        byCourse: {}
      };

      schedules.forEach(schedule => {
        // Estadísticas por día
        stats.byDay[schedule.dayOfWeek] = (stats.byDay[schedule.dayOfWeek] || 0) + 1;

        // Estadísticas por profesor
        if (!stats.byTeacher[schedule.teacherId]) {
          stats.byTeacher[schedule.teacherId] = {
            name: `${schedule.teacher.firstName} ${schedule.teacher.lastName}`,
            blocks: 0,
            subjects: new Set(),
            courses: new Set()
          };
        }
        stats.byTeacher[schedule.teacherId].blocks++;
        stats.byTeacher[schedule.teacherId].subjects.add(schedule.subject.name);
        stats.byTeacher[schedule.teacherId].courses.add(schedule.course.name);

        // Estadísticas por curso
        if (!stats.byCourse[schedule.courseId]) {
          stats.byCourse[schedule.courseId] = {
            name: schedule.course.name,
            blocks: 0,
            subjects: new Set(),
            teachers: new Set()
          };
        }
        stats.byCourse[schedule.courseId].blocks++;
        stats.byCourse[schedule.courseId].subjects.add(schedule.subject.name);
        stats.byCourse[schedule.courseId].teachers.add(
          `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
        );
      });

      // Convertir Sets a arrays para la respuesta JSON
      Object.values(stats.byTeacher).forEach(teacher => {
        teacher.subjects = Array.from(teacher.subjects);
        teacher.courses = Array.from(teacher.courses);
      });

      Object.values(stats.byCourse).forEach(course => {
        course.subjects = Array.from(course.subjects);
        course.teachers = Array.from(course.teachers);
      });

      res.json(stats);
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  getBlocksByTeacher: async (req, res) => {
    try {
      const { teacherId } = req.params;
      const blocks = await prisma.schedule.findMany({
        where: { teacherId: parseInt(teacherId) },
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

      res.json(blocks);
    } catch (error) {
      console.error('Error getting teacher blocks:', error);
      res.status(500).json({ error: 'Error al obtener los bloques del profesor' });
    }
  },

  getBlocksByCourse: async (req, res) => {
    try {
      const { courseId } = req.params;
      const blocks = await prisma.schedule.findMany({
        where: { courseId: parseInt(courseId) },
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

      res.json(blocks);
    } catch (error) {
      console.error('Error getting course blocks:', error);
      res.status(500).json({ error: 'Error al obtener los bloques del curso' });
    }
  },

  getBlock: async (req, res) => {
    try {
      const { id } = req.params;
      const block = await prisma.schedule.findUnique({
        where: { id: parseInt(id) },
        include: {
          teacher: true,
          subject: true,
          course: true
        }
      });

      if (!block) {
        return res.status(404).json({ error: 'Bloque no encontrado' });
      }

      res.json(block);
    } catch (error) {
      console.error('Error getting block:', error);
      res.status(500).json({ error: 'Error al obtener el bloque' });
    }
  },

  createBlock: async (req, res) => {
    try {
      const { teacherId, subjectId, courseId, dayOfWeek, blockNumber } = req.body;

      // Validar datos
      const errors = validateScheduleBlock({
        teacherId,
        subjectId,
        courseId,
        dayOfWeek,
        blockNumber
      });

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Verificar conflictos
      const existingBlock = await prisma.schedule.findFirst({
        where: {
          OR: [
            { teacherId, dayOfWeek, blockNumber },
            { courseId, dayOfWeek, blockNumber }
          ]
        }
      });

      if (existingBlock) {
        return res.status(400).json({
          error: 'Ya existe un bloque en este horario'
        });
      }

      const block = await prisma.schedule.create({
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

      res.status(201).json(block);
    } catch (error) {
      console.error('Error creating block:', error);
      res.status(500).json({ error: 'Error al crear el bloque' });
    }
  },

  updateBlock: async (req, res) => {
    try {
      const { id } = req.params;
      const { teacherId, subjectId, courseId, dayOfWeek, blockNumber } = req.body;

      // Validar datos
      const errors = validateScheduleBlock({
        teacherId,
        subjectId,
        courseId,
        dayOfWeek,
        blockNumber
      });

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Verificar conflictos excluyendo el bloque actual
      const existingBlock = await prisma.schedule.findFirst({
        where: {
          OR: [
            { teacherId, dayOfWeek, blockNumber },
            { courseId, dayOfWeek, blockNumber }
          ],
          NOT: { id: parseInt(id) }
        }
      });

      if (existingBlock) {
        return res.status(400).json({
          error: 'Ya existe un bloque en este horario'
        });
      }

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
      console.error('Error updating block:', error);
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
      console.error('Error deleting block:', error);
      res.status(500).json({ error: 'Error al eliminar el bloque' });
    }
  }
};

export default scheduleController;