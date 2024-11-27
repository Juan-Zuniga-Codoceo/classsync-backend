/*
  Warnings:

  - You are about to drop the `general_config` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teacher_subjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "teacher_subjects" DROP CONSTRAINT "teacher_subjects_courseId_fkey";

-- DropForeignKey
ALTER TABLE "teacher_subjects" DROP CONSTRAINT "teacher_subjects_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "teacher_subjects" DROP CONSTRAINT "teacher_subjects_teacherId_fkey";

-- DropTable
DROP TABLE "general_config";

-- DropTable
DROP TABLE "teacher_subjects";

-- CreateTable
CREATE TABLE "course_subjects" (
    "id" SERIAL NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_assignments" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_subjects_courseId_subjectId_key" ON "course_subjects"("courseId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_assignments_teacherId_subjectId_courseId_isActive_key" ON "teacher_assignments"("teacherId", "subjectId", "courseId", "isActive");

-- AddForeignKey
ALTER TABLE "course_subjects" ADD CONSTRAINT "course_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_subjects" ADD CONSTRAINT "course_subjects_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
