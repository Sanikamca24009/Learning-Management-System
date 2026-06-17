const { prisma } = require('../config/db');
const { clearCache } = require('../config/redis');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, category, level } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = { status: 'approved' };

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
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          lessons: true,
          _count: { select: { enrollments: true } }
        },
        skip,
        take: limitNumber,
        orderBy
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

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        lessons: { orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true } }
      }
    });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    // Only admins and the course instructor can view non-approved courses
    if (course.status !== 'approved') {
      const isOwner = req.user && course.instructorId === req.user.id;
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ success: false, error: 'Course not found' });
      }
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin/Instructor)
exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, category, level, thumbnail, price } = req.body;
    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        level,
        thumbnail,
        price: price ? parseFloat(price) : 0,
        instructorId: req.user.id
      }
    });
    await clearCache('/api/courses');
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin/Instructor)
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this course' });
    }

    const dataToUpdate = { ...req.body };
    if (dataToUpdate.price !== undefined) {
      dataToUpdate.price = parseFloat(dataToUpdate.price) || 0;
    }

    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: dataToUpdate
    });
    await clearCache('/api/courses');
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin/Instructor)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this course' });
    }

    await prisma.course.delete({ where: { id: req.params.id } });
    await clearCache('/api/courses');
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Add lesson to course
// @route   POST /api/courses/:courseId/lessons
// @access  Private (Admin/Instructor)
exports.addLesson = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to add lessons to this course' });
    }

    const { title, content, videoUrl, order } = req.body;
    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        videoUrl,
        order: Number(order),
        courseId: req.params.courseId
      }
    });
    await clearCache('/api/courses');
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson from course
// @route   DELETE /api/courses/:courseId/lessons/:lessonId
// @access  Private (Admin/Instructor)
exports.deleteLesson = async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to delete lessons from this course' });
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.lessonId } });
    if (!lesson || lesson.courseId !== req.params.courseId) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    await prisma.lesson.delete({ where: { id: req.params.lessonId } });
    await clearCache('/api/courses');
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor statistics
// @route   GET /api/courses/instructor/stats
// @access  Private (Instructor/Admin)
exports.getInstructorStats = async (req, res, next) => {
  try {
    const instructorId = req.user.id;

    // Get all courses by this instructor
    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: { id: true, price: true }
    });

    const courseIds = courses.map(c => c.id);

    // Get all enrollments for these courses
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: { select: { price: true } } }
    });

    const totalStudents = enrollments.length;
    const totalCourses = courses.length;
    const totalRevenue = enrollments.reduce((sum, enr) => sum + (enr.course?.price || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        totalRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses by the logged-in instructor (any status)
// @route   GET /api/courses/instructor/mine
// @access  Private (Instructor/Admin)
exports.getMyCourses = async (req, res, next) => {
  try {
    const instructorId = req.user.id;

    const where = req.user.role === 'admin'
      ? {}                   // admins see every course
      : { instructorId };    // instructors see only their own

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        lessons: true,
        _count: { select: { enrollments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate a lesson
// @route   POST /api/courses/:courseId/lessons/:lessonId/rate
// @access  Private (User)
exports.rateLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    // Verify the lesson belongs to the course
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson || lesson.courseId !== courseId) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    // Verify the user is enrolled (and optionally completed the lesson, but we assume UI prevents rating if not completed)
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (!enrollment) {
      return res.status(403).json({ success: false, error: 'You are not enrolled in this course' });
    }

    // Upsert the rating
    const lessonRating = await prisma.lessonRating.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { rating: Number(rating), feedback },
      create: {
        userId,
        lessonId,
        rating: Number(rating),
        feedback
      }
    });

    res.status(200).json({ success: true, data: lessonRating });
  } catch (error) {
    next(error);
  }
};
