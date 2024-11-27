// src/controllers/courseController.js
import prisma from '../config/db.js';

const courseController = {
  getAll: async (req, res) => {
    try {
      console.log('Obteniendo cursos...');
      const courses = await prisma.course.findMany({
        where: {
          isActive: true
        },
        include: {
          courseSubjects: {
            where: {
              isActive: true
            },
            include: {
              subject: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: [
          { level: 'asc' },
          { name: 'asc' }
        ]
      });

      console.log('Cursos recuperados:', courses);
      res.json(courses);
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      res.status(500).json({
        error: 'Error al obtener los cursos',
        details: error.message
      });
    }
  },
  
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const course = await prisma.course.findUnique({
        where: { id: parseInt(id) }
      });

      if (!course) {
        return res.status(404).json({ 
          error: 'Curso no encontrado' 
        });
      }

      res.json(course);
    } catch (error) {
      console.error('Error al obtener curso:', error);
      res.status(500).json({
        error: 'Error al obtener el curso',
        details: error.message
      });
    }
  },

  create: async (req, res) => {
    try {
      console.log('Datos recibidos:', req.body);
      const { name, level } = req.body;

      // Validaciones básicas
      if (!name?.trim()) {
        return res.status(400).json({ 
          error: 'El nombre es requerido' 
        });
      }

      if (!['primary', 'secondary'].includes(level)) {
        return res.status(400).json({ 
          error: 'El nivel debe ser "primary" o "secondary"' 
        });
      }

      // Verificar si ya existe un curso con el mismo nombre en el mismo nivel
      const existingCourse = await prisma.course.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive'
          },
          level: level
        }
      });

      if (existingCourse) {
        return res.status(400).json({
          error: 'Ya existe un curso con este nombre en el mismo nivel'
        });
      }

      // Crear el curso
      const course = await prisma.course.create({
        data: {
          name: name.trim(),
          level
        }
      });

      console.log('Curso creado:', course);
      res.status(201).json(course);
    } catch (error) {
      console.error('Error al crear curso:', error);
      res.status(500).json({
        error: 'Error al crear el curso',
        details: error.message
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, level } = req.body;

      // Validaciones básicas
      if (!name?.trim()) {
        return res.status(400).json({ 
          error: 'El nombre es requerido' 
        });
      }

      if (!['primary', 'secondary'].includes(level)) {
        return res.status(400).json({ 
          error: 'El nivel debe ser "primary" o "secondary"' 
        });
      }

      // Verificar si existe otro curso con el mismo nombre en el mismo nivel
      const existingCourse = await prisma.course.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive'
          },
          level: level,
          id: {
            not: parseInt(id)
          }
        }
      });

      if (existingCourse) {
        return res.status(400).json({
          error: 'Ya existe otro curso con este nombre en el mismo nivel'
        });
      }

      const course = await prisma.course.update({
        where: { id: parseInt(id) },
        data: {
          name: name.trim(),
          level
        }
      });

      res.json(course);
    } catch (error) {
      console.error('Error al actualizar curso:', error);
      res.status(500).json({
        error: 'Error al actualizar el curso',
        details: error.message
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar si el curso existe
      const course = await prisma.course.findUnique({
        where: { id: parseInt(id) },
        include: {
          teachers: true
        }
      });

      if (!course) {
        return res.status(404).json({
          error: 'Curso no encontrado'
        });
      }

      // Verificar si tiene profesores asignados
      if (course.teachers.length > 0) {
        return res.status(400).json({
          error: 'No se puede eliminar el curso porque tiene profesores asignados'
        });
      }

      await prisma.course.delete({
        where: { id: parseInt(id) }
      });

      res.json({ 
        message: 'Curso eliminado correctamente',
        id: parseInt(id)
      });
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      res.status(500).json({
        error: 'Error al eliminar el curso',
        details: error.message
      });
    }
  },

  // Obtener cursos por nivel
  getByLevel: async (req, res) => {
    try {
      const { level } = req.params;
      
      if (!['primary', 'secondary'].includes(level)) {
        return res.status(400).json({ 
          error: 'Nivel inválido' 
        });
      }

      const courses = await prisma.course.findMany({
        where: { level },
        orderBy: { name: 'asc' }
      });

      res.json(courses);
    } catch (error) {
      console.error('Error al obtener cursos por nivel:', error);
      res.status(500).json({
        error: 'Error al obtener los cursos',
        details: error.message
      });
    }
  }
};

export default courseController;