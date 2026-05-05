import { useState } from "react";
import type { Transaction } from "@/hooks/useTransactions";

interface Props {
  transactions: Transaction[];
  onClearAll: () => void;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function SettingsView({ transactions, onClearAll }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const header = "ID,Tipo,Descrição,Categoria,Valor,Data,Vencimento";
    const rows = transactions.map((t) =>
      [t.id, t.type, `"${t.description}"`, t.category, t.amount.toFixed(2), t.date, t.dueDate ?? ""].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emdia_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const total = transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="px-4 py-5 pb-24">
      <h2 className="font-extrabold text-slate-800 text-xl mb-5">Ajustes</h2>

      {/* Login com Google - placeholder */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 mb-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-xl">
            <i className="ri-google-line text-white text-xl" />
          </div>
          <div>
            <p className="font-bold text-sm">Login com Google</p>
            <p className="text-white/70 text-xs">Salve seus dados na nuvem</p>
          </div>
        </div>
        <p className="text-white/80 text-xs leading-relaxed mb-3">
          Conecte sua conta Google para sincronizar suas finanças em qualquer dispositivo com segurança.
        </p>
        <div className="inline-flex items-center gap-1.5 bg-white/20 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full">
          <i className="ri-time-line" /> Em breve — integração em andamento
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-5">
        <h3 className="font-bold text-slate-700 text-sm mb-3">Resumo Geral</h3>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-2xl font-extrabold text-emerald-600">{transactions.length}</p>
            <p className="text-xs text-slate-400">Transações</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-lg font-extrabold text-emerald-600 truncate">{fmt(total)}</p>
            <p className="text-xs text-slate-400">Valor Total</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={exportCSV}
          disabled={transactions.length === 0}
          className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-left font-bold flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-emerald-50 rounded-xl">
              <i className="ri-download-line text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Exportar CSV</p>
              <p className="text-xs text-slate-400">{transactions.length} transações</p>
            </div>
          </div>
          <i className="ri-arrow-right-s-line text-slate-400" />
        </button>

        <button
          onClick={() => setShowConfirm(true)}
          className="w-full p-4 bg-rose-50 border border-rose-100 rounded-2xl text-left font-bold flex items-center justify-between cursor-pointer hover:bg-rose-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-rose-100 rounded-xl">
              <i className="ri-delete-bin-line text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-600">Apagar Tudo</p>
              <p className="text-xs text-rose-400">Ação irreversível</p>
            </div>
          </div>
          <i className="ri-arrow-right-s-line text-rose-300" />
        </button>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white w-full rounded-t-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
            <h3 className="font-extrabold text-slate-800 text-lg mb-2">Apagar tudo?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Todas as suas transações serão removidas permanentemente. Essa ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={() => { onClearAll(); setShowConfirm(false); }}
                className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl cursor-pointer whitespace-nowrap"
              >
                Sim, apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
