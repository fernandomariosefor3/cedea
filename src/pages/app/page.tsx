import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppHeader from "@/pages/app/components/AppHeader";
import BottomNav from "@/pages/app/components/BottomNav";
import type { View } from "@/pages/app/components/BottomNav";
import DashboardView from "@/pages/app/components/DashboardView";
import AddTransactionView from "@/pages/app/components/AddTransactionView";
import HistoryView from "@/pages/app/components/HistoryView";
import SettingsView from "@/pages/app/components/SettingsView";
import ProfileView from "@/pages/app/components/ProfileView";
import Onboarding from "@/pages/app/components/Onboarding";
import UpgradeProModal from "@/pages/app/components/UpgradeProModal";
import { useTransactions } from "@/hooks/useTransactions";
import { useProStatus } from "@/hooks/useProStatus";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDebtAlerts } from "@/hooks/useDebtAlerts";
import { usePageSEO } from "@/hooks/usePageSEO";
import { supabase } from "@/lib/supabase";

export default function AppPage() {
  usePageSEO({
    title: "Dashboard — emdia",
    description: "Painel de controle financeiro pessoal do emdia.",
    canonicalPath: "/app",
    robots: "noindex, nofollow",
  });

  const navigate = useNavigate();
  const [view, setView] = useState<View>("dashboard");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        setAuthLoading(false);
      } else {
        // Not logged in — redirect to auth
        navigate("/auth");
      }
    });

    // Listen for auth state changes (e.g. after Google OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        setAuthLoading(false);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { transactions, loading: txLoading, addTransaction, removeTransaction, clearAll, getMonthlyStats, getCategoryData } =
    useTransactions(userId);
  const { isPro, onboardingDone, settingsLoaded, finishOnboarding, FREE_MONTHLY_LIMIT, activatePro } = useProStatus(userId);
  const { profile, updateProfile, initials } = useUserProfile(userId);
  const debtAlerts = useDebtAlerts(transactions);

  // Handle payment success redirect from Stripe
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment === "success" && sessionId && userId) {
      activatePro().then(() => {
        setShowPaymentSuccess(true);
        setSearchParams({});
        setTimeout(() => setShowPaymentSuccess(false), 5000);
      });
    }
  }, [searchParams, userId, activatePro, setSearchParams]);

  const isLoading = authLoading || txLoading || !settingsLoaded;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyCount = transactions.filter((t) => t.date.startsWith(currentMonth)).length;

  const handleAdd = (tx: Parameters<typeof addTransaction>[0]) => {
    if (!isPro && monthlyCount >= FREE_MONTHLY_LIMIT) { setShowUpgrade(true); return; }
    addTransaction(tx);
  };

  const handleNavigateAdd = () => {
    if (!isPro && monthlyCount >= FREE_MONTHLY_LIMIT) { setShowUpgrade(true); return; }
    setView("add");
  };

  const handleExportCSV = () => {
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

  const handleResetApp = async () => {
    await clearAll();
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!onboardingDone && <Onboarding onFinish={finishOnboarding} />}
      {showUpgrade && (
        <UpgradeProModal onClose={() => setShowUpgrade(false)} transactionCount={monthlyCount} />
      )}

      {/* Payment success toast */}
      {showPaymentSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 animate-bounce">
          <i className="ri-vip-crown-2-line text-xl" />
          <div>
            <p className="font-bold text-sm">Bem-vindo ao Pro!</p>
            <p className="text-xs text-green-100">Seu plano foi ativado com sucesso.</p>
          </div>
          <button onClick={() => setShowPaymentSuccess(false)} className="ml-2 cursor-pointer">
            <i className="ri-close-line" />
          </button>
        </div>
      )}

      <AppHeader debtAlerts={debtAlerts} onGoToHistory={() => setView("history")} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto w-full">
          {view === "dashboard" && (
            <DashboardView
              transactions={transactions}
              getMonthlyStats={getMonthlyStats}
              getCategoryData={getCategoryData}
              onNavigateAdd={handleNavigateAdd}
            />
          )}
          {view === "add" && (
            <AddTransactionView onAdd={handleAdd} onDone={() => setView("dashboard")} />
          )}
          {view === "history" && (
            <HistoryView transactions={transactions} onRemove={removeTransaction} debtAlerts={debtAlerts} />
          )}
          {view === "settings" && (
            <SettingsView transactions={transactions} onClearAll={clearAll} />
          )}
          {view === "profile" && (
            <ProfileView
              transactions={transactions}
              profile={profile}
              updateProfile={updateProfile}
              initials={initials}
              onResetApp={handleResetApp}
              onExportCSV={handleExportCSV}
              userId={userId}
              isPro={isPro}
            />
          )}
        </div>
      </main>

      <BottomNav active={view} onNavigate={setView} avatarColor={profile.avatarColor} initials={initials} />
    </div>
  );
}
