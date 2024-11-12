// controllers/subjectController.js
import prisma from '../config/db.js';

export const subjectController = {
  // Obtener todas las asignaturas
  getAll: async (req, res) => {
    try {
      const subjects = await prisma.subject.findMany({
        orderBy: {
          name: 'asc'
        }
      });

      res.json(subjects);
    } catch (error) {
      console.error('Error al obtener asignaturas:', error);
      res.status(500).json({
        error: 'Error al obtener las asignaturas',
        details: error.message
      });
    }
  },

  // Obtener una asignatura por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const subject = await prisma.subject.findUnique({
        where: { 
          id: parseInt(id) 
        },
        include: {
          teachers: {
            include: {
              teacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              },
              course: true
            }
          }
        }
      });
      
      if (!subject) {
        return res.status(404).json({ 
          error: 'Asignatura no encontrada' 
        });
      }
      
      res.json(subject);
    } catch (error) {
      console.error('Error al obtener asignatura:', error);
      res.status(500).json({ 
        error: 'Error al obtener la asignatura',
        details: error.message 
      });
    }
  },

  // Crear una nueva asignatura
  create: async (req, res) => {
    try {
      const { name, hoursPerWeek } = req.body;
      
      // Validaciones
      if (!name || name.trim() === '') {
        return res.status(400).json({ 
          error: 'El nombre de la asignatura es requerido' 
        });
      }

      if (hoursPerWeek !== undefined && (hoursPerWeek < 0 || hoursPerWeek > 40)) {
        return res.status(400).json({
          error: 'Las horas por semana deben estar entre 0 y 40'
        });
      }

      // Verificar si ya existe una asignatura con el mismo nombre
      const existingSubject = await prisma.subject.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive'
          }
        }
      });

      if (existingSubject) {
        return res.status(400).json({
          error: 'Ya existe una asignatura con este nombre'
        });
      }

      const subject = await prisma.subject.create({
        data: {
          name: name.trim(),
          hoursPerWeek: parseInt(hoursPerWeek || 0)
        }
      });
      
      res.status(201).json(subject);
    } catch (error) {
      console.error('Error al crear asignatura:', error);
      res.status(500).json({ 
        error: 'Error al crear la asignatura',
        details: error.message 
      });
    }
  },

  // Actualizar una asignatura
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, hoursPerWeek } = req.body;
      
      // Validaciones
      if (!name || name.trim() === '') {
        return res.status(400).json({ 
          error: 'El nombre de la asignatura es requerido' 
        });
      }

      if (hoursPerWeek !== undefined && (hoursPerWeek < 0 || hoursPerWeek > 40)) {
        return res.status(400).json({
          error: 'Las horas por semana deben estar entre 0 y 40'
        });
      }

      // Verificar si existe la asignatura
      const existingSubject = await prisma.subject.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingSubject) {
        return res.status(404).json({
          error: 'Asignatura no encontrada'
        });
      }

      // Verificar si el nuevo nombre ya existe en otra asignatura
      const duplicateName = await prisma.subject.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive'
          },
          id: {
            not: parseInt(id)
          }
        }
      });

      if (duplicateName) {
        return res.status(400).json({
          error: 'Ya existe otra asignatura con este nombre'
        });
      }

      const subject = await prisma.subject.update({
        where: { 
          id: parseInt(id) 
        },
        data: {
          name: name.trim(),
          hoursPerWeek: parseInt(hoursPerWeek || 0)
        }
      });
      
      res.json(subject);
    } catch (error) {
      console.error('Error al actualizar asignatura:', error);
      res.status(500).json({ 
        error: 'Error al actualizar la asignatura',
        details: error.message 
      });
    }
  },

  // Eliminar una asignatura
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar si existe la asignatura
      const existingSubject = await prisma.subject.findUnique({
        where: { id: parseInt(id) },
        include: {
          teachers: true
        }
      });

      if (!existingSubject) {
        return res.status(404).json({
          error: 'Asignatura no encontrada'
        });
      }

      // Verificar si la asignatura tiene profesores asignados
      if (existingSubject.teachers.length > 0) {
        return res.status(400).json({
          error: 'No se puede eliminar la asignatura porque tiene profesores asignados'
        });
      }

      // Eliminar la asignatura
      await prisma.subject.delete({
        where: { 
          id: parseInt(id) 
        }
      });
      
      res.json({
        message: 'Asignatura eliminada correctamente',
        id: parseInt(id)
      });
    } catch (error) {
      console.error('Error al eliminar asignatura:', error);
      res.status(500).json({ 
        error: 'Error al eliminar la asignatura',
        details: error.message 
      });
    }
  },

  // Obtener asignaturas por profesor
  getByTeacher: async (req, res) => {
    try {
      const { teacherId } = req.params;

      const subjects = await prisma.subject.findMany({
        where: {
          teachers: {
            some: {
              teacherId: parseInt(teacherId)
            }
          }
        },
        include: {
          teachers: {
            include: {
              course: true
            }
          }
        }
      });

      res.json(subjects);
    } catch (error) {
      console.error('Error al obtener asignaturas del profesor:', error);
      res.status(500).json({
        error: 'Error al obtener las asignaturas del profesor',
        details: error.message
      });
    }
  }
};

export default subjectController;