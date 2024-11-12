import prisma from '../config/db.js';

export const teacherController = {
  // Obtener todos los profesores
  getAll: async (req, res) => {
    try {
      const teachers = await prisma.teacher.findMany({
        include: {
          subjects: {
            include: {
              subject: true,
              course: true
            }
          }
        }
      });
      res.json(teachers);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      res.status(500).json({ error: 'Error al obtener los profesores' });
    }
  },

  // Obtener un profesor por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(id) },
        include: {
          subjects: {
            include: {
              subject: true,
              course: true
            }
          }
        }
      });

      if (!teacher) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }

      res.json(teacher);
    } catch (error) {
      console.error('Error al obtener profesor:', error);
      res.status(500).json({ error: 'Error al obtener el profesor' });
    }
  },

  // Crear un nuevo profesor
  create: async (req, res) => {
    try {
      const { firstName, lastName, email, phone, contractType, totalHours, subjects } = req.body;

      // Validaciones básicas
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ 
          error: 'Nombre, apellido y email son obligatorios' 
        });
      }

      // Verificar si el email ya existe
      const existingTeacher = await prisma.teacher.findUnique({
        where: { email }
      });

      if (existingTeacher) {
        return res.status(400).json({ 
          error: 'Ya existe un profesor con este email' 
        });
      }

      const teacher = await prisma.teacher.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          contractType,
          totalHours: parseInt(totalHours),
          ...(subjects && {
            subjects: {
              create: subjects.map(subj => ({
                subject: { connect: { id: subj.subjectId } },
                course: { connect: { id: subj.courseId } }
              }))
            }
          })
        },
        include: {
          subjects: {
            include: {
              subject: true,
              course: true
            }
          }
        }
      });

      res.status(201).json(teacher);
    } catch (error) {
      console.error('Error al crear profesor:', error);
      res.status(500).json({ error: 'Error al crear el profesor' });
    }
  },

  // Actualizar un profesor
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phone, contractType, totalHours, subjects } = req.body;

      // Verificar si el profesor existe
      const existingTeacher = await prisma.teacher.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingTeacher) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }

      // Verificar si el nuevo email ya está en uso por otro profesor
      if (email !== existingTeacher.email) {
        const emailExists = await prisma.teacher.findUnique({
          where: { email }
        });

        if (emailExists) {
          return res.status(400).json({ 
            error: 'El email ya está en uso por otro profesor' 
          });
        }
      }

      // Actualizar profesor
      const updatedTeacher = await prisma.teacher.update({
        where: { id: parseInt(id) },
        data: {
          firstName,
          lastName,
          email,
          phone,
          contractType,
          totalHours: parseInt(totalHours),
          ...(subjects && {
            subjects: {
              deleteMany: {},
              create: subjects.map(subj => ({
                subject: { connect: { id: subj.subjectId } },
                course: { connect: { id: subj.courseId } }
              }))
            }
          })
        },
        include: {
          subjects: {
            include: {
              subject: true,
              course: true
            }
          }
        }
      });

      res.json(updatedTeacher);
    } catch (error) {
      console.error('Error al actualizar profesor:', error);
      res.status(500).json({ error: 'Error al actualizar el profesor' });
    }
  },

  // Eliminar un profesor
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar si el profesor existe
      const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(id) }
      });

      if (!teacher) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }

      // Eliminar profesor y sus relaciones
      await prisma.$transaction([
        prisma.teacherSubject.deleteMany({
          where: { teacherId: parseInt(id) }
        }),
        prisma.teacher.delete({
          where: { id: parseInt(id) }
        })
      ]);

      res.json({ message: 'Profesor eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      res.status(500).json({ error: 'Error al eliminar el profesor' });
    }
  }
};