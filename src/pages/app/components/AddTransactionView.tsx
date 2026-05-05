import { useState, FormEvent } from "react";
import type { Transaction, TransactionType } from "@/hooks/useTransactions";

interface Props {
  onAdd: (tx: Omit<Transaction, "id">) => void;
  onDone: () => void;
}

const CATEGORIES = {
  despesa: ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Outros"],
  receita: ["Salário", "Freelance", "Investimentos", "Aluguel", "Outros"],
  divida: ["Cartão de Crédito", "Empréstimo", "Financiamento", "Outros"],
};

const TYPE_CONFIG = {
  receita: { label: "Receita", color: "bg-emerald-500 text-white", inactive: "text-slate-500 hover:bg-slate-100" },
  despesa: { label: "Despesa", color: "bg-rose-500 text-white", inactive: "text-slate-500 hover:bg-slate-100" },
  divida: { label: "Dívida", color: "bg-amber-500 text-white", inactive: "text-slate-500 hover:bg-slate-100" },
};

export default function AddTransactionView({ onAdd, onDone }: Props) {
  const [type, setType] = useState<TransactionType>("despesa");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES.despesa[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [success, setSuccess] = useState(false);

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    setCategory(CATEGORIES[t][0]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(",", "."));
    if (!numAmount || numAmount <= 0) return;
    onAdd({
      type,
      amount: numAmount,
      description: description.trim() || "Sem descrição",
      category,
      date,
      dueDate: dueDate || undefined,
    });
    setAmount("");
    setDescription("");
    setCategory(CATEGORIES[type][0]);
    setDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onDone();
    }, 1200);
  };

  return (
    <div className="px-4 py-5 pb-24">
      <h2 className="font-extrabold text-slate-800 text-xl mb-5">Nova Transação</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-5">
        {/* Type selector */}
        <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
          {(Object.keys(TYPE_CONFIG) as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                type === t ? TYPE_CONFIG[t].color : TYPE_CONFIG[t].inactive
              }`}
            >
              {TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Valor (R$)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="w-full text-3xl font-extrabold text-center text-slate-800 bg-slate-50 border border-slate-200 rounded-xl py-4 outline-none focus:border-emerald-400 transition-colors text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Descrição
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Do que se trata?"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400 transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400 transition-colors cursor-pointer"
          >
            {CATEGORIES[type].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Date row */}
        <div className={`grid gap-3 ${type === "divida" ? "grid-cols-2" : "grid-cols-1"}`}>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400 transition-colors cursor-pointer"
            />
          </div>
          {type === "divida" && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Vencimento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-emerald-400 transition-colors cursor-pointer"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-colors cursor-pointer whitespace-nowrap text-base"
        >
          <span className="flex items-center justify-center gap-2">
            <i className="ri-save-line" /> Salvar Transação
          </span>
        </button>

        {success && (
          <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl py-3 text-sm font-bold">
            <i className="ri-checkbox-circle-line text-lg" /> Salvo com sucesso!
          </div>
        )}
      </form>
    </div>
  );
}
