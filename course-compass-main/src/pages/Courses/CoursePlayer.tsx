import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, PlayCircle, FileText, CheckCircle, CheckCircle2, Loader2, Lock, ChevronRight, ChevronLeft, Award, Trophy, Star } from "lucide-react";
import { courseApi } from "@/api/course.api";
import { useAuth } from "@/store/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function CoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingVal, setRatingVal] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await courseApi.getCourseById(id!);
        const c = courseRes.data.data;
        c.lessons = [...(c.lessons || [])].sort((a: any, b: any) => a.order - b.order);
        setCourse(c);

        if (user?.role === "admin" || (user?.role === "instructor" && c.instructorId === user.id)) {
          setIsEnrolled(true);
        } else {
          const enrollRes = await courseApi.getMyEnrollments();
          const myEnrollment = enrollRes.data.data?.find((e: any) => e.courseId === id);
          if (myEnrollment) {
            setIsEnrolled(true);
            setProgress(myEnrollment.progress || 0);
            if (myEnrollment.progress === 100) setCourseCompleted(true);
            // Track completed lessons from enrollment
            const completedIds = new Set<string>(
              (myEnrollment.completedLessons || []).map((l: any) => l.id)
            );
            setCompletedLessonIds(completedIds);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id && user) fetchData();
  }, [id, user]);

  const handleMarkComplete = async () => {
    const lesson = course.lessons[activeLessonIndex];
    if (!lesson || completedLessonIds.has(lesson.id)) return;

    setIsMarkingComplete(true);
    try {
      const res = await courseApi.completeLesson(id!, lesson.id);
      const updatedEnrollment = res.data.data;

      const newCompleted = new Set(completedLessonIds);
      newCompleted.add(lesson.id);
      setCompletedLessonIds(newCompleted);

      const newProgress = updatedEnrollment?.progress ?? Math.round((newCompleted.size / course.lessons.length) * 100);
      setProgress(newProgress);

      if (newProgress === 100) {
        setCourseCompleted(true);
        toast({
          title: "🎉 Course Completed!",
          description: "Congratulations! Your certificate is now available on the Dashboard.",
        });
        toast({
          title: "✅ Lesson Complete",
          description: `Progress: ${newProgress}% — Keep going!`,
        });
      }

      setRatingVal(0);
      setRatingFeedback("");
      setShowRatingModal(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.error || "Could not mark lesson complete.",
        variant: "destructive",
      });
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const submitRating = async () => {
    if (!course || !course.lessons[activeLessonIndex]) return;
    const lesson = course.lessons[activeLessonIndex];
    setIsSubmittingRating(true);
    try {
      await courseApi.rateLesson(id!, lesson.id, { rating: ratingVal, feedback: ratingFeedback });
      toast({ title: "Rating submitted", description: "Thank you for your feedback!" });
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.error || "Could not submit rating.", variant: "destructive" });
    } finally {
      setIsSubmittingRating(false);
      setShowRatingModal(false);
      if (activeLessonIndex < course.lessons.length - 1) {
        setActiveLessonIndex(activeLessonIndex + 1);
      }
    }
  };

  const skipRating = () => {
    setShowRatingModal(false);
    if (activeLessonIndex < course.lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    }
  };


  const renderVideo = (url?: string) => {
    if (!url) return null;
    if (url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".webm") || url.toLowerCase().endsWith(".ogg")) {
      return <video controls className="w-full h-full bg-black" src={url}>Your browser does not support the video tag.</video>;
    }
    let embedUrl = url;
    if (url.includes("youtube.com/watch?v=")) embedUrl = url.replace("watch?v=", "embed/");
    else if (url.includes("youtu.be/")) embedUrl = url.replace("youtu.be/", "youtube.com/embed/");
    return <iframe className="w-full h-full bg-black" src={embedUrl} title="Video Player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return <Navigate to="/dashboard" replace />;

  if (!isEnrolled) {
    return (
      <div className="container py-20 text-center">
        <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="font-display font-bold text-2xl mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">You must be enrolled to view this course's content.</p>
        <Link to={`/courses/${id}`} className="btn-primary inline-flex items-center gap-2">View Course Details</Link>
      </div>
    );
  }

  const activeLesson = course.lessons[activeLessonIndex];
  const isLessonCompleted = activeLesson && completedLessonIds.has(activeLesson.id);
  const completedCount = completedLessonIds.size;
  const totalLessons = course.lessons.length;

  return (
    <div className="flex flex-col min-h-screen bg-background border-t border-border">
      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-display font-semibold mb-2">Rate this Lesson</h3>
            <p className="text-sm text-muted-foreground mb-4">How was "{activeLesson?.title}"?</p>
            
            <div className="flex gap-2 mb-4 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingVal(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star className={`w-8 h-8 transition-colors ${ratingVal >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>

            <textarea
              className="w-full bg-background border border-border rounded-lg p-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Optional feedback..."
              rows={3}
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button onClick={skipRating} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                Skip
              </button>
              <button
                onClick={submitRating}
                disabled={ratingVal === 0 || isSubmittingRating}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors hover:bg-primary/90"
              >
                {isSubmittingRating && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="h-16 border-b border-border flex items-center px-6 shrink-0 bg-muted/10 gap-4">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="h-6 w-px bg-border" />
        <h1 className="font-display font-semibold truncate flex-1">{course.title}</h1>

        {/* Progress Bar in Header */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground font-mono">{completedCount}/{totalLessons} lessons</span>
          <div className="w-36 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-primary">{progress}%</span>
        </div>
      </div>

      {/* Course Completed Banner */}
      {courseCompleted && (
        <div className="bg-gradient-to-r from-amber-500/20 to-primary/20 border-b border-amber-500/30 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-sm">🎉 You've completed this course! Your certificate is ready.</span>
          </div>
          <Link to="/dashboard" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            View Certificate <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-130px)]">
        {/* Left: Player Area */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-black/5">
          {/* Video Container */}
          <div className="w-full aspect-video bg-black flex items-center justify-center relative shrink-0">
            {activeLesson?.videoUrl ? (
              renderVideo(activeLesson.videoUrl)
            ) : (
              <div className="text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No video available for this lesson.</p>
                <p className="text-xs mt-1 opacity-70">Please read the content below.</p>
              </div>
            )}
          </div>

          {/* Lesson Content */}
          <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full flex-1">
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h2 className="font-display font-bold text-2xl md:text-3xl mb-2">
                  {activeLesson?.order}. {activeLesson?.title || "Welcome"}
                </h2>
                {isLessonCompleted && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
              </div>

              {/* Mark Complete Button */}
              {user?.role === "user" && !isLessonCompleted && (
                <button
                  id="mark-complete-btn"
                  onClick={handleMarkComplete}
                  disabled={isMarkingComplete || !activeLesson}
                  className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  {isMarkingComplete ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {isMarkingComplete ? "Saving..." : "Mark as Complete"}
                </button>
              )}

              {user?.role === "user" && isLessonCompleted && (
                <div className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Done
                </div>
              )}
            </div>

            <div className="prose prose-invert max-w-none text-muted-foreground">
              {activeLesson?.content ? (
                <div className="whitespace-pre-wrap">{activeLesson.content}</div>
              ) : (
                <p className="italic opacity-50">No additional notes provided for this lesson.</p>
              )}
            </div>

            {/* Lesson Navigation */}
            <div className="flex justify-between mt-10 pt-6 border-t border-border">
              <button
                onClick={() => setActiveLessonIndex(Math.max(0, activeLessonIndex - 1))}
                disabled={activeLessonIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => setActiveLessonIndex(Math.min(totalLessons - 1, activeLessonIndex + 1))}
                disabled={activeLessonIndex === totalLessons - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Sidebar Syllabus */}
        <div className="w-full lg:w-[340px] border-l border-border bg-muted/5 flex flex-col shrink-0 h-full">
          <div className="p-5 border-b border-border shrink-0">
            <h3 className="font-display font-bold text-lg mb-1">Course Content</h3>
            <p className="text-xs text-muted-foreground">{completedCount} of {totalLessons} lessons completed</p>
            {/* Sidebar progress bar */}
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {course.lessons.length === 0 ? (
              <div className="text-center p-6 text-sm text-muted-foreground">No lessons available yet.</div>
            ) : (
              course.lessons.map((lesson: any, i: number) => {
                const isActive = activeLessonIndex === i;
                const isDone = completedLessonIds.has(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonIndex(i)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/40 border border-transparent"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isActive ? (
                        <PlayCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-tight mb-0.5 ${isActive ? "text-primary" : isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {lesson.order}. {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{lesson.videoUrl ? "Video" : "Article"}</p>
                    </div>
                    {isDone && (
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
