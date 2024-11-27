// controllers/subjectController.js
import prisma from '../config/db.js';

export const subjectController = {
  getAll: async (req, res) => {
    try {
      const subjects = await prisma.subject.findMany({
        where: {
          isActive: true
        },
        include: {
          courseSubjects: {
            where: {
              isActive: true
            },
            include: {
              course: {
                select: {
                  id: true,
                  name: true,
                  level: true
                }
              }
            }
          },
          assignments: {
            where: {
              isActive: true
            },
            include: {
              teacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              },
              course: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      const formattedSubjects = subjects.map(subject => ({
        id: subject.id,
        name: subject.name,
        courses: subject.courseSubjects.map(cs => ({
          id: cs.course.id,
          name: cs.course.name,
          level: cs.course.level,
          hoursPerWeek: cs.hoursPerWeek,
          activeTeacher: subject.assignments.find(
            a => a.courseId === cs.course.id
          )?.teacher || null
        }))
      }));

      res.json(formattedSubjects);
    } catch (error) {
      console.error('Error al obtener asignaturas:', error);
      res.status(500).json({
        error: 'Error al obtener las asignaturas',
        details: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const subject = await prisma.subject.findUnique({
        where: { 
          id: parseInt(id),
          isActive: true
        },
        include: {
          courseSubjects: {
            where: {
              isActive: true
            },
            include: {
              course: true
            }
          },
          assignments: {
            where: {
              isActive: true
            },
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

      const formattedSubject = {
        id: subject.id,
        name: subject.name,
        courses: subject.courseSubjects.map(cs => ({
          id: cs.course.id,
          name: cs.course.name,
          level: cs.course.level,
          hoursPerWeek: cs.hoursPerWeek,
          activeTeacher: subject.assignments.find(
            a => a.courseId === cs.course.id
          )?.teacher || null
        }))
      };
      
      res.json(formattedSubject);
    } catch (error) {
      console.error('Error al obtener asignatura:', error);
      res.status(500).json({ 
        error: 'Error al obtener la asignatura',
        details: error.message 
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name, courses } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ 
          error: 'El nombre de la asignatura es requerido' 
        });
      }

      if (!Array.isArray(courses) || courses.length === 0) {
        return res.status(400).json({
          error: 'Debe asignar al menos un curso con sus horas correspondientes'
        });
      }

      for (const course of courses) {
        if (!course.hoursPerWeek || course.hoursPerWeek < 1 || course.hoursPerWeek > 40) {
          return res.status(400).json({
            error: `Las horas semanales para cada curso deben estar entre 1 y 40`
          });
        }
      }

      const existingSubject = await prisma.subject.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive'
          },
          isActive: true
        }
      });

      if (existingSubject) {
        return res.status(400).json({
          error: 'Ya existe una asignatura con este nombre'
        });
      }

      const result = await prisma.$transaction(async (prisma) => {
        const newSubject = await prisma.subject.create({
          data: {
            name: name.trim(),
            isActive: true
          }
        });

        await prisma.courseSubject.createMany({
          data: courses.map(course => ({
            subjectId: newSubject.id,
            courseId: parseInt(course.id),
            hoursPerWeek: parseInt(course.hoursPerWeek),
            isActive: true
          }))
        });

        return await prisma.subject.findUnique({
          where: { id: newSubject.id },
          include: {
            courseSubjects: {
              where: {
                isActive: true
              },
              include: {
                course: true
              }
            }
          }
        });
      });

      res.status(201).json(result);
    } catch (error) {
      console.error('Error al crear asignatura:', error);
      res.status(500).json({ 
        error: 'Error al crear la asignatura',
        details: error.message 
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, courses } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ 
          error: 'El nombre de la asignatura es requerido' 
        });
      }

      if (!Array.isArray(courses) || courses.length === 0) {
        return res.status(400).json({
          error: 'Debe asignar al menos un curso con sus horas correspondientes'
        });
      }

      for (const course of courses) {
        if (!course.hoursPerWeek || course.hoursPerWeek < 1 || course.hoursPerWeek > 40) {
          return res.status(400).json({
            error: `Las horas semanales para cada curso deben estar entre 1 y 40`
          });
        }
      }

      const existingSubject = await prisma.subject.findUnique({
        where: { 
          id: parseInt(id),
          isActive: true
        }
      });

      if (!existingSubject) {
        return res.status(404).json({
          error: 'Asignatura no encontrada'
        });
      }

      const duplicateName = await prisma.subject.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive'
          },
          id: {
            not: parseInt(id)
          },
          isActive: true
        }
      });

      if (duplicateName) {
        return res.status(400).json({
          error: 'Ya existe otra asignatura con este nombre'
        });
      }

      const result = await prisma.$transaction(async (prisma) => {
        const updatedSubject = await prisma.subject.update({
          where: { id: parseInt(id) },
          data: {
            name: name.trim()
          }
        });

        // Obtener relaciones existentes
        const existingRelations = await prisma.courseSubject.findMany({
          where: {
            subjectId: parseInt(id),
            isActive: true
          }
        });

        const existingCourseIds = existingRelations.map(rel => rel.courseId);
        const newCourseIds = courses.map(c => parseInt(c.id));

        // Desactivar relaciones que ya no se usan
        await prisma.courseSubject.updateMany({
          where: {
            subjectId: parseInt(id),
            courseId: {
              in: existingCourseIds.filter(id => !newCourseIds.includes(id))
            },
            isActive: true
          },
          data: {
            isActive: false
          }
        });

        // Actualizar relaciones existentes
        for (const course of courses) {
          if (existingCourseIds.includes(parseInt(course.id))) {
            await prisma.courseSubject.updateMany({
              where: {
                subjectId: parseInt(id),
                courseId: parseInt(course.id),
                isActive: true
              },
              data: {
                hoursPerWeek: parseInt(course.hoursPerWeek)
              }
            });
          } else {
            // Crear nueva relación
            await prisma.courseSubject.create({
              data: {
                subjectId: parseInt(id),
                courseId: parseInt(course.id),
                hoursPerWeek: parseInt(course.hoursPerWeek),
                isActive: true
              }
            });
          }
        }

        return await prisma.subject.findUnique({
          where: { id: updatedSubject.id },
          include: {
            courseSubjects: {
              where: {
                isActive: true
              },
              include: {
                course: true
              }
            }
          }
        });
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error al actualizar asignatura:', error);
      res.status(500).json({ 
        error: 'Error al actualizar la asignatura',
        details: error.message 
      });
    }
  },

  removeSubject: async (req, res) => {
    try {
      const { id } = req.params;

      const activeAssignments = await prisma.teacherAssignment.findMany({
        where: {
          subjectId: parseInt(id),
          isActive: true
        }
      });

      if (activeAssignments.length > 0) {
        return res.status(400).json({
          error: 'No se puede eliminar la asignatura porque tiene profesores asignados actualmente'
        });
      }

      await prisma.$transaction(async (prisma) => {
        await prisma.teacherAssignment.updateMany({
          where: {
            subjectId: parseInt(id),
            isActive: true
          },
          data: {
            isActive: false,
            endDate: new Date()
          }
        });

        await prisma.courseSubject.updateMany({
          where: { 
            subjectId: parseInt(id),
            isActive: true
          },
          data: {
            isActive: false
          }
        });

        await prisma.subject.update({
          where: { id: parseInt(id) },
          data: {
            isActive: false
          }
        });
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
  }
};

export default subjectController;