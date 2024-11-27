// models/Teacher.js
import prisma from '../config/db.js';

export const Teacher = {
  findAll: async () => {
    return await prisma.teacher.findMany({
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
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });
  },

  findById: async (id) => {
    return await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
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
  },

  create: async (data) => {
    const { firstName, lastName, email, phone, contractType, totalHours, subjects } = data;
    
    return await prisma.$transaction(async (prisma) => {
      // 1. Crear el profesor
      const teacher = await prisma.teacher.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone?.trim(),
          contractType,
          totalHours: parseInt(totalHours)
        }
      });

      // 2. Crear asignaciones si existen
      if (Array.isArray(subjects) && subjects.length > 0) {
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
  },

  update: async (id, data) => {
    const { firstName, lastName, email, phone, contractType, totalHours, subjects } = data;

    return await prisma.$transaction(async (prisma) => {
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

      // 2. Actualizar datos básicos del profesor
      const teacher = await prisma.teacher.update({
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
            teacherId: teacher.id,
            subjectId: parseInt(subject.subjectId),
            courseId: parseInt(subject.courseId),
            isActive: true,
            startDate: new Date()
          }))
        });
      }

      // 4. Retornar el profesor actualizado con sus asignaciones
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
  },

  delete: async (id) => {
    return await prisma.$transaction(async (prisma) => {
      // 1. Desactivar todas las asignaciones
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

      // 2. Eliminar el profesor
      return await prisma.teacher.delete({
        where: { id: parseInt(id) }
      });
    });
  }
};

// controllers/teacherController.js
import { Teacher } from '../models/Teacher.js';

export const teacherController = {
  getAll: async (req, res) => {
    try {
      const teachers = await Teacher.findAll();
      res.json(teachers);
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
      const teacher = await Teacher.findById(id);
      
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

  create: async (req, res) => {
    try {
      const teacher = await Teacher.create(req.body);
      res.status(201).json(teacher);
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
      const teacher = await Teacher.update(id, req.body);
      res.json(teacher);
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
      await Teacher.delete(id);
      res.json({ message: 'Profesor eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      res.status(500).json({
        error: 'Error al eliminar el profesor',
        details: error.message
      });
    }
  }
};