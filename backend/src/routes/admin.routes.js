const express = require('express');
const {
  getDashboardStats,
  getAdminUsers,
  updateUserStatus,
  deleteAdminUser,
  getAdminCourses,
  updateCourseStatus,
  deleteAdminCourse,
  generateAdminReport,
  getCertificates,
  revokeCertificate,
  deleteCertificate,
  approveCertificate,
  rejectCertificate
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // All admin routes are admin only

// Stats
router.route('/stats').get(getDashboardStats);

// User management
router.route('/users').get(getAdminUsers);
router.route('/users/:id').put(updateUserStatus).delete(deleteAdminUser);

// Course management
router.route('/courses').get(getAdminCourses);
router.route('/courses/:id').put(updateCourseStatus).delete(deleteAdminCourse);

// Reports
router.route('/reports/generate').post(generateAdminReport);

// Certificates
router.route('/certificates').get(getCertificates);
router.route('/certificates/:enrollmentId/revoke').put(revokeCertificate);
router.route('/certificates/:enrollmentId/approve').put(approveCertificate);
router.route('/certificates/:enrollmentId/reject').put(rejectCertificate);
router.route('/certificates/:enrollmentId').delete(deleteCertificate);

module.exports = router;
