import { useEffect, useState } from "react";
import { Search, Trash2, BookOpen, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { adminApi } from "@/api/admin.api";

const statusBadge = (status: string) => {
  if (status === 'approved') return 'bg-green-500/10 text-green-500 border-green-500/20';
  if (status === 'rejected') return 'bg-destructive/10 text-destructive border-destructive/20';
  return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
};

export const CourseManagement = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCourses = async () => {
    try {
      const response = await adminApi.getCourses();
      setCourses(response.data);
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleStatusUpdate = async (courseId: string, status: string) => {
    try {
      await adminApi.updateCourse(courseId, { status });
      toast.success(`Course ${status} successfully`);
      fetchCourses();
    } catch (error) {
      toast.error("Failed to update course status");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await adminApi.deleteCourse(courseId);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = courses.filter(c => c.status === 'pending').length;

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            Course Management
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                <Clock className="w-3 h-3" /> {pendingCount} pending
              </span>
            )}
          </h2>
          <p className="text-muted-foreground text-sm">Approve or reject courses before they go public.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Instructor</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Enrollments</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredCourses.map((course) => (
                <tr key={course.id} className={`transition-colors ${course.status === 'pending' ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-muted/30'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-16 h-10 object-cover rounded shadow-sm flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-foreground line-clamp-1">{course.title}</div>
                        <div className="text-muted-foreground text-xs">{new Date(course.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {course.instructor?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{course.instructor?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
                      {course.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(course.status)}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium">
                    {course._count?.enrollments || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Approve */}
                      {course.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate(course.id, 'approved')}
                          title="Approve course"
                          className="p-1.5 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {/* Reject */}
                      {course.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusUpdate(course.id, 'rejected')}
                          title="Reject course"
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      {/* Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{course.title}"? This will remove all lessons and enrollments permanently.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCourse(course.id)}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No courses found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
