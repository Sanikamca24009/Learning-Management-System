const { prisma } = require('./src/config/db');

async function main() {
  const courses = await prisma.course.findMany();
  courses.forEach(c => {
    console.log(`- ${c.title} (Category: ${c.category})`);
  });
}

main().catch(console.error).finally(() => process.exit(0));
