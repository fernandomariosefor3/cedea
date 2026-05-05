import { useState, useMemo } from "react";
import type { Transaction } from "@/hooks/useTransactions";
import type { DebtAlert } from "@/hooks/useDebtAlerts";
import { getAlertLabel } from "@/hooks/useDebtAlerts";

interface Props {
  transactions: Transaction[];
  onRemove: (id: string) => void;
  debtAlerts: DebtAlert[];
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const TYPE_LABEL: Record<string, string> = {
  receita: "Receita",
  despesa: "Despesa",
  divida: "Dívida",
};

const ALERT_LEVEL_CONFIG = {
  overdue: {
    card: "border-rose-300 bg-rose-50",
    badge: "bg-rose-500 text-white",
    icon: "ri-alarm-warning-fill text-rose-500",
    iconBg: "bg-rose-100",
    pulse: true,
  },
  today: {
    card: "border-amber-300 bg-amber-50",
    badge: "bg-amber-500 text-white",
    icon: "ri-time-fill text-amber-500",
    iconBg: "bg-amber-100",
    pulse: true,
  },
  soon: {
    card: "border-orange-200 bg-orange-50",
    badge: "bg-orange-400 text-white",
    icon: "ri-calendar-event-fill text-orange-400",
    iconBg: "bg-orange-100",
    pulse: false,
  },
};

export default function HistoryView({ transactions, onRemove, debtAlerts }: Props) {
  const [filter, setFilter] = useState<"all" | "receita" | "despesa" | "divida">("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showAlertBanner, setShowAlertBanner] = useState(true);

  const alertMap = useMemo(() => {
    const map: Record<string, DebtAlert> = {};
    debtAlerts.forEach((a) => { map[a.transaction.id] = a; });
    return map;
  }, [debtAlerts]);

  const filtered = filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const alertA = alertMap[a.id];
      const alertB = alertMap[b.id];
      if (alertA && !alertB) return -1;
      if (!alertA && alertB) return 1;
      if (alertA && alertB) return alertA.daysUntilDue - alertB.daysUntilDue;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filtered, alertMap]);

  const handleRemove = (id: string) => {
    onRemove(id);
    setConfirmId(null);
  };

  const overdueCount = debtAlerts.filter((a) => a.level === "overdue").length;
  const todayCount = debtAlerts.filter((a) => a.level === "today").length;
  const soonCount = debtAlerts.filter((a) => a.level === "soon").length;

  return (
    <div className="px-4 py-5 pb-24">
      <h2 className="font-extrabold text-slate-800 text-xl mb-4">Histórico</h2>

      {/* Alert Banner */}
      {debtAlerts.length > 0 && showAlertBanner && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-rose-200 bg-gradient-to-r from-rose-50 to-amber-50">
          <div className="flex items-start gap-3 p-4">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-alarm-warning-fill text-rose-500 text-xl animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-sm mb-1">
                {debtAlerts.length === 1 ? "1 dívida precisa de atenção" : `${debtAlerts.length} dívidas precisam de atenção`}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {overdueCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-700 text-[11px] font-bold rounded-full whitespace-nowrap">
                    <i className="ri-error-warning-fill text-xs" />
                    {overdueCount} vencida{overdueCount > 1 ? "s" : ""}
                  </span>
                )}
                {todayCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full whitespace-nowrap">
                    <i className="ri-time-fill text-xs" />
                    {todayCount} vence hoje
                  </span>
                )}
                {soonCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 text-[11px] font-bold rounded-full whitespace-nowrap">
                    <i className="ri-calendar-2-fill text-xs" />
                    {soonCount} em breve
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowAlertBanner(false)}
              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer flex-shrink-0"
            >
              <i className="ri-close-line text-sm" />
            </button>
          </div>
          {/* Progress bar showing urgency */}
          <div className="h-1 flex">
            {overdueCount > 0 && (
              <div
                className="bg-rose-500 transition-all"
                style={{ width: `${(overdueCount / debtAlerts.length) * 100}%` }}
              />
            )}
            {todayCount > 0 && (
              <div
                className="bg-amber-500 transition-all"
                style={{ width: `${(todayCount / debtAlerts.length) * 100}%` }}
              />
            )}
            {soonCount > 0 && (
              <div
                className="bg-orange-400 transition-all"
                style={{ width: `${(soonCount / debtAlerts.length) * 100}%` }}
              />
            )}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {(["all", "receita", "despesa", "divida"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              filter === f
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {f === "all" ? "Todos" : TYPE_LABEL[f]}
            {f === "divida" && debtAlerts.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                {debtAlerts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {sortedFiltered.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-10 text-center">
          <i className="ri-inbox-line text-4xl text-slate-300 block mb-3" />
          <p className="text-slate-400 text-sm">Nenhuma transação encontrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedFiltered.map((tx) => {
            const alert = alertMap[tx.id];
            const alertCfg = alert ? ALERT_LEVEL_CONFIG[alert.level] : null;

            return (
              <div
                key={tx.id}
                className={`border rounded-xl p-3 flex items-center justify-between gap-3 transition-all ${
                  alertCfg
                    ? `${alertCfg.card} border-2`
                    : "bg-white border-slate-100"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0 relative ${
                    alertCfg ? alertCfg.iconBg :
                    tx.type === "receita" ? "bg-emerald-50" : tx.type === "despesa" ? "bg-rose-50" : "bg-amber-50"
                  }`}>
                    {alertCfg ? (
                      <>
                        <i className={`text-lg ${alertCfg.icon}`} />
                        {alertCfg.pulse && (
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white animate-ping" />
                        )}
                        {alertCfg.pulse && (
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white" />
                        )}
                      </>
                    ) : (
                      <i className={`text-lg ${
                        tx.type === "receita" ? "ri-arrow-up-line text-emerald-500" :
                        tx.type === "despesa" ? "ri-arrow-down-line text-rose-500" :
                        "ri-bank-line text-amber-500"
                      }`} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-800 truncate">{tx.description}</p>
                      {alertCfg && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${alertCfg.badge}`}>
                          {getAlertLabel(alert)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {tx.category} · {new Date(`${tx.date}T12:00:00`).toLocaleDateString("pt-BR")}
                      {tx.dueDate && (
                        <span className={`ml-1.5 ${alertCfg ? "font-semibold text-rose-500" : "text-slate-400"}`}>
                          · Venc. {new Date(`${tx.dueDate}T12:00:00`).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className={`text-sm font-extrabold ${
                    tx.type === "receita" ? "text-emerald-600" :
                    tx.type === "despesa" ? "text-rose-500" : "text-amber-500"
                  }`}>
                    {tx.type === "receita" ? "+" : "-"}{fmt(tx.amount)}
                  </p>

                  {confirmId === tx.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRemove(tx.id)}
                        className="w-7 h-7 flex items-center justify-center bg-rose-500 text-white rounded-lg text-xs cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-check-line" />
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-500 rounded-lg text-xs cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-close-line" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(tx.id)}
                      className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-delete-bin-line" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
