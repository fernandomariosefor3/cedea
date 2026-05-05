import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type TransactionType = "receita" | "despesa" | "divida";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  dueDate?: string;
}

export function useTransactions(userId: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) {
      setTransactions(
        data.map((r) => ({
          id: r.id,
          type: r.type as TransactionType,
          amount: Number(r.amount),
          description: r.description,
          category: r.category,
          date: r.date,
          dueDate: r.due_date ?? undefined,
        }))
      );
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const addTransaction = async (tx: Omit<Transaction, "id">) => {
    if (!userId) return;
    const { data, error } = await supabase.from("transactions").insert({
      user_id: userId,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      category: tx.category,
      date: tx.date,
      due_date: tx.dueDate ?? null,
    }).select().maybeSingle();
    if (!error && data) {
      const newTx: Transaction = {
        id: data.id,
        type: data.type,
        amount: Number(data.amount),
        description: data.description,
        category: data.category,
        date: data.date,
        dueDate: data.due_date ?? undefined,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const removeTransaction = async (id: string) => {
    if (!userId) return;
    await supabase.from("transactions").delete().eq("id", id).eq("user_id", userId);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAll = async () => {
    if (!userId) return;
    await supabase.from("transactions").delete().eq("user_id", userId);
    setTransactions([]);
  };

  const getMonthlyStats = (month?: string) => {
    const now = month ?? new Date().toISOString().slice(0, 7);
    const monthly = transactions.filter((t) => t.date.startsWith(now));
    const income = monthly.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0);
    const expenses = monthly.filter((t) => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
    const debts = monthly.filter((t) => t.type === "divida").reduce((s, t) => s + t.amount, 0);
    return { income, expenses, debts, balance: income - expenses - debts };
  };

  const getCategoryData = (month?: string) => {
    const now = month ?? new Date().toISOString().slice(0, 7);
    const monthly = transactions.filter((t) => t.date.startsWith(now) && t.type === "despesa");
    const map: Record<string, number> = {};
    monthly.forEach((t) => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  return { transactions, loading, addTransaction, removeTransaction, clearAll, getMonthlyStats, getCategoryData };
}
