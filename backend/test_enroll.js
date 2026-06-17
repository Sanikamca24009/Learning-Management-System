const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { enrollments: { include: { course: true } } } });
  for (const u of users) {
    if (u.enrollments.length > 0) {
      console.log(`User ${u.email} enrolled in:`);
      u.enrollments.forEach(e => console.log(`  - ${e.course.title} (Category: ${e.course.category})`));
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
