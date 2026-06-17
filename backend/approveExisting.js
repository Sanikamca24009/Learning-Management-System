const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: "postgresql://postgres:12345678@localhost:8000/lms?schema=public" });
const prisma = new PrismaClient({ adapter });

async function approveExisting() {
  try {
    await prisma.user.updateMany({
      data: { status: 'approved' }
    });
    await prisma.course.updateMany({
      data: { status: 'approved' }
    });
    console.log('All existing users and courses marked as approved.');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

approveExisting();
