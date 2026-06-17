import { Link, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Award, BookOpen, Clock, Flame, ChevronLeft, ChevronRight, Trophy, Star, Zap, Target, Medal, Loader2, Layers, CheckCircle2, ArrowRight, Send } from "lucide-react";
import { mockUser } from "@/constants/courses";
import { CourseCard } from "@/components/common/CourseCard";
import { useAuth } from "@/store/AuthContext";
import { courseApi } from "@/api/course.api";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else if (user?.role === "instructor") {
      navigate("/portal");
    }
  }, [user, navigate]);

  const [inProgress, setInProgress] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [myPaths, setMyPaths] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requesting, setRequesting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollRes, coursesRes] = await Promise.all([
          courseApi.getMyEnrollments().catch(() => ({ data: { data: [] } })),
          courseApi.getAllCourses().catch(() => ({ data: { data: [] } }))
        ]);
        
        const enrollments = enrollRes.data.data;
        const allCourses = coursesRes.data.data;
        
        const enrolledCourseIds = new Set(enrollments.map((e: any) => e.courseId));
        const enrolledCategories = new Set(enrollments.map((e: any) => e.course.category));
        
        const activeEnrollments = enrollments.filter((e: any) => (e.progress || 0) < 100);
        const finishedEnrollments = enrollments.filter((e: any) => (e.progress || 0) === 100);

        setInProgress(activeEnrollments.map((e: any) => ({
          ...e.course,
          progress: e.progress || 0,
          lessons: e.course.lessons?.length || 0,
          thumbnail: e.course.thumbnail || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80"
        })));

        setCompletedCourses(finishedEnrollments.map((e: any) => ({
          ...e.course,
          enrollmentId: e.id,
          courseId: e.courseId,
          certificateStatus: e.certificateStatus || 'none',
          completedAt: new Date(e.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          instructor: e.mentor || e.course.instructor?.name || "Unknown Instructor",
          thumbnail: e.course.thumbnail || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80"
        })));
        
        // Generate enrolled paths
        const pathsMap: Record<string, any[]> = {};
        enrollments.forEach((e: any) => {
          const c = e.course;
          if (!c) return;
          if (!pathsMap[c.category]) pathsMap[c.category] = [];
          pathsMap[c.category].push({
            id: c.id,
            title: c.title,
            description: c.description,
            level: c.level || "Beginner",
            duration: "4h 30m" // Mock duration
          });
        });

        const generatedPaths = Object.keys(pathsMap).map((category: string, idx) => ({
          id: category.toLowerCase().replace(/\s+/g, '-'),
          title: `${category} Path`,
          description: `Your enrolled courses in ${category}.`,
          duration: `${pathsMap[category].length * 4} weeks`,
          courses: pathsMap[category],
          color: idx % 2 === 0 ? "orange" : "teal"
        }));
        setMyPaths(generatedPaths);
        
        const unEnrolled = allCourses
          .filter((c: any) => !enrolledCourseIds.has(c.id))
          .map((c: any) => ({
            ...c,
            thumbnail: c.thumbnail || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
            level: c.level || "Beginner",
            rating: 4.8,
            enrollments: c._count?.enrollments || 0,
            duration: "4h 30m",
            lessons: c.lessons?.length || 0,
            instructor: c.instructor?.name || "Unknown",
          }));
          
        setRecommended(unEnrolled.slice(0, 6));

        const wishlistedIds = JSON.parse(localStorage.getItem("lms_wishlist") || "[]");
        const wishlistedSet = new Set(wishlistedIds);
        const wishlistedCourses = allCourses
          .filter((c: any) => wishlistedSet.has(c.id))
          .map((c: any) => ({
            ...c,
            thumbnail: c.thumbnail || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
            level: c.level || "Beginner",
            rating: 4.8,
            enrollments: c._count?.enrollments || 0,
            duration: "4h 30m",
            lessons: c.lessons?.length || 0,
            instructor: c.instructor?.name || "Unknown",
          }));
        setWishlist(wishlistedCourses);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  const scroll = (dir: number) => {
    carouselRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const stats = [
    { icon: BookOpen, label: "Courses Enrolled", val: inProgress.length + completedCourses.length, color: "text-primary" },
    { icon: Clock, label: "Hours Learned", val: mockUser.hoursLearned, color: "text-secondary" },
    { icon: Award, label: "Certificates", val: completedCourses.length, color: "text-primary" },
    { icon: Flame, label: "Day Streak", val: mockUser.streak, color: "text-secondary" },
  ];

  const achievements = [
    { icon: Trophy, name: "First Course", earned: true },
    { icon: Star, name: "5-Star Rating", earned: true },
    { icon: Zap, name: "10-Day Streak", earned: true },
    { icon: Target, name: "Goal Crusher", earned: true },
    { icon: Medal, name: "Top Learner", earned: false },
    { icon: Award, name: "AI Master", earned: false },
  ];

  return (
    <div className="container py-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-full border-2 border-primary bg-muted flex items-center justify-center overflow-hidden">
          {user?.name ? (
            <span className="text-2xl font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span>
          ) : (
            <img src={mockUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="font-display font-bold text-2xl md:text-3xl">{user?.name || "Guest"} 👋</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((s, i) => (
              <div key={i} className="glass-card p-5 opacity-0 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
                <p className="font-display font-bold text-3xl">{s.val}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

      {/* In progress carousel */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl">Continue Learning</h2>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-lg border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll(1)} className="w-9 h-9 rounded-lg border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div ref={carouselRef} className="flex gap-5 overflow-x-auto pb-4 snap-x scroll-smooth -mx-4 px-4">
          {inProgress.map((c) => (
            <Link key={c.id} to={`/learn/${c.id}`} className="course-card min-w-[300px] snap-start">
              <div className="aspect-video relative">
                <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <h4 className="font-display font-semibold mb-3 line-clamp-1">{c.title}</h4>
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>{c.progress}% complete</span>
                  <span>{c.lessons} lessons</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Wishlist */}
      {wishlist.length > 0 && (
        <section className="mb-14">
          <h2 className="font-display font-bold text-2xl mb-6">My Wishlist ❤️</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
          </div>
        </section>
      )}

      {/* Certificates Section — hidden for instructors */}
      {completedCourses.length > 0 && user?.role !== 'instructor' && (
        <section className="mb-14">
          <h2 className="font-display font-bold text-2xl mb-6">My Certificates 🏆</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedCourses.map((c) => {
              const isRequesting = requesting[c.courseId];

              const handleRequest = async () => {
                setRequesting((r) => ({ ...r, [c.courseId]: true }));
                try {
                  await courseApi.requestCertificate(c.courseId);
                  toast.success("Certificate request sent! Awaiting admin approval. 🎉");
                  // Optimistically update status
                  setCompletedCourses((prev) =>
                    prev.map((x) => x.courseId === c.courseId ? { ...x, certificateStatus: 'requested' } : x)
                  );
                } catch (err: any) {
                  toast.error(err?.response?.data?.error || "Failed to request certificate");
                } finally {
                  setRequesting((r) => ({ ...r, [c.courseId]: false }));
                }
              };

              return (
                <div key={c.id} className="course-card flex flex-col justify-between h-full">
                  <div>
                    <div className="aspect-video relative">
                      <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-lg">
                        <Award className="w-3.5 h-3.5" /> Completed
                      </div>
                      {/* Certificate status badge */}
                      {c.certificateStatus === 'approved' && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-stone-900 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-lg">
                          <Award className="w-3.5 h-3.5" /> Certified ✓
                        </div>
                      )}
                      {c.certificateStatus === 'requested' && (
                        <div className="absolute top-3 left-3 bg-blue-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-lg">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h4 className="font-display font-semibold mb-2 line-clamp-1">{c.title}</h4>
                      <p className="text-xs text-muted-foreground mb-4">Completed on {c.completedAt}</p>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    {/* Approved — View Certificate */}
                    {c.certificateStatus === 'approved' && (
                      <button
                        onClick={() => setSelectedCertificate(c)}
                        className="w-full py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-stone-900 font-semibold text-sm transition-all duration-300 border border-amber-500/30 flex items-center justify-center gap-2"
                      >
                        <Award className="w-4 h-4" /> View Certificate
                      </button>
                    )}

                    {/* Pending — waiting for admin */}
                    {c.certificateStatus === 'requested' && (
                      <div className="w-full py-2.5 rounded-lg bg-blue-500/10 text-blue-400 font-semibold text-sm border border-blue-500/20 flex items-center justify-center gap-2 cursor-default">
                        <Loader2 className="w-4 h-4 animate-spin" /> Pending Admin Approval
                      </div>
                    )}

                    {/* None / Rejected — Request button */}
                    {(c.certificateStatus === 'none' || c.certificateStatus === 'rejected') && (
                      <button
                        onClick={handleRequest}
                        disabled={isRequesting}
                        className="w-full py-2.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-semibold text-sm transition-all duration-300 border border-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isRequesting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {c.certificateStatus === 'rejected' ? 'Re-request Certificate' : 'Request Certificate'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Your Learning Paths */}
      {myPaths.length > 0 && (
        <section className="mb-14">
          <h2 className="font-display font-bold text-2xl mb-6">Your Learning Paths</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {myPaths.map((path, idx) => {
              const isOrange = path.color === "orange";
              return (
                <div
                  key={path.id}
                  className="glass-card p-8 md:p-10 opacity-0 animate-fade-in hover:border-secondary transition-all flex flex-col"
                  style={{ animationDelay: `${idx * 120}ms`, animationFillMode: "forwards" }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${isOrange ? "bg-primary/15 text-primary border-primary/40" : "bg-secondary/15 text-secondary border-secondary/40"}`}>
                        ENROLLED PATH
                      </span>
                      <h2 className="font-display font-bold text-2xl mt-3">{path.title}</h2>
                    </div>
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isOrange ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"}`}>
                      <Layers className="w-7 h-7" />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-5">{path.description}</p>

                  <div className="flex gap-6 text-sm text-muted-foreground mb-10">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-foreground" /> {path.duration}</span>
                    <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-foreground" /> {path.courses.length} courses</span>
                  </div>

                  {/* Node flow preview */}
                  <div className="space-y-2 mb-10 flex-1">
                    {path.courses.slice(0, 3).map((c: any, i: number) => (
                      <div key={c.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                            i === 0 ? (isOrange ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-secondary")
                                    : "bg-card border-border text-muted-foreground"
                          }`}>
                            {i === 0 ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                          </div>
                          {i < Math.min(path.courses.length, 3) - 1 && (
                            <div className={`w-0.5 flex-1 my-2 ${isOrange ? "bg-gradient-to-b from-primary/60 to-border" : "bg-gradient-to-b from-secondary/60 to-border"}`} style={{ minHeight: "36px" }} />
                          )}
                        </div>
                        <Link to={`/courses/${c.id}`} className="flex-1 pb-6 group pt-1">
                          <p className="font-semibold text-base group-hover:text-primary transition-colors">{c.title}</p>
                          <p className="text-sm text-muted-foreground mt-1.5">{c.duration} • {c.level}</p>
                        </Link>
                      </div>
                    ))}
                    {path.courses.length > 3 && (
                      <div className="flex gap-4 opacity-60">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 border-dashed border-muted-foreground/50 text-muted-foreground bg-transparent">
                            +{path.courses.length - 3}
                          </div>
                        </div>
                        <div className="flex-1 pb-6 pt-2">
                          <p className="font-semibold text-sm text-muted-foreground italic">More courses in path...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link 
                    to={`/learning-paths/${path.id}`}
                    className="inline-flex justify-center items-center gap-2 py-3.5 mt-auto btn-primary w-full"
                  >
                    View Full Roadmap <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Achievements */}
      <section className="mb-14">
        <h2 className="font-display font-bold text-2xl mb-6">Achievements</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {achievements.map((a, i) => (
            <div key={i} className={`glass-card p-5 text-center transition-all ${a.earned ? "border-primary/40" : "opacity-40 grayscale"}`}>
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${a.earned ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                <a.icon className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium">{a.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <h2 className="font-display font-bold text-2xl mb-6">Recommended for You</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommended.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
        </div>
      </section>
        </>
      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-3xl w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h3 className="font-display font-bold text-xl flex items-center gap-2">
                <Award className="text-primary w-5 h-5" /> Course Certificate
              </h3>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>

            {/* Certificate Print Area */}
            <div id="certificate-print-area" className="relative bg-stone-900 border-8 border-double border-amber-500 p-8 md:p-12 text-center overflow-hidden rounded-md shadow-inner text-stone-100 font-serif">
              {/* Decorative Corner Borders */}
              <div className="absolute top-2 left-2 right-2 bottom-2 border border-dashed border-amber-500/50 pointer-events-none" />
              
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Logo / Badge */}
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-amber-500 shadow-lg">
                    <Award className="w-10 h-10" />
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold tracking-widest text-amber-500 uppercase">
                  Certificate of Completion
                </h1>
                
                <p className="text-sm md:text-base text-stone-400 italic font-sans">
                  This is proudly presented to
                </p>
                
                <h2 className="text-3xl md:text-4xl font-bold font-sans text-stone-100 border-b-2 border-stone-700 pb-2 max-w-md mx-auto">
                  {user?.name || "Sanu Bangar"}
                </h2>
                
                <p className="text-sm md:text-base text-stone-400 font-sans max-w-lg mx-auto">
                  for outstanding academic achievement and successful completion of the course
                </p>
                
                <h3 className="text-xl md:text-2xl font-bold text-amber-400 font-sans tracking-wide">
                  "{selectedCertificate.title}"
                </h3>
                
                <p className="text-xs md:text-sm text-stone-400 font-sans">
                  Completed on <span className="text-stone-200 font-semibold">{selectedCertificate.completedAt}</span>
                </p>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-stone-800 text-stone-400 font-sans text-xs">
                  <div className="space-y-1">
                    <div className="italic text-stone-200 font-serif text-sm border-b border-stone-700 pb-1 max-w-[150px] mx-auto">
                      {selectedCertificate.instructor}
                    </div>
                    <div>Course Instructor</div>
                  </div>
                  <div className="space-y-1">
                    <div className="italic text-stone-200 font-serif text-sm border-b border-stone-700 pb-1 max-w-[150px] mx-auto">
                      UptoSkills LMS
                    </div>
                    <div>Platform Director</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => {
                  const printContents = document.getElementById('certificate-print-area')?.innerHTML;
                  
                  // Open print window
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Certificate - ${selectedCertificate.title}</title>
                          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
                          <script src="https://cdn.tailwindcss.com"></script>
                          <style>
                            body { font-family: 'Outfit', sans-serif; background-color: #1c1917; color: #f5f5f4; margin: 0; padding: 20px; display: flex; align-items: center; justify-content: center; height: 100vh; }
                            @media print {
                              body { background-color: white; color: black; }
                              .print-bg { background-color: #1c1917 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            }
                          </style>
                        </head>
                        <body>
                          <div class="print-bg border-8 border-double border-amber-500 p-12 text-center rounded-md max-w-3xl w-full bg-stone-900 text-stone-100">
                            ${printContents}
                          </div>
                          <script>
                            window.onload = function() { window.print(); window.close(); }
                          </script>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  }
                }}
                className="btn-primary py-2 px-5 font-semibold text-sm flex items-center gap-2"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="py-2 px-5 rounded-lg border border-border hover:bg-muted font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

