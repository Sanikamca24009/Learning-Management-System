const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = 'postgresql://postgres:12345678@localhost:8000/lms';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // Find the student
    const student = await prisma.user.findUnique({
      where: { email: 'student@gmail.com' }
    });

    if (!student) {
      console.log('Student not found!');
      return;
    }

    // Find an instructor or admin to own the course
    const instructor = await prisma.user.findFirst({
      where: { OR: [{ role: 'instructor' }, { role: 'admin' }] }
    });

    if (!instructor) {
      console.log('No instructor found!');
      return;
    }

    // Create Course
    const course = await prisma.course.create({
      data: {
        title: 'AI and Machine Learning Masterclass',
        description: 'Learn the fundamentals of Artificial Intelligence, Machine Learning, and Neural Networks from industry experts.',
        category: 'Data Science',
        level: 'Advanced',
        price: 99.99,
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
        celebrityTeacher: 'Salman Khan',
        instructorId: instructor.id,
        status: 'approved'
      }
    });

    console.log('Created Course:', course.title);

    // Create Lesson
    const lesson = await prisma.lesson.create({
      data: {
        title: 'Introduction to Artificial Intelligence',
        content: 'This lesson covers the basics of AI, including history, definitions, and real-world applications.',
        videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk', // Dummy AI video
        order: 1,
        courseId: course.id
      }
    });

    console.log('Created Lesson:', lesson.title);

    // Create Enrollment completed for student
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        progress: 100,
        status: 'completed',
        certificateStatus: 'none',
        completedLessons: {
          connect: [{ id: lesson.id }]
        }
      }
    });

    console.log('Created Completed Enrollment for student:', student.email);
    console.log('Ready for Certification!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
