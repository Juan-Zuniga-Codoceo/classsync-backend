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
  // En el método update del controlador
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phone, contractType, totalHours, subjects } = req.body;

      // Validar campos requeridos
      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          error: 'Nombre, apellido y email son obligatorios'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'El formato del email no es válido'
        });
      }

      // Validar horas
      const parsedTotalHours = parseInt(totalHours);
      if (isNaN(parsedTotalHours) || parsedTotalHours <= 0 || parsedTotalHours > 44) {
        return res.status(400).json({
          error: 'Las horas totales deben estar entre 1 y 44'
        });
      }

      // Verificar si el profesor existe
      const existingTeacher = await prisma.teacher.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingTeacher) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }

      // Verificar horas totales de asignaturas
      if (subjects) {
        let totalAssignedHours = 0;
        for (const subject of subjects) {
          const subjectData = await prisma.subject.findUnique({
            where: { id: subject.subjectId }
          });
          if (!subjectData) {
            return res.status(400).json({
              error: `Asignatura con ID ${subject.subjectId} no encontrada`
            });
          }
          totalAssignedHours += subjectData.hoursPerWeek;
        }

        if (totalAssignedHours > parsedTotalHours) {
          return res.status(400).json({
            error: `Las horas asignadas (${totalAssignedHours}) superan el máximo permitido (${parsedTotalHours})`
          });
        }
      }

      // Actualizar profesor
      const updatedTeacher = await prisma.$transaction(async (prisma) => {
        // Primero eliminar asignaciones existentes
        await prisma.teacherSubject.deleteMany({
          where: { teacherId: parseInt(id) }
        });

        // Luego actualizar el profesor
        const teacher = await prisma.teacher.update({
          where: { id: parseInt(id) },
          data: {
            firstName,
            lastName,
            email,
            phone,
            contractType,
            totalHours: parsedTotalHours,
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

        return teacher;
      });

      res.json(updatedTeacher);
    } catch (error) {
      console.error('Error al actualizar profesor:', error);
      res.status(500).json({ 
        error: 'Error al actualizar el profesor',
        details: error.message 
      });
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