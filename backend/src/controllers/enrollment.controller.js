const { prisma } = require('../config/db');

// @desc    Enroll in a course
// @route   POST /api/enrollments/:courseId
// @access  Private
exports.enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { mentor } = req.body;
    const userId = req.user.id;

    // Check if course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, error: 'Already enrolled in this course' });
    }

    // Prevent instructor from enrolling in their own course
    if (course.instructorId === userId) {
      return res.status(400).json({ success: false, error: 'Instructor cannot enroll in their own course' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        mentor
      }
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's enrolled courses
// @route   GET /api/enrollments
// @access  Private
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = { userId: req.user.id };

    if (status) where.status = status;

    if (search) {
      where.course = {
        title: { contains: search, mode: 'insensitive' }
      };
    }

    const orderBy = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          course: {
            include: {
              instructor: { select: { name: true } },
              _count: { select: { lessons: true } }
            }
          },
          completedLessons: { select: { id: true } }
        },
        skip,
        take: limitNumber,
        orderBy
      }),
      prisma.enrollment.count({ where })
    ]);

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
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

// @desc    Mark lesson as completed
// @route   PUT /api/enrollments/:courseId/lessons/:lessonId
// @access  Private
exports.completeLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      },
      include: {
        completedLessons: true
      }
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }

    // Connect lesson to completed lessons
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        completedLessons: {
          connect: { id: lessonId }
        }
      },
      include: {
        completedLessons: true
      }
    });

    // Recalculate progress percentage
    const totalLessons = await prisma.lesson.count({
      where: { courseId }
    });

    const completedCount = updatedEnrollment.completedLessons.length;
    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const status = progress === 100 ? 'completed' : 'active';

    const finalEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { progress, status }
    });

    res.status(200).json({ success: true, data: finalEnrollment });
  } catch (error) {
    next(error);
  }
};

// @desc    Unenroll from a course
// @route   DELETE /api/enrollments/:courseId
// @access  Private
exports.unenroll = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (!existingEnrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }

    await prisma.enrollment.delete({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Student requests certificate approval
// @route   POST /api/enrollments/:courseId/request-certificate
// @access  Private
exports.requestCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' });
    }

    if (enrollment.progress < 100) {
      return res.status(400).json({ success: false, error: 'You must complete 100% of the course to request a certificate.' });
    }

    if (enrollment.certificateStatus === 'approved') {
      return res.status(400).json({ success: false, error: 'Certificate already approved.' });
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { certificateStatus: 'requested' }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
