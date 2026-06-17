const { z } = require('zod');

const enrollSchema = z.object({
  params: z.object({
    courseId: z.string({ required_error: 'Course ID is required' }).min(1, 'Course ID cannot be empty')
  }),
  body: z.object({
    mentor: z.string().optional()
  })
});

const completeLessonSchema = z.object({
  params: z.object({
    courseId: z.string({ required_error: 'Course ID is required' }).min(1, 'Course ID cannot be empty'),
    lessonId: z.string({ required_error: 'Lesson ID is required' }).min(1, 'Lesson ID cannot be empty')
  })
});

module.exports = { enrollSchema, completeLessonSchema };
