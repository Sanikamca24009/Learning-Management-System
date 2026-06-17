import { X } from "lucide-react";

interface SidebarProps {
  sortBy: string;
  setSortBy: (v: string) => void;
  selLevels: string[];
  setSelLevels: (v: string[]) => void;
  selTopics: string[];
  setSelTopics: (v: string[]) => void;
  clearAll: () => void;
  levels: readonly string[];
  topics: string[];
  showFilters: boolean;
}

const sortOptions = ["Most Popular", "Highest Rated", "Newest"];

export const AppSidebar = ({
  sortBy,
  setSortBy,
  selLevels,
  setSelLevels,
  selTopics,
  setSelTopics,
  clearAll,
  levels,
  topics,
  showFilters,
}: SidebarProps) => {
  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  return (
    <aside
      className={`${
        showFilters ? "block" : "hidden"
      } lg:block w-full lg:w-[280px] lg:border-r lg:border-border lg:pr-6 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden custom-scrollbar`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display font-bold text-lg text-foreground tracking-wide">All Filters</h3>
        <button
          onClick={clearAll}
          className="text-xs font-medium text-secondary hover:text-primary transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Clear All
        </button>
      </div>

      <FilterGroup title="Sort By">
        {sortOptions.map((s) => (
          <label
            key={s}
            className="flex items-center gap-3 py-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${sortBy === s ? "border-primary" : "border-border group-hover:border-primary/50"}`}>
              {sortBy === s && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <input
              type="radio"
              name="sortBy"
              checked={sortBy === s}
              onChange={() => setSortBy(s)}
              className="sr-only"
            />
            <span className="text-sm">{s}</span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Level">
        {levels.map((l) => (
          <Checkbox
            key={l}
            label={l}
            checked={selLevels.includes(l)}
            onChange={() => toggle(selLevels, setSelLevels, l)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Topics">
        {topics.map((t) => (
          <Checkbox
            key={t}
            label={t}
            checked={selTopics.includes(t)}
            onChange={() => toggle(selTopics, setSelTopics, t)}
          />
        ))}
      </FilterGroup>
    </aside>
  );
};

const FilterGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6 pb-6 border-b border-border/50 last:border-0 last:mb-0 last:pb-0">
    <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80 mb-4">{title}</h4>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const Checkbox = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label className="flex items-center gap-3 py-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors group">
    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}>
      {checked && (
        <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3 text-primary-foreground">
          <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
    <span className="text-sm">{label}</span>
  </label>
);
