
import { useEffect, useState } from "react";
import { Users, GraduationCap, BookOpen, Activity, UserPlus, Clock, AlertCircle, DollarSign, Target } from "lucide-react";
import { adminApi } from "@/api/admin.api";

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  totalCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  totalRevenue: number;
  pendingUsers: number;
  pendingCourses: number;
  recentUsers: any[];
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats();
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" /></div>;
  }

  if (!stats) return null;

  const statCards = [
    { title: "Total Revenue", value: `$${stats.totalRevenue || 0}`, icon: DollarSign, color: "bg-green-500/10 text-green-500 border-green-500/20" },
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { title: "Students", value: stats.totalStudents, icon: GraduationCap, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    { title: "Instructors", value: stats.totalInstructors, icon: UserPlus, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { title: "Active Courses", value: stats.totalCourses, icon: BookOpen, color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    { title: "Total Enrollments", value: stats.totalEnrollments, icon: Activity, color: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
    { title: "Active Enrollments", value: stats.activeEnrollments || 0, icon: Target, color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  ];

  const hasPendingItems = stats.pendingUsers > 0 || stats.pendingCourses > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold font-display tracking-tight mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Monitor your platform and review pending approvals.</p>
      </div>

      {/* Pending Approvals Alert */}
      {hasPendingItems && (
        <div className="flex items-start gap-4 p-5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Pending approvals require your attention</p>
            <p className="text-sm mt-1">
              {stats.pendingUsers > 0 && <span>{stats.pendingUsers} user(s) waiting for approval. </span>}
              {stats.pendingCourses > 0 && <span>{stats.pendingCourses} course(s) waiting for approval.</span>}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div key={i} className="glass-card p-6 shadow-sm border border-border/50 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
                <h3 className="text-3xl font-bold tracking-tight">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl border ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card p-6 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold">Pending Users</h3>
          </div>
          <p className="text-4xl font-bold text-amber-500">{stats.pendingUsers}</p>
          <p className="text-sm text-muted-foreground mt-1">Awaiting account approval</p>
        </div>
        <div className="glass-card p-6 border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold">Pending Courses</h3>
          </div>
          <p className="text-4xl font-bold text-amber-500">{stats.pendingCourses}</p>
          <p className="text-sm text-muted-foreground mt-1">Awaiting course approval</p>
        </div>
      </div>

      {/* Recent Users */}
      <div className="glass-card p-6 border border-border/50">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Recently Registered Users
        </h3>
        <div className="space-y-3">
          {stats.recentUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                  user.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                  user.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {user.status}
                </span>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                  user.role === 'admin' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                  user.role === 'instructor' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                  'bg-secondary/10 text-secondary border-secondary/20'
                }`}>
                  {user.role}
                </span>
                <p className="text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {stats.recentUsers.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No recent users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
