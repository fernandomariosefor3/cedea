import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Transaction } from "@/hooks/useTransactions";
import { useProStatus } from "@/hooks/useProStatus";

interface Props {
  transactions: Transaction[];
  getMonthlyStats: (month?: string) => { income: number; expenses: number; debts: number; balance: number };
  getCategoryData: (month?: string) => { name: string; value: number }[];
  onNavigateAdd: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Alimentação: "#f97316",
  Transporte: "#14b8a6",
  Moradia: "#f43f5e",
  Saúde: "#10b981",
  Educação: "#f59e0b",
  Lazer: "#ec4899",
  Outros: "#94a3b8",
};
const FALLBACK_COLORS = ["#f97316", "#14b8a6", "#f43f5e", "#10b981", "#f59e0b", "#ec4899", "#94a3b8"];

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const OVERVIEW_COLORS = ["#10b981", "#f43f5e", "#f97316"];

export default function DashboardView({ transactions, getMonthlyStats, getCategoryData, onNavigateAdd }: Props) {
  const { isPro, FREE_MONTHLY_LIMIT } = useProStatus();
  const stats = getMonthlyStats();
  const categoryData = getCategoryData();
  const recent = transactions.slice(0, 5);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyCount = transactions.filter((t) => t.date.startsWith(currentMonth)).length;
  const usagePercent = Math.min((monthlyCount / FREE_MONTHLY_LIMIT) * 100, 100);

  const showBanner = !isPro && monthlyCount >= 10;
  const isFull = monthlyCount >= FREE_MONTHLY_LIMIT;
  const isDanger = monthlyCount >= 13;

  const bannerConfig = isFull
    ? {
        bg: "bg-rose-50 border-rose-200",
        bar: "bg-rose-500",
        text: "text-rose-700",
        subtext: "text-rose-500",
        icon: "ri-error-warning-fill text-rose-500",
        label: "Limite atingido! Faça upgrade para continuar.",
        btn: "bg-rose-500 hover:bg-rose-600 text-white",
      }
    : isDanger
    ? {
        bg: "bg-amber-50 border-amber-200",
        bar: "bg-amber-500",
        text: "text-amber-800",
        subtext: "text-amber-500",
        icon: "ri-alarm-warning-fill text-amber-500",
        label: `Quase lá! Só mais ${FREE_MONTHLY_LIMIT - monthlyCount} transação${FREE_MONTHLY_LIMIT - monthlyCount > 1 ? "ões" : ""} disponível${FREE_MONTHLY_LIMIT - monthlyCount > 1 ? "ões" : ""}.`,
        btn: "bg-amber-500 hover:bg-amber-600 text-white",
      }
    : {
        bg: "bg-emerald-50 border-emerald-200",
        bar: "bg-emerald-500",
        text: "text-emerald-700",
        subtext: "text-emerald-400",
        icon: "ri-information-fill text-emerald-400",
        label: `Você usou ${monthlyCount} de ${FREE_MONTHLY_LIMIT} transações este mês.`,
        btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
      };

  const overviewData = [
    { name: "Receitas", value: stats.income },
    { name: "Despesas", value: stats.expenses },
    { name: "Dívidas", value: stats.debts },
  ].filter((d) => d.value > 0);

  const hasData = overviewData.length > 0;
  const hasCategoryData = categoryData.length > 0;

  const now = new Date();
  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="px-4 py-5 pb-24 space-y-5">

      {/* Usage banner */}
      {showBanner && (
        <div className={`rounded-2xl border p-4 ${bannerConfig.bg}`}>
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center shrink-0">
                <i className={`${bannerConfig.icon} text-base`} />
              </span>
              <p className={`text-xs font-semibold leading-snug ${bannerConfig.text}`}>
                {bannerConfig.label}
              </p>
            </div>
            <button
              onClick={onNavigateAdd}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${bannerConfig.btn}`}
            >
              Fazer upgrade
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/70 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${bannerConfig.bar}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <span className={`text-[11px] font-bold shrink-0 ${bannerConfig.text}`}>
              {monthlyCount}/{FREE_MONTHLY_LIMIT}
            </span>
          </div>
        </div>
      )}

      {/* Month label */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-800 text-base capitalize">{monthLabel}</h2>
        <span className="text-xs text-slate-400 font-medium">{transactions.length} transações</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Receitas", value: stats.income, color: "text-emerald-600", bg: "bg-emerald-50", icon: "ri-arrow-up-circle-line" },
          { label: "Despesas", value: stats.expenses, color: "text-rose-500", bg: "bg-rose-50", icon: "ri-arrow-down-circle-line" },
          { label: "Dívidas", value: stats.debts, color: "text-amber-500", bg: "bg-amber-50", icon: "ri-error-warning-line" },
          { label: "Saldo", value: stats.balance, color: stats.balance >= 0 ? "text-emerald-600" : "text-rose-600", bg: "bg-emerald-50", icon: "ri-wallet-3-line" },
        ].map((c) => (
          <div key={c.label} className={`${c.bg} rounded-2xl p-4`}>
            <div className="flex items-center gap-1.5 mb-1">
              <i className={`${c.icon} ${c.color} text-sm`} />
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</p>
            </div>
            <p className={`text-base font-extrabold ${c.color} truncate`}>{fmt(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Overview Pie Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <h3 className="font-bold text-slate-700 text-sm mb-1">Situação Financeira do Mês</h3>
        <p className="text-xs text-slate-400 mb-4">Visão geral das suas finanças</p>

        {hasData ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={overviewData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {overviewData.map((entry, index) => (
                  <Cell key={entry.name} fill={OVERVIEW_COLORS[index % OVERVIEW_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number) => [fmt(val), ""]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ fontSize: "12px", color: "#64748b" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-emerald-50 rounded-full mb-3">
              <i className="ri-pie-chart-2-line text-emerald-400 text-2xl" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Nenhum dado ainda</p>
            <p className="text-slate-400 text-xs mt-1">Adicione transações para ver seu gráfico</p>
            <button
              onClick={onNavigateAdd}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-full cursor-pointer whitespace-nowrap"
            >
              Adicionar agora
            </button>
          </div>
        )}
      </div>

      {/* Category Pie Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <h3 className="font-bold text-slate-700 text-sm mb-1">Gastos por Categoria</h3>
        <p className="text-xs text-slate-400 mb-4">Distribuição das suas despesas</p>

        {hasCategoryData ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={CATEGORY_COLORS[entry.name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number) => [fmt(val), ""]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <p className="text-slate-400 text-sm">Adicione despesas para ver a distribuição</p>
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <div>
        <h3 className="font-bold text-slate-700 text-sm mb-3">Transações Recentes</h3>
        {recent.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-6 text-center">
            <p className="text-slate-400 text-sm">Nenhuma transação ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((tx) => (
              <div key={tx.id} className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                    tx.type === "receita" ? "bg-emerald-50" : tx.type === "despesa" ? "bg-rose-50" : "bg-amber-50"
                  }`}>
                    <i className={`text-lg ${
                      tx.type === "receita" ? "ri-arrow-up-line text-emerald-500" :
                      tx.type === "despesa" ? "ri-arrow-down-line text-rose-500" :
                      "ri-bank-line text-amber-500"
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[140px]">{tx.description}</p>
                    <p className="text-[11px] text-slate-400">{tx.category}</p>
                  </div>
                </div>
                <p className={`text-sm font-extrabold ${
                  tx.type === "receita" ? "text-emerald-600" :
                  tx.type === "despesa" ? "text-rose-500" : "text-amber-500"
                }`}>
                  {tx.type === "receita" ? "+" : "-"}{fmt(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
