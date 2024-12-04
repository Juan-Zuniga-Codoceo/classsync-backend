import { body, param, validationResult } from 'express-validator';

// Validación de configuración del horario
export const validateScheduleConfig = [
  body('startTime')
    .notEmpty()
    .withMessage('La hora de inicio es requerida')
    .isString()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora de inicio debe tener un formato válido (HH:MM)'),
  
  body('endTime')
    .notEmpty()
    .withMessage('La hora de término es requerida')
    .isString()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora de término debe tener un formato válido (HH:MM)')
    .custom((value, { req }) => {
      const start = new Date(`2000-01-01 ${req.body.startTime}`);
      const end = new Date(`2000-01-01 ${value}`);
      if (end <= start) {
        throw new Error('La hora de término debe ser posterior a la hora de inicio');
      }
      return true;
    }),
  
  body('blockDuration')
    .notEmpty()
    .withMessage('La duración del bloque es requerida')
    .isInt({ min: 30, max: 90 })
    .withMessage('La duración del bloque debe estar entre 30 y 90 minutos'),
  
  body('breakDuration')
    .notEmpty()
    .withMessage('La duración del recreo es requerida')
    .isInt({ min: 5, max: 30 })
    .withMessage('La duración del recreo debe estar entre 5 y 30 minutos'),

  // Validación de suficientes bloques
  body().custom((value) => {
    const { startTime, endTime, blockDuration, breakDuration } = value;
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const totalMinutes = (end - start) / (1000 * 60);
    const possibleBlocks = Math.floor(totalMinutes / (parseInt(blockDuration) + parseInt(breakDuration)));
    
    if (possibleBlocks < 4) {
      throw new Error('La configuración debe permitir al menos 4 bloques por día');
    }
    return true;
  }),

  // Middleware de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de configuración inválidos',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  }
];

// Validación de bloques de horario
export const validateScheduleBlock = [
  body('teacherId')
    .notEmpty()
    .withMessage('El profesor es requerido')
    .isInt()
    .withMessage('ID de profesor inválido'),

  body('subjectId')
    .notEmpty()
    .withMessage('La asignatura es requerida')
    .isInt()
    .withMessage('ID de asignatura inválido'),

  body('courseId')
    .notEmpty()
    .withMessage('El curso es requerido')
    .isInt()
    .withMessage('ID de curso inválido'),

  body('dayOfWeek')
    .notEmpty()
    .withMessage('El día es requerido')
    .isInt({ min: 1, max: 5 })
    .withMessage('El día debe estar entre 1 y 5'),

  body('blockNumber')
    .notEmpty()
    .withMessage('El número de bloque es requerido')
    .isInt({ min: 1, max: 10 })
    .withMessage('El número de bloque debe estar entre 1 y 10'),

  // Validación de conflictos
  body().custom(async (value, { req }) => {
    const { teacherId, courseId, dayOfWeek, blockNumber } = value;
    const prisma = req.app.locals.prisma;

    const existingBlock = await prisma.schedule.findFirst({
      where: {
        OR: [
          { teacherId: parseInt(teacherId), dayOfWeek: parseInt(dayOfWeek), blockNumber: parseInt(blockNumber) },
          { courseId: parseInt(courseId), dayOfWeek: parseInt(dayOfWeek), blockNumber: parseInt(blockNumber) }
        ],
        isActive: true,
        NOT: req.params.id ? { id: parseInt(req.params.id) } : undefined
      }
    });

    if (existingBlock) {
      throw new Error('Ya existe un bloque asignado en este horario');
    }
    return true;
  }),

  // Validación de asignación profesor-asignatura
  body().custom(async (value, { req }) => {
    const { teacherId, subjectId, courseId } = value;
    const prisma = req.app.locals.prisma;

    const assignment = await prisma.teacherAssignment.findFirst({
      where: {
        teacherId: parseInt(teacherId),
        subjectId: parseInt(subjectId),
        courseId: parseInt(courseId),
        isActive: true
      }
    });

    if (!assignment) {
      throw new Error('El profesor no tiene asignada esta materia para este curso');
    }
    return true;
  }),

  // Middleware de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de bloque inválidos',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  }
];

// Validación de ID en parámetros
export const validateId = [
  param('id')
    .notEmpty()
    .withMessage('El ID es requerido')
    .isInt()
    .withMessage('ID inválido'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'ID inválido',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    next();
  }
];