import prisma from '../config/db.js';

export const courseController = {
  getAll: async (req, res) => {
    try {
      const courses = await prisma.course.findMany({
        orderBy: {
          name: 'asc'
        }
      });
      console.log('Cursos recuperados:', courses);
      res.json(courses);
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      res.status(500).json({ error: 'Error al obtener los cursos' });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const course = await prisma.course.findUnique({
        where: {
          id: parseInt(id)
        }
      });

      if (!course) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      res.json(course);
    } catch (error) {
      console.error('Error al obtener curso por ID:', error);
      res.status(500).json({ error: 'Error al obtener el curso' });
    }
  },

  create: async (req, res) => {
    try {
      const { name, level } = req.body;
      console.log('Datos recibidos para crear:', { name, level });

      // Validaciones
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      // Validar nivel
      const validLevels = ['primary', 'secondary'];
      if (!validLevels.includes(level)) {
        console.log('Nivel inválido recibido:', level);
        return res.status(400).json({
          error: 'El nivel debe ser "primary" o "secondary"',
          receivedLevel: level
        });
      }

      // Crear el curso
      const course = await prisma.course.create({
        data: {
          name: name.trim(),
          level: level
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
      console.log('Datos recibidos para actualizar:', { id, name, level });

      // Validaciones
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      // Validar nivel
      const validLevels = ['primary', 'secondary'];
      if (!validLevels.includes(level)) {
        console.log('Nivel inválido recibido en actualización:', level);
        return res.status(400).json({
          error: 'El nivel debe ser "primary" o "secondary"',
          receivedLevel: level
        });
      }

      // Verificar si el curso existe
      const existingCourse = await prisma.course.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingCourse) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      const course = await prisma.course.update({
        where: {
          id: parseInt(id)
        },
        data: {
          name: name.trim(),
          level: level
        }
      });

      console.log('Curso actualizado:', course);
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

      // Verificar si existe el curso
      const existingCourse = await prisma.course.findUnique({
        where: { id: parseInt(id) },
        include: {
          teachers: true
        }
      });

      if (!existingCourse) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      // Verificar si tiene profesores asignados
      if (existingCourse.teachers.length > 0) {
        return res.status(400).json({
          error: 'No se puede eliminar el curso porque tiene profesores asignados'
        });
      }

      // Eliminar el curso
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
  }
};

export default courseController;