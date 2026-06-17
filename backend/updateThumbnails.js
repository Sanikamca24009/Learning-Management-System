const { prisma } = require('./src/config/db');

const courseImages = {
  "mernstack": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80", // React logo / frontend
  "css": "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80", // HTML/CSS code
  "data science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80", // Data dashboard
  "ai & machine learning": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80", // AI tech style
  "python": "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=800&q=80" // Generic python/code
};

async function main() {
  const courses = await prisma.course.findMany();
  for (const course of courses) {
    const title = course.title.toLowerCase().trim();
    const newThumbnail = courseImages[title];
    if (newThumbnail) {
      console.log(`Updating ${course.title} to use thumbnail: ${newThumbnail}`);
      await prisma.course.update({
        where: { id: course.id },
        data: { thumbnail: newThumbnail }
      });
    } else {
      console.log(`No specific thumbnail mapped for ${course.title}.`);
    }
  }
  console.log("All courses updated.");
}

main().catch(console.error).finally(() => process.exit(0));
