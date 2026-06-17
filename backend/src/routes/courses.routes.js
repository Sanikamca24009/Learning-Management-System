const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  deleteLesson,
  getInstructorStats,
  getMyCourses,
  rateLesson
} = require('../controllers/courses.controller');

const { protect, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { courseSchema, lessonSchema } = require('../validations/course.validation');
const { cacheMiddleware } = require('../middlewares/cache.middleware');

const router = express.Router();

router.route('/')
  .get(cacheMiddleware(300), getCourses)
  .post(protect, authorize('instructor', 'admin'), validate(courseSchema), createCourse);

router.route('/instructor/stats')
  .get(protect, authorize('instructor', 'admin'), getInstructorStats);

router.route('/instructor/mine')
  .get(protect, authorize('instructor', 'admin'), getMyCourses);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('instructor', 'admin'), updateCourse)
  .delete(protect, authorize('instructor', 'admin'), deleteCourse);

router.route('/:courseId/lessons')
  .post(protect, authorize('instructor', 'admin'), validate(lessonSchema), addLesson);

router.route('/:courseId/lessons/:lessonId')
  .delete(protect, authorize('instructor', 'admin'), deleteLesson);

router.route('/:courseId/lessons/:lessonId/rate')
  .post(protect, authorize('user', 'intern'), rateLesson);

module.exports = router;
