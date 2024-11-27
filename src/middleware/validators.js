import { body, validationResult } from 'express-validator';

export const validateScheduleConfig = [
  body('startTime')
    .isString()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora de inicio debe tener un formato válido (HH:MM)'),
  
  body('endTime')
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
    .isInt({ min: 30, max: 90 })
    .withMessage('La duración del bloque debe estar entre 30 y 90 minutos'),
  
  body('breakDuration')
    .isInt({ min: 5, max: 30 })
    .withMessage('La duración del recreo debe estar entre 5 y 30 minutos'),

  // Middleware de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de configuración inválidos',
        details: errors.array()
      });
    }
    next();
  }
];