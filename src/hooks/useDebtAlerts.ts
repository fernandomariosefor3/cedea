import { useMemo } from "react";
import type { Transaction } from "@/hooks/useTransactions";

export type DebtAlertLevel = "overdue" | "today" | "soon";

export interface DebtAlert {
  transaction: Transaction;
  level: DebtAlertLevel;
  daysUntilDue: number;
}

export function useDebtAlerts(transactions: Transaction[]): DebtAlert[] {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return transactions
      .filter((t) => t.type === "divida" && Boolean(t.dueDate))
      .map((t) => {
        const due = new Date(`${t.dueDate}T12:00:00`);
        const diffMs = due.getTime() - today.getTime();
        const daysUntilDue = Math.round(diffMs / (1000 * 60 * 60 * 24));

        let level: DebtAlertLevel | null = null;
        if (daysUntilDue < 0) level = "overdue";
        else if (daysUntilDue === 0) level = "today";
        else if (daysUntilDue <= 5) level = "soon";

        if (!level) return null;
        return { transaction: t, level, daysUntilDue };
      })
      .filter((a): a is DebtAlert => a !== null)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [transactions]);
}

export function getAlertLabel(alert: DebtAlert): string {
  if (alert.level === "overdue") {
    const days = Math.abs(alert.daysUntilDue);
    return days === 1 ? "Venceu ontem" : `Venceu há ${days} dias`;
  }
  if (alert.level === "today") return "Vence hoje!";
  if (alert.daysUntilDue === 1) return "Vence amanhã";
  return `Vence em ${alert.daysUntilDue} dias`;
}
