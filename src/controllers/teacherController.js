// src/controllers/teacherController.js
import prisma from '../config/db.js';

export const teacherController = {
  getAll: async (req, res) => {
    try {
      console.log('Iniciando getAll de profesores');
      const teachers = await prisma.teacher.findMany({
        where: {
          isActive: true
        },
        include: {
          assignments: {
            where: {
              isActive: true
            },
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  hoursPerWeek: true,
                }
              },
              course: {
                select: {
                  id: true,
                  name: true,
                  level: true,
                }
              }
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      });

      // Transformar los datos para la respuesta
      const formattedTeachers = teachers.map(teacher => ({
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phone: teacher.phone,
        contractType: teacher.contractType,
        totalHours: teacher.totalHours,
        subjects: teacher.assignments.map(assignment => ({
          subjectId: assignment.subject.id,
          courseId: assignment.course.id,
          subject: assignment.subject,
          course: assignment.course
        })),
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt
      }));

      console.log(`Encontrados ${formattedTeachers.length} profesores`);
      res.json(formattedTeachers);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      res.status(500).json({ 
        error: 'Error al obtener los profesores',
        details: error.message 
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const teacher = await prisma.teacher.findUnique({
        where: { 
          id: parseInt(id),
          isActive: true
        },
        include: {
          assignments: {
            where: {
              isActive: true
            },
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
      res.status(500).json({ 
        error: 'Error al obtener el profesor',
        details: error.message 
      });
    }
  },

  // Dentro de teacherController.js
create: async (req, res) => {
  try {
    const { firstName, lastName, email, phone, contractType, totalHours, subjects } = req.body;

    // Validaciones básicas
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return res.status(400).json({
        error: 'Nombre, apellido y email son obligatorios'
      });
    }

    // Validar subjects si existen
    if (subjects && Array.isArray(subjects)) {
      for (const subject of subjects) {
        if (!subject.subjectId || !subject.courseId || 
            isNaN(parseInt(subject.subjectId)) || isNaN(parseInt(subject.courseId))) {
          return res.status(400).json({
            error: 'Datos de asignación inválidos',
            details: 'Cada asignación debe tener subjectId y courseId válidos'
          });
        }
      }
    }

    // Verificar email único
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email: email.trim() }
    });

    if (existingTeacher) {
      return res.status(400).json({
        error: 'Ya existe un profesor con este email'
      });
    }

    // Crear profesor y asignaciones
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Crear el profesor
      const teacher = await prisma.teacher.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone?.trim(),
          contractType,
          totalHours: parseInt(totalHours),
          isActive: true
        }
      });

      // 2. Crear asignaciones si existen
      if (subjects && subjects.length > 0) {
        await prisma.teacherAssignment.createMany({
          data: subjects.map(subject => ({
            teacherId: teacher.id,
            subjectId: parseInt(subject.subjectId),
            courseId: parseInt(subject.courseId),
            isActive: true,
            startDate: new Date()
          }))
        });
      }

      // 3. Retornar el profesor con sus asignaciones
      return await prisma.teacher.findUnique({
        where: { id: teacher.id },
        include: {
          assignments: {
            where: {
              isActive: true
            },
            include: {
              subject: true,
              course: true
            }
          }
        }
      });
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error al crear profesor:', error);
    res.status(500).json({
      error: 'Error al crear el profesor',
      details: error.message
    });
  }
},

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phone, contractType, totalHours, subjects } = req.body;

      // Validaciones
      if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
        return res.status(400).json({
          error: 'Nombre, apellido y email son obligatorios'
        });
      }

      const existingTeacher = await prisma.teacher.findFirst({
        where: {
          id: parseInt(id),
          isActive: true
        }
      });

      if (!existingTeacher) {
        return res.status(404).json({
          error: 'Profesor no encontrado'
        });
      }

      // Verificar email único
      const duplicateEmail = await prisma.teacher.findFirst({
        where: {
          email: email.trim(),
          isActive: true,
          id: { not: parseInt(id) }
        }
      });

      if (duplicateEmail) {
        return res.status(400).json({
          error: 'Ya existe otro profesor con este email'
        });
      }

      // Actualizar profesor y asignaciones
      const result = await prisma.$transaction(async (prisma) => {
        // 1. Desactivar asignaciones existentes
        await prisma.teacherAssignment.updateMany({
          where: {
            teacherId: parseInt(id),
            isActive: true
          },
          data: {
            isActive: false,
            endDate: new Date()
          }
        });

        // 2. Actualizar profesor
        const updatedTeacher = await prisma.teacher.update({
          where: { id: parseInt(id) },
          data: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone?.trim(),
            contractType,
            totalHours: parseInt(totalHours)
          }
        });

        // 3. Crear nuevas asignaciones
        if (Array.isArray(subjects) && subjects.length > 0) {
          await prisma.teacherAssignment.createMany({
            data: subjects.map(subject => ({
              teacherId: updatedTeacher.id,
              subjectId: parseInt(subject.subjectId),
              courseId: parseInt(subject.courseId),
              isActive: true,
              startDate: new Date()
            }))
          });
        }

        // 4. Retornar profesor actualizado con asignaciones
        return await prisma.teacher.findUnique({
          where: { id: updatedTeacher.id },
          include: {
            assignments: {
              where: {
                isActive: true
              },
              include: {
                subject: true,
                course: true
              }
            }
          }
        });
      });

      res.json(result);
    } catch (error) {
      console.error('Error al actualizar profesor:', error);
      res.status(500).json({
        error: 'Error al actualizar el profesor',
        details: error.message
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar que existe el profesor
      const teacher = await prisma.teacher.findFirst({
        where: { 
          id: parseInt(id),
          isActive: true
        }
      });

      if (!teacher) {
        return res.status(404).json({
          error: 'Profesor no encontrado'
        });
      }

      // Soft delete del profesor y sus asignaciones
      await prisma.$transaction(async (prisma) => {
        // 1. Desactivar asignaciones
        await prisma.teacherAssignment.updateMany({
          where: {
            teacherId: parseInt(id),
            isActive: true
          },
          data: {
            isActive: false,
            endDate: new Date()
          }
        });

        // 2. Desactivar profesor
        await prisma.teacher.update({
          where: { id: parseInt(id) },
          data: { isActive: false }
        });
      });

      res.json({
        message: 'Profesor eliminado correctamente',
        id: parseInt(id)
      });
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      res.status(500).json({
        error: 'Error al eliminar el profesor',
        details: error.message
      });
    }
  }
};

export default teacherController;