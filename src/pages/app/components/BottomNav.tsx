export type View = "dashboard" | "history" | "add" | "settings" | "profile";

interface Props {
  active: View;
  onNavigate: (view: View) => void;
  avatarColor?: string;
  initials?: string;
}

export default function BottomNav({ active, onNavigate, avatarColor = "#6366f1", initials = "U" }: Props) {
  const item = (view: View, icon: string, label: string) => (
    <button
      onClick={() => onNavigate(view)}
      className={`flex flex-col items-center gap-0.5 py-1 px-3 cursor-pointer transition-colors ${
        active === view ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
      }`}
    >
      <i className={`${icon} text-xl`} />
      <span className="text-[10px] font-bold whitespace-nowrap">{label}</span>
    </button>
  );

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 z-50">
      {item("dashboard", "ri-pie-chart-2-line", "Início")}
      {item("history",   "ri-list-check-3",     "Histórico")}

      {/* Center add button */}
      <button onClick={() => onNavigate("add")} className="-mt-6 cursor-pointer">
        <div className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-2xl flex items-center justify-center shadow-lg">
          <i className="ri-add-line text-white text-2xl" />
        </div>
      </button>

      {/* Profile avatar tab */}
      <button
        onClick={() => onNavigate("profile")}
        className={`flex flex-col items-center gap-0.5 py-1 px-3 cursor-pointer transition-colors ${
          active === "profile" ? "opacity-100" : "opacity-60 hover:opacity-80"
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold transition-all ${
            active === "profile" ? "ring-2 ring-offset-1 ring-emerald-400" : ""
          }`}
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <span className={`text-[10px] font-bold whitespace-nowrap ${active === "profile" ? "text-emerald-600" : "text-slate-400"}`}>
          Perfil
        </span>
      </button>

      {item("settings", "ri-settings-3-line", "Ajustes")}
    </nav>
  );
}
