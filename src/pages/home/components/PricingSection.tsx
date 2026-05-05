import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const features = [
  "Gráfico de pizza mensal em tempo real",
  "Categorias ilimitadas de gastos",
  "Histórico completo de transações",
  "Exportação em CSV",
  "Login com Google",
  "Dados salvos na nuvem",
  "Relatórios mensais detalhados",
  "Suporte prioritário por e-mail",
];

const freeFeatures = [
  "Até 15 transações por mês",
  "Gráfico de pizza básico",
  "Histórico dos últimos 30 dias",
];

export default function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubscribe = async (billingType: "monthly" | "annual") => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Ensure user has a session
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
          cancelUrl: `${window.location.origin}/#pricing`,
        }),
      });

      const data = await response.json();
      if (data.url) {
        // Use top-level navigation to escape iframe in preview environments
        const target = window.top || window;
        target.location.href = data.url;
      } else {
        throw new Error(data.error || "Erro ao criar sessão de pagamento");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full uppercase tracking-widest mb-4">
            Planos & Preços
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Simples assim. Sem surpresas.
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Comece grátis e faça upgrade quando quiser ter controle total das suas finanças.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-full px-1 py-1 mt-8">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                billing === "monthly"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                billing === "annual"
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Anual
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${billing === "annual" ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                -34%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Free */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Grátis</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-extrabold text-slate-900">R$ 0</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">Para sempre gratuito</p>

            <Link
              to="/auth"
              className="block w-full py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-400 transition-all duration-200 text-sm whitespace-nowrap cursor-pointer mb-8 text-center"
            >
              Começar grátis
            </Link>

            <ul className="space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <i className="ri-check-line text-slate-400 text-base" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro — destaque */}
          <div className="relative bg-slate-900 rounded-2xl p-8 shadow-xl scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-block bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                Mais Popular
              </span>
            </div>

            <p className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-2">Pro</p>

            <div className="flex items-end gap-1 mb-1">
              {billing === "monthly" ? (
                <>
                  <span className="text-4xl font-extrabold text-white">R$ 9</span>
                  <span className="text-2xl font-bold text-white">,99</span>
                  <span className="text-slate-400 text-sm mb-1">/mês</span>
                </>
              ) : (
                <>
                  <span className="text-4xl font-extrabold text-white">R$ 78</span>
                  <span className="text-2xl font-bold text-white">,99</span>
                  <span className="text-slate-400 text-sm mb-1">/ano</span>
                </>
              )}
            </div>

            {billing === "annual" && (
              <p className="text-emerald-400 text-xs font-medium mb-6">
                Equivale a R$ 6,58/mês — você economiza R$ 40,89!
              </p>
            )}
            {billing === "monthly" && (
              <p className="text-slate-500 text-xs mb-6">Cancele a qualquer momento</p>
            )}

            <button
              onClick={() => handleSubscribe(billing)}
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 text-sm whitespace-nowrap cursor-pointer mb-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Aguarde...
                </>
              ) : (
                billing === "annual" ? "Assinar Plano Anual" : "Assinar Plano Mensal"
              )}
            </button>
            {errorMsg && (
              <p className="text-red-400 text-xs text-center mb-6 px-2">{errorMsg}</p>
            )}
            {!errorMsg && <div className="mb-6" />}

            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <i className="ri-check-line text-emerald-400 text-base" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Empresas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Empresas</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-extrabold text-slate-900">Custom</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">Preço sob consulta</p>

            <button
              onClick={() => {
                const el = document.getElementById("contact");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full py-3 border-2 border-emerald-200 text-emerald-600 font-semibold rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200 text-sm whitespace-nowrap cursor-pointer mb-8"
            >
              Falar com a equipe
            </button>

            <ul className="space-y-3">
              {[
                "Tudo do plano Pro",
                "Multi-usuários",
                "Relatórios corporativos",
                "Integração com ERP",
                "SLA e suporte dedicado",
                "Onboarding personalizado",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="w-5 h-5 flex items-center justify-center shrink-0">
                    <i className="ri-check-line text-slate-400 text-base" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <i className="ri-shield-check-line text-green-500 text-lg" />
            <span>Pagamento 100% seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-refund-2-line text-emerald-500 text-lg" />
            <span>7 dias de garantia</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-lock-line text-slate-500 text-lg" />
            <span>Cancele quando quiser</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-customer-service-2-line text-rose-500 text-lg" />
            <span>Suporte em português</span>
          </div>
        </div>
      </div>
    </section>
  );
}
