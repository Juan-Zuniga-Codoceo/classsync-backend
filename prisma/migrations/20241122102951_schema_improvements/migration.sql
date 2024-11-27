/*
  Warnings:

  - A unique constraint covering the columns `[name,level]` on the table `courses` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "course_subjects" DROP CONSTRAINT "course_subjects_courseId_fkey";

-- DropForeignKey
ALTER TABLE "course_subjects" DROP CONSTRAINT "course_subjects_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_courseId_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "teacher_assignments" DROP CONSTRAINT "teacher_assignments_courseId_fkey";

-- DropForeignKey
ALTER TABLE "teacher_assignments" DROP CONSTRAINT "teacher_assignments_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "teacher_assignments" DROP CONSTRAINT "teacher_assignments_teacherId_fkey";

-- AlterTable
ALTER TABLE "course_subjects" ADD COLUMN     "hoursPerWeek" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "schedule_config" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "course_subjects_subjectId_idx" ON "course_subjects"("subjectId");

-- CreateIndex
CREATE INDEX "course_subjects_courseId_idx" ON "course_subjects"("courseId");

-- CreateIndex
CREATE INDEX "courses_level_idx" ON "courses"("level");

-- CreateIndex
CREATE UNIQUE INDEX "courses_name_level_key" ON "courses"("name", "level");

-- CreateIndex
CREATE INDEX "schedules_teacherId_idx" ON "schedules"("teacherId");

-- CreateIndex
CREATE INDEX "schedules_courseId_idx" ON "schedules"("courseId");

-- CreateIndex
CREATE INDEX "subjects_name_idx" ON "subjects"("name");

-- CreateIndex
CREATE INDEX "teacher_assignments_teacherId_idx" ON "teacher_assignments"("teacherId");

-- CreateIndex
CREATE INDEX "teacher_assignments_subjectId_idx" ON "teacher_assignments"("subjectId");

-- CreateIndex
CREATE INDEX "teacher_assignments_courseId_idx" ON "teacher_assignments"("courseId");

-- CreateIndex
CREATE INDEX "teachers_lastName_firstName_idx" ON "teachers"("lastName", "firstName");

-- AddForeignKey
ALTER TABLE "course_subjects" ADD CONSTRAINT "course_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_subjects" ADD CONSTRAINT "course_subjects_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
