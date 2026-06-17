import { useState, useEffect } from "react";
import { LayoutDashboard, Users, BookOpen, LogOut, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserManagement } from "./components/UserManagement";
import { CourseManagement } from "./components/CourseManagement";
import { CertificateManagement } from "./components/CertificateManagement";

const AdminPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "courses" | "certificates">("dashboard");

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const tabs = [
    { id: "dashboard",    label: "Dashboard",         icon: LayoutDashboard },
    { id: "users",        label: "User Management",   icon: Users },
    { id: "courses",      label: "Course Management", icon: BookOpen },
    { id: "certificates", label: "Certificates",       icon: Award },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation for Mobile (Optional, can rely on MainLayout Navbar) */}
      <div className="container mx-auto py-8 px-4 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="glass-card p-6 border border-border/50 sticky top-24">
            <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
              <span className="text-gradient">Admin Center</span>
            </h2>
            
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
            
            <div className="mt-8 pt-8 border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeTab === "dashboard"    && <AdminDashboard />}
          {activeTab === "users"        && <UserManagement />}
          {activeTab === "courses"      && <CourseManagement />}
          {activeTab === "certificates" && <CertificateManagement />}
        </div>

      </div>
    </div>
  );
};

export default AdminPortal;
