import { useState } from "react";
import { supabase } from "@/lib/supabase";

const proFeatures = [
  "Transações ilimitadas todo mês",
  "Histórico completo sem data limite",
  "Categorias ilimitadas",
  "Exportação em CSV",
  "Dados salvos na nuvem",
  "Relatórios mensais detalhados",
  "Suporte prioritário",
];

interface UpgradeProModalProps {
  onClose: () => void;
  transactionCount: number;
}

export default function UpgradeProModal({ onClose, transactionCount }: UpgradeProModalProps) {
  const [loading, setLoading] = useState(false);
  const [billingType, setBillingType] = useState<"annual" | "monthly">("annual");

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id;

      if (!userId) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error || !data.user) throw new Error("Falha ao criar sessão");
        userId = data.user.id;
      }

      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing: billingType,
          userId,
          successUrl: `${window.location.origin}/app`,
          cancelUrl: `${window.location.origin}/app`,
        }),
      });

      const data = await response.json();
      if (data.url) {
        const target = window.top || window;
        target.location.href = data.url;
      } else {
        throw new Error(data.error || "Erro ao criar sessão de pagamento");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden">
        {/* Top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

        <div className="px-6 pt-6 pb-8">
          {/* Icon */}
          <div className="w-16 h-16 flex items-center justify-center bg-emerald-50 rounded-2xl mx-auto mb-5">
            <i className="ri-vip-crown-2-line text-3xl text-emerald-600" />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">
              Você atingiu o limite gratuito!
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Você já registrou <strong className="text-slate-800">{transactionCount} transações</strong> este mês.
              O plano gratuito permite até <strong className="text-slate-800">15</strong>. Faça upgrade e
              use sem limites!
            </p>
          </div>

          {/* Billing selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setBillingType("annual")}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer whitespace-nowrap ${
                billingType === "annual"
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 text-slate-600 hover:border-emerald-300"
              }`}
            >
              Anual — R$ 78,99
              <span className="block text-xs font-normal opacity-80">R$ 6,58/mês · -34%</span>
            </button>
            <button
              onClick={() => setBillingType("monthly")}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer whitespace-nowrap ${
                billingType === "monthly"
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 text-slate-600 hover:border-emerald-300"
              }`}
            >
              Mensal — R$ 9,99
              <span className="block text-xs font-normal opacity-80">Cancele quando quiser</span>
            </button>
          </div>

          {/* Features list */}
          <ul className="space-y-2.5 mb-6">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="w-5 h-5 flex items-center justify-center shrink-0 bg-emerald-50 rounded-full">
                  <i className="ri-check-line text-emerald-600 text-xs" />
                </span>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 text-sm whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Aguarde...
                </>
              ) : (
                <>
                  <i className="ri-vip-crown-2-line" />
                  {billingType === "annual" ? "Assinar por R$ 78,99/ano" : "Assinar por R$ 9,99/mês"}
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-slate-400 text-sm font-medium hover:text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Continuar no plano gratuito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
