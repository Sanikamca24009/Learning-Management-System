import { Link } from "react-router-dom";
import { Star, Clock, BookOpen, Users, GraduationCap } from "lucide-react";
import type { Course } from "@/constants/courses";
import { useState } from "react";

const FALLBACK =
  "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80";

export const CourseCard = ({ course, index = 0 }: { course: Course; index?: number }) => {
  const [imgError, setImgError] = useState(false);

  const levelColor =
    course.level === "Beginner"
      ? "text-secondary border-secondary/30"
      : course.level === "Intermediate"
      ? "text-primary border-primary/30"
      : "text-destructive border-destructive/30";

  const thumbnail = !imgError && course.thumbnail ? course.thumbnail : FALLBACK;

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group block opacity-0 animate-fade-in relative"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-[0_0_25px_hsl(var(--primary)/0.15)] flex flex-col h-full">

        {/* Thumbnail */}
        <div className="relative overflow-hidden h-44 shrink-0 bg-muted">
          <img
            src={thumbnail}
            alt={course.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Dark scrim so title is always readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Floating Badges */}
          <span
            className={`absolute top-3 left-3 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full border bg-black/50 backdrop-blur-md ${levelColor}`}
          >
            {course.level}
          </span>
          <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white">
            {course.price && course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
          </span>

          {/* Title overlaid at bottom of image */}
          <h3 className="absolute bottom-3 left-3 right-3 font-display font-bold text-base leading-snug text-white group-hover:text-primary transition-colors line-clamp-2 drop-shadow">
            {course.title}
          </h3>
        </div>

        {/* Content Area */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground truncate">By {course.instructor}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-auto">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {course.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> {course.lessons}
            </span>
            <span className="flex items-center gap-1.5 text-primary font-medium">
              <Star className="w-3.5 h-3.5 fill-primary" /> {course.rating}
            </span>
          </div>

          <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" /> {course.enrollments}
            </span>
            <span className="text-xs font-semibold text-secondary group-hover:text-primary transition-colors flex items-center gap-1">
              View Course <span className="text-[10px]">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
