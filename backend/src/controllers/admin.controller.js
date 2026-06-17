const { prisma } = require('../config/db');
const { getReportQueue } = require('../workers');
const { clearCache } = require('../config/redis');

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStudents = await prisma.user.count({ where: { role: { in: ['user', 'intern'] } } });
    const totalInstructors = await prisma.user.count({ where: { role: 'instructor' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'admin' } });
    const totalCourses = await prisma.course.count();
    const totalEnrollments = await prisma.enrollment.count();
    const activeEnrollments = await prisma.enrollment.count({ where: { status: 'active' } });
    const pendingUsers = await prisma.user.count({ where: { status: 'pending' } });
    const pendingCourses = await prisma.course.count({ where: { status: 'pending' } });

    // Calculate revenue
    const allEnrollments = await prisma.enrollment.findMany({
      include: { course: { select: { price: true } } }
    });
    const totalRevenue = allEnrollments.reduce((sum, enr) => sum + (enr.course?.price || 0), 0);

    // Get recent 5 users for activity feed
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalCourses,
        totalEnrollments,
        activeEnrollments,
        totalRevenue,
        pendingUsers,
        pendingCourses,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAdminUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, role, status } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
        select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
      }),
      prisma.user.count({ where })
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status/role (admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status, role } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteAdminUser = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses (admin, including non-approved)
// @route   GET /api/admin/courses
// @access  Private/Admin
exports.getAdminCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status, category, level } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (level) where.level = level;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          _count: { select: { enrollments: true } }
        }
      }),
      prisma.course.count({ where })
    ]);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course status (admin approve/reject)
// @route   PUT /api/admin/courses/:id
// @access  Private/Admin
exports.updateCourseStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: { status },
      include: { instructor: { select: { id: true, name: true } } }
    });
    
    // Clear courses cache so newly approved courses appear immediately
    await clearCache('/api/courses');

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course (admin)
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
exports.deleteAdminCourse = async (req, res, next) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    
    // Clear courses cache
    await clearCache('/api/courses');

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger report generation (admin)
// @route   POST /api/admin/reports/generate
// @access  Private/Admin
exports.generateAdminReport = async (req, res, next) => {
  try {
    const { reportType } = req.body;
    if (!reportType) {
      return res.status(400).json({ success: false, error: 'Please specify reportType' });
    }

    const reportQueue = getReportQueue();
    if (reportQueue) {
      const job = await reportQueue.add('generateReport', {
        reportType,
        userId: req.user.id
      });

      return res.status(202).json({
        success: true,
        message: 'Report generation task has been queued.',
        jobId: job.id
      });
    }

    res.status(500).json({ success: false, error: 'Report queue is unavailable' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrollments filtered by certificateStatus (for admin)
// @route   GET /api/admin/certificates?status=requested|approved
// @access  Private/Admin
exports.getCertificates = async (req, res, next) => {
  try {
    const { search, status: certStatusFilter = 'requested' } = req.query;

    const where = { certificateStatus: certStatusFilter };

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { course: { title: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const certificates = await prisma.enrollment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true,
            thumbnail: true,
            instructor: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json({ success: true, count: certificates.length, data: certificates });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke a certificate (reset certificateStatus to none)
// @route   PUT /api/admin/certificates/:enrollmentId/revoke
// @access  Private/Admin
exports.revokeCertificate = async (req, res, next) => {
  try {
    const enrollment = await prisma.enrollment.update({
      where: { id: req.params.enrollmentId },
      data: { certificateStatus: 'none' }
    });
    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a certificate request
// @route   PUT /api/admin/certificates/:enrollmentId/approve
// @access  Private/Admin
exports.approveCertificate = async (req, res, next) => {
  try {
    const enrollment = await prisma.enrollment.update({
      where: { id: req.params.enrollmentId },
      data: { certificateStatus: 'approved' }
    });
    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a certificate request
// @route   PUT /api/admin/certificates/:enrollmentId/reject
// @access  Private/Admin
exports.rejectCertificate = async (req, res, next) => {
  try {
    const enrollment = await prisma.enrollment.update({
      where: { id: req.params.enrollmentId },
      data: { certificateStatus: 'rejected' }
    });
    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a certificate (delete the enrollment record entirely)
// @route   DELETE /api/admin/certificates/:enrollmentId
// @access  Private/Admin
exports.deleteCertificate = async (req, res, next) => {
  try {
    await prisma.enrollment.delete({ where: { id: req.params.enrollmentId } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
