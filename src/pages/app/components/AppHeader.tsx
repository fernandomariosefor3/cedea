import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProStatus } from "@/hooks/useProStatus";
import type { DebtAlert } from "@/hooks/useDebtAlerts";
import DebtAlertsPanel from "@/pages/app/components/DebtAlertsPanel";

interface Props {
  debtAlerts: DebtAlert[];
  onGoToHistory: () => void;
}

export default function AppHeader({ debtAlerts, onGoToHistory }: Props) {
  const navigate = useNavigate();
  const { isPro } = useProStatus();
  const [showPanel, setShowPanel] = useState(false);

  const urgentCount = debtAlerts.filter(
    (a) => a.level === "overdue" || a.level === "today"
  ).length;

  return (
    <header className="h-14 bg-emerald-600 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <span className="text-white font-extrabold text-xl tracking-tight">emdia</span>
        {isPro ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full whitespace-nowrap">
            <i className="ri-vip-crown-2-fill text-xs" />
            PRO
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 bg-white/15 text-white/70 text-xs font-medium rounded-full whitespace-nowrap">
            Grátis
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowPanel((v) => !v)}
            title="Alertas de dívidas"
            className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10 relative whitespace-nowrap"
          >
            <i className={`ri-notification-3-line text-xl ${debtAlerts.length > 0 ? "text-white" : "text-white/60"}`} />
            {debtAlerts.length > 0 && (
              <>
                <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold bg-rose-500 text-white border border-emerald-600">
                  {debtAlerts.length > 9 ? "9+" : debtAlerts.length}
                </span>
                {urgentCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 animate-ping opacity-70" />
                )}
              </>
            )}
          </button>

          {showPanel && (
            <DebtAlertsPanel
              alerts={debtAlerts}
              onClose={() => setShowPanel(false)}
              onGoToHistory={onGoToHistory}
            />
          )}
        </div>

        <button
          onClick={() => navigate("/")}
          title="Voltar ao site"
          className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/10 whitespace-nowrap"
        >
          <i className="ri-home-4-line text-xl" />
        </button>
      </div>
    </header>
  );
}
