import { useEffect, useRef } from "react";
import type { DebtAlert } from "@/hooks/useDebtAlerts";
import { getAlertLabel } from "@/hooks/useDebtAlerts";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const LEVEL_CONFIG = {
  overdue: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-500 text-white",
    icon: "ri-alarm-warning-fill text-rose-500",
    dot: "bg-rose-500",
  },
  today: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-500 text-white",
    icon: "ri-time-fill text-amber-500",
    dot: "bg-amber-500",
  },
  soon: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-400 text-white",
    icon: "ri-calendar-event-fill text-orange-400",
    dot: "bg-orange-400",
  },
};

interface Props {
  alerts: DebtAlert[];
  onClose: () => void;
  onGoToHistory: () => void;
}

export default function DebtAlertsPanel({ alerts, onClose, onGoToHistory }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const overdue = alerts.filter((a) => a.level === "overdue");
  const today = alerts.filter((a) => a.level === "today");
  const soon = alerts.filter((a) => a.level === "soon");

  return (
    <div
      ref={panelRef}
      className="absolute top-14 right-3 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden animate-slide-up"
      style={{ animation: "slideDown 0.2s ease-out" }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="ri-notification-3-fill text-indigo-600 text-base" />
          </div>
          <span className="font-bold text-slate-800 text-sm">Alertas de Dívidas</span>
          <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[11px] font-bold rounded-full">
            {alerts.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <i className="ri-close-line text-base" />
        </button>
      </div>

      {/* Summary pills */}
      {(overdue.length > 0 || today.length > 0 || soon.length > 0) && (
        <div className="flex gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
          {overdue.length > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-600 text-[11px] font-bold rounded-full whitespace-nowrap">
              <i className="ri-error-warning-fill text-xs" />
              {overdue.length} vencida{overdue.length > 1 ? "s" : ""}
            </span>
          )}
          {today.length > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-600 text-[11px] font-bold rounded-full whitespace-nowrap">
              <i className="ri-time-fill text-xs" />
              {today.length} hoje
            </span>
          )}
          {soon.length > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-600 text-[11px] font-bold rounded-full whitespace-nowrap">
              <i className="ri-calendar-2-fill text-xs" />
              {soon.length} em breve
            </span>
          )}
        </div>
      )}

      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {alerts.map((alert) => {
          const cfg = LEVEL_CONFIG[alert.level];
          return (
            <div
              key={alert.transaction.id}
              className={`flex items-center gap-3 px-4 py-3 border-b border-slate-50 ${cfg.bg}`}
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <i className={`text-lg ${cfg.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {alert.transaction.description}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {alert.transaction.category} · {fmt(alert.transaction.amount)}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${cfg.badge}`}>
                {getAlertLabel(alert)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3">
        <button
          onClick={() => { onGoToHistory(); onClose(); }}
          className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          Ver no histórico
        </button>
      </div>
    </div>
  );
}
