const express = require('express');
const {
  enrollInCourse,
  getMyEnrollments,
  completeLesson,
  unenroll,
  requestCertificate
} = require('../controllers/enrollment.controller');

const { protect } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { enrollSchema, completeLessonSchema } = require('../validations/enrollment.validation');

const router = express.Router();

router.use(protect); // All enrollment routes require authentication

router.route('/')
  .get(getMyEnrollments);

router.route('/:courseId')
  .post(validate(enrollSchema), enrollInCourse)
  .delete(unenroll);

router.route('/:courseId/lessons/:lessonId')
  .put(validate(completeLessonSchema), completeLesson);

router.route('/:courseId/request-certificate')
  .post(requestCertificate);

module.exports = router;
