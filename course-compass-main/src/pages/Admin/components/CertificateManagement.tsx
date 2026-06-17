import { useEffect, useState } from "react";
import {
  Search, Trash2, Award, XCircle, BookOpen,
  Printer, Download, CheckCircle, Clock, ShieldCheck
} from "lucide-react";
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

type CertTab = "pending" | "approved";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const levelBadge = (level: string) => {
  if (level === "Beginner")     return "bg-secondary/10 text-secondary border-secondary/20";
  if (level === "Intermediate") return "bg-primary/10 text-primary border-primary/20";
  return "bg-destructive/10 text-destructive border-destructive/20";
};

const printCertificate = (cert: any) => {
  const instructorName =
    cert.mentor || cert.course.instructor?.name || "UptoSkills";
  const completedOn = new Date(cert.updatedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Certificate — ${cert.course.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Inter',sans-serif;background:#1c1917;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
      .cert{background:#1c1917;border:8px double #f59e0b;border-radius:12px;padding:56px;max-width:860px;width:100%;text-align:center;position:relative;color:#f5f5f4;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .inner{position:absolute;inset:12px;border:1px dashed rgba(245,158,11,.4);border-radius:6px;pointer-events:none}
      .badge{width:72px;height:72px;border-radius:50%;background:rgba(245,158,11,.12);border:2px solid #f59e0b;display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
      .badge svg{width:40px;height:40px;color:#f59e0b;fill:none;stroke:currentColor;stroke-width:1.5}
      .platform{font-size:13px;letter-spacing:4px;color:#a8a29e;text-transform:uppercase;margin-bottom:4px}
      h1{font-family:'Playfair Display',serif;font-size:40px;color:#f59e0b;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px}
      .presented{font-size:15px;color:#a8a29e;font-style:italic;margin-bottom:12px}
      .name{font-size:36px;font-weight:700;color:#f5f5f4;border-bottom:2px solid #44403c;padding-bottom:12px;max-width:500px;margin:0 auto 20px}
      .desc{font-size:15px;color:#a8a29e;max-width:460px;margin:0 auto 16px;line-height:1.6}
      .course{font-size:22px;font-weight:700;color:#fbbf24;margin-bottom:12px}
      .meta{font-size:13px;color:#a8a29e;margin-bottom:40px}.meta span{color:#e7e5e4;font-weight:600}
      .sigs{display:flex;gap:48px;justify-content:center;padding-top:32px;border-top:1px solid #292524}
      .sig{text-align:center}.sig-line{font-style:italic;font-size:16px;color:#e7e5e4;border-bottom:1px solid #44403c;padding-bottom:8px;min-width:180px;margin-bottom:6px}
      .sig-role{font-size:12px;color:#78716c;text-transform:uppercase;letter-spacing:1px}
      @media print{body{background:#1c1917}.cert{page-break-inside:avoid}}
    </style>
  </head><body>
    <div class="cert"><div class="inner"></div>
      <div class="badge"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
      <p class="platform">UptoSkills LMS</p>
      <h1>Certificate of Completion</h1>
      <p class="presented">This is proudly presented to</p>
      <p class="name">${cert.user.name}</p>
      <p class="desc">for outstanding achievement and successful completion of the course</p>
      <p class="course">"${cert.course.title}"</p>
      <p class="meta">Completed on <span>${completedOn}</span> · Category: <span>${cert.course.category}</span> · Level: <span>${cert.course.level}</span></p>
      <div class="sigs">
        <div class="sig"><div class="sig-line">${instructorName}</div><div class="sig-role">Course Instructor</div></div>
        <div class="sig"><div class="sig-line">UptoSkills LMS</div><div class="sig-role">Platform Director</div></div>
      </div>
    </div>
    <script>window.onload=function(){window.print()}<\/script>
  </body></html>`);
  win.document.close();
};

const exportCSV = (certs: any[], label: string) => {
  const headers = ["Student", "Email", "Course", "Category", "Level", "Instructor", "Date"];
  const rows = certs.map((c) => [
    c.user.name, c.user.email, c.course.title, c.course.category, c.course.level,
    c.mentor || c.course.instructor?.name || "—",
    new Date(c.updatedAt).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${label}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Row Component ────────────────────────────────────────────────────────────
const CertRow = ({ cert, tab, onAction }: { cert: any; tab: CertTab; onAction: () => void }) => {
  const handleApprove = async () => {
    try {
      await adminApi.approveCertificate(cert.id);
      toast.success(`Certificate approved for ${cert.user.name} ✅`);
      onAction();
    } catch { toast.error("Failed to approve"); }
  };

  const handleReject = async () => {
    try {
      await adminApi.rejectCertificate(cert.id);
      toast.success(`Certificate request rejected for ${cert.user.name}`);
      onAction();
    } catch { toast.error("Failed to reject"); }
  };

  const handleRevoke = async () => {
    try {
      await adminApi.revokeCertificate(cert.id);
      toast.success(`Certificate revoked for ${cert.user.name}`);
      onAction();
    } catch { toast.error("Failed to revoke"); }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteCertificate(cert.id);
      toast.success("Enrollment record deleted");
      onAction();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <tr className={`transition-colors ${tab === "pending" ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-muted/30"}`}>

      {/* Student */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold flex-shrink-0">
            {cert.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-foreground">{cert.user.name}</div>
            <div className="text-muted-foreground text-xs">{cert.user.email}</div>
          </div>
        </div>
      </td>

      {/* Course */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {cert.course.thumbnail ? (
            <img src={cert.course.thumbnail} alt="" className="w-14 h-9 object-cover rounded shadow-sm flex-shrink-0" />
          ) : (
            <div className="w-14 h-9 bg-muted rounded flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <div className="font-medium text-foreground line-clamp-1 max-w-[160px]">
            {cert.course.title}
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-6 py-4">
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
          {cert.course.category}
        </span>
      </td>

      {/* Level */}
      <td className="px-6 py-4">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${levelBadge(cert.course.level)}`}>
          {cert.course.level}
        </span>
      </td>

      {/* Instructor */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            {(cert.mentor || cert.course.instructor?.name || "?").charAt(0).toUpperCase()}
          </div>
          <span className="text-sm">{cert.mentor || cert.course.instructor?.name || "—"}</span>
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-4 text-muted-foreground text-xs">
        {new Date(cert.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">

          {tab === "pending" ? (
            <>
              {/* Approve */}
              <button
                onClick={handleApprove}
                title="Approve certificate"
                className="p-1.5 text-green-500 hover:bg-green-500/10 rounded transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
              </button>

              {/* Reject */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button title="Reject request" className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Certificate Request?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Reject <strong>{cert.user.name}</strong>'s certificate request for <strong>{cert.course.title}</strong>. They can request again later.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReject} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                      Reject
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              {/* Print */}
              <button onClick={() => printCertificate(cert)} title="Print certificate" className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded transition-colors">
                <Printer className="w-4 h-4" />
              </button>

              {/* Revoke */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button title="Revoke certificate" className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke Certificate?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will revoke <strong>{cert.user.name}</strong>'s approved certificate for <strong>{cert.course.title}</strong>. They will need to request it again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRevoke} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                      Revoke
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Delete */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button title="Delete enrollment" className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Enrollment Record?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Permanently delete <strong>{cert.user.name}</strong>'s entire enrollment in <strong>{cert.course.title}</strong>. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const CertificateManagement = () => {
  const [activeTab, setActiveTab] = useState<CertTab>("pending");
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [pendingCount, setPendingCount] = useState(0);

  // Map UI tab name → actual DB certificateStatus value
  const TAB_STATUS: Record<CertTab, string> = { pending: "requested", approved: "approved" };

  const fetchCerts = async (tab: CertTab = activeTab) => {
    setLoading(true);
    try {
      const res = await adminApi.getCertificates(TAB_STATUS[tab], searchTerm || undefined);
      setCerts(res.data || []);
    } catch {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  // Also fetch pending count for badge
  const fetchPendingCount = async () => {
    try {
      const res = await adminApi.getCertificates("requested");
      setPendingCount(res.data?.length || 0);
    } catch {}
  };

  useEffect(() => {
    fetchCerts(activeTab);
    fetchPendingCount();
  }, [activeTab]);

  const handleAction = () => {
    fetchCerts(activeTab);
    fetchPendingCount();
  };

  // Client-side filters
  const categories = Array.from(new Set(certs.map((c) => c.course.category))).sort();
  const filtered = certs.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      c.user.name.toLowerCase().includes(q) ||
      c.user.email.toLowerCase().includes(q) ||
      c.course.title.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === "all" || c.course.category === categoryFilter;
    const matchesLevel    = levelFilter === "all"    || c.course.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const colSpan = 7;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Certificate Management
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                <Clock className="w-3 h-3" /> {pendingCount} pending
              </span>
            )}
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Approve certificate requests or manage issued certificates.
          </p>
        </div>
        <button
          onClick={() => exportCSV(filtered, activeTab === "pending" ? "pending_requests" : "issued_certificates")}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-40"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* ── Tabs (same style as CourseManagement status filter) ── */}
      <div className="flex items-center gap-1 border-b border-border">
        <button
          onClick={() => { setActiveTab("pending"); setCategoryFilter("all"); setLevelFilter("all"); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "pending"
              ? "border-amber-500 text-amber-500"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending Requests
          {pendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-stone-900 font-bold">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("approved"); setCategoryFilter("all"); setLevelFilter("all"); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "approved"
              ? "border-green-500 text-green-500"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Issued Certificates
        </button>
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by student, email or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">All Levels</option>
          {["Beginner", "Intermediate", "Advanced"].map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="glass-card overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Level</th>
                <th className="px-6 py-4 font-medium">Instructor</th>
                <th className="px-6 py-4 font-medium">{activeTab === "pending" ? "Requested" : "Approved"}</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={colSpan} className="px-6 py-16 text-center">
                    <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-6 py-16 text-center text-muted-foreground">
                    {activeTab === "pending" ? (
                      <>
                        <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>No pending certificate requests.</p>
                        <p className="text-xs mt-1 opacity-60">Students will appear here when they request a certificate after completing a course.</p>
                      </>
                    ) : (
                      <>
                        <Award className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p>No approved certificates yet.</p>
                        <p className="text-xs mt-1 opacity-60">Approve certificate requests to see them here.</p>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((cert) => (
                  <CertRow key={cert.id} cert={cert} tab={activeTab} onAction={handleAction} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
