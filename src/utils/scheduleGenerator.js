// backend/src/utils/scheduleGenerator.js

export class ScheduleGenerator {
  constructor(teachers, subjects, courses, config) {
    this.teachers = teachers;
    this.subjects = subjects;
    this.courses = courses;
    this.config = config;
    this.schedule = [];
    this.maxAttempts = 5;
    this.maxBlocksPerDay = this.calculateMaxBlocksPerDay();
    this.constraints = {
      maxConsecutiveBlocks: 2,
      maxDailyBlocks: 6,
      minDailyBlocks: 1
    };
    this.flexibleAssignments = new Map();
  }

  validateCourseAssignments() {
    // Crear un mapa de asignaturas por curso
    const courseAssignments = new Map();
    
    // Inicializar el mapa para todos los cursos
    this.courses.forEach(course => {
      courseAssignments.set(course.id, new Set());
    });

    // Registrar todas las asignaciones existentes
    this.teachers.forEach(teacher => {
      teacher.subjects.forEach(assignment => {
        if (assignment.courseId) {
          courseAssignments.get(assignment.courseId).add(assignment.subjectId);
        }
      });
    });

    // Verificar que cada curso tenga todas las asignaturas
    const incompleteCourses = [];
    this.courses.forEach(course => {
      const assignedSubjects = courseAssignments.get(course.id);
      const missingSubjects = this.subjects.filter(subject => 
        !assignedSubjects.has(subject.id)
      );

      if (missingSubjects.length > 0) {
        incompleteCourses.push({
          course,
          missingSubjects
        });
      }
    });

    if (incompleteCourses.length > 0) {
      const details = incompleteCourses.map(item => ({
        courseName: item.course.name,
        missingSubjects: item.missingSubjects.map(s => s.name)
      }));
      
      throw new Error(JSON.stringify({
        error: 'Asignaciones incompletas',
        details,
        message: `Los siguientes cursos no tienen todas las asignaturas asignadas: ${incompleteCourses.map(c => c.course.name).join(', ')}`
      }));
    }

    return true;
  }

  generate() {
    let bestSchedule = null;
    let bestScore = -1;

    // Validar asignaciones antes de generar
    this.validateCourseAssignments();

    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      try {
        this.schedule = [];
        const assignments = this.prepareAssignments();
        const availability = this.createAvailabilityMatrix();

        for (const assignment of assignments) {
          const blocksNeeded = this.calculateWeeklyBlocks(assignment.subject.hoursPerWeek);
          let blocksAssigned = 0;

          while (blocksAssigned < blocksNeeded) {
            const slot = this.findBestTimeSlot(assignment, availability);
            if (!slot) {
              throw new Error(`No se encontró slot disponible para ${assignment.subject.name}`);
            }

            this.schedule.push({
              teacherId: assignment.teacherId,
              subjectId: assignment.subjectId,
              courseId: assignment.courseId,
              dayOfWeek: slot.day,
              blockNumber: slot.block
            });

            availability[slot.day - 1][slot.block - 1] = {
              available: false,
              teacherId: assignment.teacherId,
              courseId: assignment.courseId
            };

            blocksAssigned++;
          }
        }

        const score = this.evaluateSchedule();
        if (score > bestScore) {
          bestScore = score;
          bestSchedule = [...this.schedule];
        }
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} failed:`, error.message);
        continue;
      }
    }

    if (!bestSchedule) {
      throw new Error('No se pudo generar un horario válido');
    }

    return bestSchedule;
  }

  calculateMaxBlocksPerDay() {
    const startTime = new Date(`2000-01-01 ${this.config.startTime}`);
    const endTime = new Date(`2000-01-01 ${this.config.endTime}`);
    const totalMinutes = (endTime - startTime) / (1000 * 60);
    return Math.floor(totalMinutes / (this.config.blockDuration + this.config.breakDuration));
  }

  prepareAssignments() {
    // 1. Procesar asignaciones específicas
    const specificAssignments = this.teachers.flatMap(teacher => 
      teacher.subjects
        .filter(assignment => !assignment.isFlexible && assignment.courseId)
        .map(assignment => ({
          teacherId: teacher.id,
          subjectId: assignment.subjectId,
          courseId: assignment.courseId,
          weeklyBlocks: this.calculateWeeklyBlocks(assignment.subject.hoursPerWeek),
          priority: this.calculatePriority(teacher, assignment.subject, assignment.course),
          teacher,
          subject: assignment.subject,
          course: assignment.course
        }))
    );

    // 2. Procesar asignaciones flexibles
    const flexibleTeachers = this.teachers.flatMap(teacher =>
      teacher.subjects
        .filter(assignment => assignment.isFlexible)
        .map(assignment => ({
          teacherId: teacher.id,
          subjectId: assignment.subjectId,
          level: assignment.level,
          teacher,
          subject: assignment.subject
        }))
    );

    // 3. Asignar profesores flexibles a cursos que los necesiten
    const coursesNeedingTeachers = this.courses.filter(course => {
      const hasAllSubjects = this.subjects.every(subject =>
        specificAssignments.some(assignment =>
          assignment.courseId === course.id && assignment.subjectId === subject.id
        )
      );
      return !hasAllSubjects;
    });

    const flexibleAssignments = [];
    coursesNeedingTeachers.forEach(course => {
      const neededSubjects = this.subjects.filter(subject =>
        !specificAssignments.some(assignment =>
          assignment.courseId === course.id && assignment.subjectId === subject.id
        )
      );

      neededSubjects.forEach(subject => {
        const availableTeacher = flexibleTeachers.find(teacher =>
          teacher.subjectId === subject.id &&
          teacher.level === course.level &&
          !this.flexibleAssignments.has(`${teacher.teacherId}-${subject.id}-${course.id}`)
        );

        if (availableTeacher) {
          flexibleAssignments.push({
            teacherId: availableTeacher.teacherId,
            subjectId: subject.id,
            courseId: course.id,
            weeklyBlocks: this.calculateWeeklyBlocks(subject.hoursPerWeek),
            priority: this.calculatePriority(availableTeacher.teacher, subject, course),
            teacher: availableTeacher.teacher,
            subject,
            course
          });

          this.flexibleAssignments.set(
            `${availableTeacher.teacherId}-${subject.id}-${course.id}`,
            true
          );
        }
      });
    });

    // Combinar y ordenar todas las asignaciones por prioridad
    return [...specificAssignments, ...flexibleAssignments]
      .sort((a, b) => b.priority - a.priority);
  }

  calculateWeeklyBlocks(hoursPerWeek) {
    return Math.ceil(hoursPerWeek * 60 / this.config.blockDuration);
  }

  calculatePriority(teacher, subject, course) {
    let priority = 0;
    priority += subject.hoursPerWeek * 2;
    priority += course.level === 'basic' ? 3 : 2;
    priority += teacher.contractType === 'full-time' ? 2 : 1;
    return priority;
  }

  generate() {
    let bestSchedule = null;
    let bestScore = -1;

    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      try {
        this.schedule = [];
        const assignments = this.prepareAssignments();
        const availability = this.createAvailabilityMatrix();

        for (const assignment of assignments) {
          const blocksNeeded = assignment.weeklyBlocks;
          let blocksAssigned = 0;

          while (blocksAssigned < blocksNeeded) {
            const slot = this.findBestTimeSlot(assignment, availability);
            if (!slot) {
              throw new Error(`No se encontró slot disponible para ${assignment.subject.name}`);
            }

            this.schedule.push({
              teacherId: assignment.teacherId,
              subjectId: assignment.subjectId,
              courseId: assignment.courseId,
              dayOfWeek: slot.day,
              blockNumber: slot.block
            });

            availability[slot.day - 1][slot.block - 1] = {
              available: false,
              teacherId: assignment.teacherId,
              courseId: assignment.courseId
            };

            blocksAssigned++;
          }
        }

        const score = this.evaluateSchedule();
        if (score > bestScore) {
          bestScore = score;
          bestSchedule = [...this.schedule];
        }
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} failed:`, error.message);
        continue;
      }
    }

    if (!bestSchedule) {
      throw new Error('No se pudo generar un horario válido');
    }

    return bestSchedule;
  }

  createAvailabilityMatrix() {
    const matrix = [];
    for (let day = 0; day < 5; day++) {
      matrix[day] = [];
      for (let block = 0; block < this.maxBlocksPerDay; block++) {
        matrix[day][block] = {
          available: true,
          teacherId: null,
          courseId: null
        };
      }
    }
    return matrix;
  }

  findBestTimeSlot(assignment, availability) {
    let bestSlot = null;
    let bestScore = -Infinity;

    for (let day = 1; day <= 5; day++) {
      for (let block = 1; block <= this.maxBlocksPerDay; block++) {
        if (this.isSlotAvailable(day - 1, block - 1, availability) &&
            !this.hasConflict(assignment, day, block, availability)) {
          const score = this.evaluateTimeSlot(assignment, day, block, availability);
          if (score > bestScore) {
            bestScore = score;
            bestSlot = { day, block };
          }
        }
      }
    }

    return bestSlot;
  }

  isSlotAvailable(dayIndex, blockIndex, availability) {
    return availability[dayIndex] &&
           availability[dayIndex][blockIndex] &&
           availability[dayIndex][blockIndex].available;
  }

  hasConflict(assignment, day, block, availability) {
    // Verificar disponibilidad básica
    if (!this.isSlotAvailable(day - 1, block - 1, availability)) {
      return true;
    }

    // Verificar conflictos de profesor
    const teacherBlocks = this.schedule.filter(b => 
      b.teacherId === assignment.teacherId && 
      b.dayOfWeek === day
    );

    if (teacherBlocks.length >= this.constraints.maxDailyBlocks) {
      return true;
    }

    // Verificar bloques consecutivos
    const consecutiveBlocks = this.countConsecutiveBlocks(assignment.teacherId, day, block);
    if (consecutiveBlocks >= this.constraints.maxConsecutiveBlocks) {
      return true;
    }

    // Verificar conflictos de curso
    return this.schedule.some(b => 
      b.dayOfWeek === day && 
      b.blockNumber === block && 
      (b.teacherId === assignment.teacherId || b.courseId === assignment.courseId)
    );
  }

  countConsecutiveBlocks(teacherId, day, block) {
    let count = 1;
    let currentBlock = block - 1;

    // Contar bloques anteriores
    while (currentBlock > 0) {
      const hasBlock = this.schedule.some(b => 
        b.teacherId === teacherId && 
        b.dayOfWeek === day && 
        b.blockNumber === currentBlock
      );
      if (!hasBlock) break;
      count++;
      currentBlock--;
    }

    currentBlock = block + 1;
    // Contar bloques siguientes
    while (currentBlock <= this.maxBlocksPerDay) {
      const hasBlock = this.schedule.some(b => 
        b.teacherId === teacherId && 
        b.dayOfWeek === day && 
        b.blockNumber === currentBlock
      );
      if (!hasBlock) break;
      count++;
      currentBlock++;
    }

    return count;
  }

  evaluateTimeSlot(assignment, day, block, availability) {
    let score = 100;

    // Penalizar bloques consecutivos
    const consecutiveBlocks = this.countConsecutiveBlocks(assignment.teacherId, day, block);
    score -= consecutiveBlocks * 10;

    // Penalizar carga diaria
    const dailyBlocks = this.schedule.filter(b => 
      b.teacherId === assignment.teacherId && 
      b.dayOfWeek === day
    ).length;
    score -= dailyBlocks * 5;

    // Bonus por horario preferido según nivel
    if (assignment.course.level === 'primary') {
      score += block <= 3 ? 20 : 0;
    } else {
      score += (block >= 2 && block <= 5) ? 20 : 0;
    }

    return score;
  }

  evaluateSchedule() {
    let score = 100;

    // Evaluar distribución de bloques
    const teacherDistributions = new Map();
    this.schedule.forEach(block => {
      if (!teacherDistributions.has(block.teacherId)) {
        teacherDistributions.set(block.teacherId, Array(5).fill(0));
      }
      const distribution = teacherDistributions.get(block.teacherId);
      distribution[block.dayOfWeek - 1]++;
    });

    // Penalizar distribuciones desiguales
    teacherDistributions.forEach(distribution => {
      const variance = this.calculateVariance(distribution);
      score -= variance * 5;
    });

    return Math.max(0, score);
  }

  calculateVariance(array) {
    const mean = array.reduce((a, b) => a + b, 0) / array.length;
    return array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / array.length;
  }

  validateSchedule() {
    const validation = super.validateSchedule();
    if (!validation.valid) return validation;

    // Validación adicional para asignaciones flexibles
    const flexibleAssignmentsValid = Array.from(this.flexibleAssignments.keys()).every(key => {
      const [teacherId, subjectId, courseId] = key.split('-').map(Number);
      const assignedBlocks = this.schedule.filter(block =>
        block.teacherId === teacherId &&
        block.subjectId === subjectId &&
        block.courseId === courseId
      ).length;

      const subject = this.subjects.find(s => s.id === subjectId);
      const requiredBlocks = this.calculateWeeklyBlocks(subject.hoursPerWeek);

      return assignedBlocks === requiredBlocks;
    });

    if (!flexibleAssignmentsValid) {
      return {
        valid: false,
        error: 'Las asignaciones flexibles no cumplen con las horas requeridas'
      };
    }

    return { valid: true };
  }
}