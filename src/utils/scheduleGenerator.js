export class ScheduleGenerator {
  constructor(teachers, subjects, courses, config) {
    this.teachers = teachers;
    this.subjects = subjects;
    this.courses = courses;
    this.config = config;
    this.schedule = [];
    this.maxAttempts = 15;  // Aumentado de 10 a 15
    this.maxBlocksPerDay = this.calculateMaxBlocksPerDay();
    this.constraints = {
      maxConsecutiveBlocks: 4,  // Aumentado de 3 a 4
      maxDailyBlocks: 10,      // Aumentado de 8 a 10
      minDailyBlocks: 1
    };
    // Ajustar el peso de las penalizaciones
    this.penalties = {
      consecutiveBlocks: 5,     // Reducido de 10 a 5
      dailyLoad: 3,            // Reducido de 5 a 3
      preferredTime: 10        // Mantenido en 10
    };
  }


  calculateMaxBlocksPerDay() {
    try {
      const startTime = new Date(`2000-01-01T${this.config.startTime}`);
      const endTime = new Date(`2000-01-01T${this.config.endTime}`);
      const totalMinutes = (endTime - startTime) / (1000 * 60);
      const blocks = Math.floor(totalMinutes / (this.config.blockDuration + this.config.breakDuration));
      console.log('Bloques calculados por día:', {
        startTime: this.config.startTime,
        endTime: this.config.endTime,
        totalMinutes,
        blockDuration: this.config.blockDuration,
        breakDuration: this.config.breakDuration,
        blocks
      });
      return blocks;
    } catch (error) {
      console.error('Error calculando bloques por día:', error);
      throw new Error('Error al calcular bloques disponibles por día');
    }
  }

  calculateWeeklyBlocks(hoursPerWeek) {
    const minutesPerWeek = hoursPerWeek * 60;
    return Math.ceil(minutesPerWeek / this.config.blockDuration);
  }

  calculatePriority(teacher, subject, course) {
    let priority = 0;
    // Priorizar materias con más horas semanales
    priority += subject.hoursPerWeek * 2;
    // Priorizar cursos de primaria
    priority += course.level === 'primary' ? 3 : 2;
    // Priorizar profesores de tiempo completo
    priority += teacher.contractType === 'full-time' ? 2 : 1;
    return priority;
  }

  createAvailabilityMatrix() {
    return Array(5).fill().map(() => 
      Array(this.maxBlocksPerDay).fill().map(() => ({
        available: true,
        teacherId: null,
        courseId: null
      }))
    );
  }

  prepareAssignments() {
    try {
      const assignments = [];
      this.teachers.forEach(teacher => {
        teacher.assignments.forEach(assignment => {
          if (!assignment.subject || !assignment.course) {
            console.warn('Asignación incompleta:', assignment);
            return;
          }
          
          const weeklyBlocks = this.calculateWeeklyBlocks(assignment.subject.hoursPerWeek);
          assignments.push({
            teacherId: teacher.id,
            subjectId: assignment.subject.id,
            courseId: assignment.courseId,
            weeklyBlocks,
            priority: this.calculatePriority(teacher, assignment.subject, assignment.course),
            teacher,
            subject: assignment.subject,
            course: assignment.course
          });
        });
      });

      return assignments.sort((a, b) => {
        if (b.weeklyBlocks === a.weeklyBlocks) {
          return b.priority - a.priority;
        }
        return b.weeklyBlocks - a.weeklyBlocks;
      });
    } catch (error) {
      console.error('Error preparando asignaciones:', error);
      throw new Error('Error al preparar las asignaciones de profesores');
    }
  }

  isSlotAvailable(dayIndex, blockIndex, availability) {
    return availability[dayIndex]?.[blockIndex]?.available ?? false;
  }

  hasConflict(assignment, day, block, availability) {
    // Verificar disponibilidad básica
    if (!this.isSlotAvailable(day - 1, block - 1, availability)) {
      return true;
    }

    // Verificar límites de bloques por día
    const teacherBlocksToday = this.schedule.filter(b => 
      b.teacherId === assignment.teacherId && 
      b.dayOfWeek === day
    ).length;

    if (teacherBlocksToday >= this.constraints.maxDailyBlocks) {
      return true;
    }

    // Verificar bloques consecutivos
    const consecutiveBlocks = this.countConsecutiveBlocks(assignment.teacherId, day, block);
    if (consecutiveBlocks >= this.constraints.maxConsecutiveBlocks) {
      return true;
    }

    // Verificar conflictos de profesor o curso
    return this.schedule.some(b => 
      b.dayOfWeek === day && 
      b.blockNumber === block && 
      (b.teacherId === assignment.teacherId || b.courseId === assignment.courseId)
    );
  }

  countConsecutiveBlocks(teacherId, day, block) {
    let count = 1;
    
    // Contar bloques anteriores
    for (let b = block - 1; b > 0; b--) {
      if (!this.schedule.some(s => 
        s.teacherId === teacherId && 
        s.dayOfWeek === day && 
        s.blockNumber === b
      )) break;
      count++;
    }

    // Contar bloques siguientes
    for (let b = block + 1; b <= this.maxBlocksPerDay; b++) {
      if (!this.schedule.some(s => 
        s.teacherId === teacherId && 
        s.dayOfWeek === day && 
        s.blockNumber === b
      )) break;
      count++;
    }

    return count;
  }

  findBestTimeSlot(assignment, availability) {
    let bestSlot = null;
    let bestScore = -Infinity;

    for (let day = 1; day <= 5; day++) {
      for (let block = 1; block <= this.maxBlocksPerDay; block++) {
        if (this.isSlotAvailable(day - 1, block - 1, availability) &&
            !this.hasConflict(assignment, day, block, availability)) {
          const score = this.evaluateTimeSlot(assignment, day, block);
          if (score > bestScore) {
            bestScore = score;
            bestSlot = { day, block };
          }
        }
      }
    }

    return bestSlot;
  }

    // Ajustar la evaluación de slots
    evaluateTimeSlot(assignment, day, block) {
      let score = 100;
  
      const consecutiveBlocks = this.countConsecutiveBlocks(assignment.teacherId, day, block);
      score -= consecutiveBlocks * this.penalties.consecutiveBlocks;
  
      const dailyBlocks = this.schedule.filter(b => 
        b.teacherId === assignment.teacherId && 
        b.dayOfWeek === day
      ).length;
      score -= dailyBlocks * this.penalties.dailyLoad;
  
      // Ajustar preferencias de horario
      if (assignment.course.level === 'primary') {
        score += block <= 4 ? this.penalties.preferredTime : 0;
      } else {
        score += (block >= 2 && block <= 6) ? this.penalties.preferredTime : 0;
      }
  
      return score;
    }

  evaluateSchedule() {
    let score = 100;

    // Evaluar distribución de bloques por profesor
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

  generate() {
    try {
      console.log('Iniciando generación de horario...');
      let bestSchedule = null;
      let bestScore = -1;

      for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
        try {
          this.debugInfo.totalAttempts++;
          console.log(`\nIntento ${attempt + 1} de ${this.maxAttempts}`);
          
          this.schedule = [];
          const assignments = this.prepareAssignments();
          const availability = this.createAvailabilityMatrix();

          console.log(`Procesando ${assignments.length} asignaciones...`);

          let allAssignmentsPlaced = true;
          for (const assignment of assignments) {
            const blocksNeeded = assignment.weeklyBlocks;
            let blocksAssigned = 0;

            console.log(`\nAsignando ${blocksNeeded} bloques para ${assignment.subject.name} (${assignment.course.name})`);

            while (blocksAssigned < blocksNeeded) {
              const slot = this.findBestTimeSlot(assignment, availability);
              if (!slot) {
                console.warn(`No se encontró slot para ${assignment.subject.name} después de ${blocksAssigned}/${blocksNeeded} bloques`);
                allAssignmentsPlaced = false;
                this.debugInfo.errors.push({
                  attempt,
                  subject: assignment.subject.name,
                  course: assignment.course.name,
                  blocksNeeded,
                  blocksAssigned
                });
                break;
              }

              this.schedule.push({
                teacherId: assignment.teacherId,
                subjectId: assignment.subjectId,
                courseId: assignment.courseId,
                dayOfWeek: slot.day,
                blockNumber: slot.block,
                teacher: assignment.teacher,
                subject: assignment.subject,
                course: assignment.course
              });

              availability[slot.day - 1][slot.block - 1] = {
                available: false,
                teacherId: assignment.teacherId,
                courseId: assignment.courseId
              };

              blocksAssigned++;
              console.log(`Bloque asignado: Día ${slot.day}, Bloque ${slot.block} (${blocksAssigned}/${blocksNeeded})`);
            }

            if (!allAssignmentsPlaced) break;
          }

          if (allAssignmentsPlaced) {
            this.debugInfo.successfulAttempts++;
            const score = this.evaluateSchedule();
            console.log(`Horario completo generado con puntuación: ${score}`);
            
            if (score > bestScore) {
              bestScore = score;
              bestSchedule = [...this.schedule];
              this.debugInfo.bestAttemptScore = score;
            }
          } else {
            this.debugInfo.failedAttempts++;
          }
        } catch (error) {
          console.warn(`Error en intento ${attempt + 1}:`, error.message);
          this.debugInfo.failedAttempts++;
          this.debugInfo.errors.push({
            attempt,
            error: error.message
          });
        }
      }

      console.log('\nResumen de generación:', this.debugInfo);

      if (!bestSchedule) {
        throw new Error(JSON.stringify({
          error: 'No se pudo generar un horario válido',
          debugInfo: this.debugInfo
        }));
      }

      return bestSchedule;
    } catch (error) {
      console.error('Error en generación:', error);
      throw error;
    }
  }
}