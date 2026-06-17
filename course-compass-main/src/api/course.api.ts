import API from "./client";

export interface CourseData {
  id?: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price?: number;
  thumbnail?: string;
  instructor?: {
    id: string;
    name: string;
  };
  _count?: {
    enrollments: number;
  };
}

export const courseApi = {
  getAllCourses: () => API.get("/courses"),

  getCourseById: (id: string) => API.get(`/courses/${id}`),

  createCourse: (data: CourseData) => API.post("/courses", data),

  updateCourse: (id: string, data: Partial<CourseData>) =>
    API.put(`/courses/${id}`, data),

  deleteCourse: (id: string) => API.delete(`/courses/${id}`),

  // Enrollment
  enrollInCourse: (courseId: string, mentor?: string) =>
    API.post(`/enrollments/${courseId}`, { mentor }),

  unenrollFromCourse: (courseId: string) =>
    API.delete(`/enrollments/${courseId}`),

  getMyEnrollments: () => API.get("/enrollments"),

  // Lessons
  addLesson: (courseId: string, data: { title: string; content: string; videoUrl?: string; order: number }) =>
    API.post(`/courses/${courseId}/lessons`, data),

  deleteLesson: (courseId: string, lessonId: string) =>
    API.delete(`/courses/${courseId}/lessons/${lessonId}`),

  completeLesson: (courseId: string, lessonId: string) =>
    API.put(`/enrollments/${courseId}/lessons/${lessonId}`),

  rateLesson: (courseId: string, lessonId: string, data: { rating: number; feedback?: string }) =>
    API.post(`/courses/${courseId}/lessons/${lessonId}/rate`, data),

  // Stats
  getInstructorStats: () => API.get("/courses/instructor/stats"),

  // Instructor's own courses (all statuses — pending, approved, rejected)
  getMyCourses: () => API.get("/courses/instructor/mine"),

  // Certificate request
  requestCertificate: (courseId: string) =>
    API.post(`/enrollments/${courseId}/request-certificate`),
};
