/**
 * addDummyLesson.js
 * Finds the Python course, adds a dummy video lesson, and marks it as completed
 * for the first enrolled user (or a specific user email if provided).
 *
 * Usage:
 *   node addDummyLesson.js [user-email]
 *
 * Example:
 *   node addDummyLesson.js sanu@example.com
 */

require('dotenv').config({ path: ['.env.local', '.env'] });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const targetEmail = process.argv[2] || null;

  // 1. Find the Python course (approved)
  const pythonCourse = await prisma.course.findFirst({
    where: {
      title: { contains: 'Python', mode: 'insensitive' },
      status: 'approved',
    },
    include: { lessons: true },
  });

  if (!pythonCourse) {
    console.error('❌ No approved Python course found in the database.');
    process.exit(1);
  }
  console.log(`✅ Found course: "${pythonCourse.title}" (id: ${pythonCourse.id})`);

  // 2. Add a dummy video lesson
  const nextOrder = pythonCourse.lessons.length + 1;
  const lesson = await prisma.lesson.create({
    data: {
      title: 'Introduction to Python — Dummy Demo Video',
      content: 'This is a placeholder lesson with a sample YouTube video demonstrating Python basics.',
      videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', // Python for Beginners – Full Course
      order: nextOrder,
      courseId: pythonCourse.id,
    },
  });
  console.log(`✅ Created lesson: "${lesson.title}" (id: ${lesson.id})`);

  // 3. Find a user to mark the lesson as completed
  let user = null;
  if (targetEmail) {
    user = await prisma.user.findUnique({ where: { email: targetEmail } });
    if (!user) {
      console.error(`❌ No user found with email: ${targetEmail}`);
      process.exit(1);
    }
  } else {
    // Find the first user enrolled in this course
    const enrollment = await prisma.enrollment.findFirst({
      where: { courseId: pythonCourse.id },
      include: { user: true },
    });
    if (enrollment) user = enrollment.user;
  }

  if (!user) {
    console.log('⚠️  No enrolled user found. Lesson created but not marked as completed.');
    console.log('    Enroll a user first, then re-run this script with their email.');
    process.exit(0);
  }
  console.log(`✅ Found user: "${user.name}" (${user.email})`);

  // 4. Ensure the user is enrolled in the course
  let enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: pythonCourse.id } },
    include: { completedLessons: true },
  });

  if (!enrollment) {
    enrollment = await prisma.enrollment.create({
      data: { userId: user.id, courseId: pythonCourse.id },
      include: { completedLessons: true },
    });
    console.log(`✅ Enrolled "${user.name}" in "${pythonCourse.title}"`);
  } else {
    console.log(`✅ User is already enrolled.`);
  }

  // 5. Mark the lesson as completed
  const alreadyDone = enrollment.completedLessons.some((l) => l.id === lesson.id);
  if (alreadyDone) {
    console.log('ℹ️  Lesson is already marked as completed.');
  } else {
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { completedLessons: { connect: { id: lesson.id } } },
    });
    console.log(`✅ Marked lesson as completed for "${user.name}".`);
  }

  // 6. Recalculate progress
  const totalLessons = await prisma.lesson.count({ where: { courseId: pythonCourse.id } });
  const completedCount = (enrollment.completedLessons?.length || 0) + (alreadyDone ? 0 : 1);
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const status = progress === 100 ? 'completed' : 'active';

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { progress, status },
  });
  console.log(`✅ Progress updated: ${progress}% (${completedCount}/${totalLessons} lessons)`);
  console.log('\n🎉 Done! Check the dashboard or course player to see the completed lesson.');
}

main()
  .catch((e) => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
