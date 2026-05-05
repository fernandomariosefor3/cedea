import { useState, useRef, useCallback } from "react";

/* ─── Preview illustrations ─── */

function WelcomePreview() {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Floating coins */}
      <div className="absolute top-4 left-8 onboarding-float-up" style={{ animationDelay: "0s" }}>
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-100">
          <i className="ri-money-dollar-circle-fill text-emerald-500 text-xl" />
        </div>
      </div>
      <div className="absolute top-2 right-6 onboarding-float-down" style={{ animationDelay: "0.4s" }}>
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100">
          <i className="ri-coin-fill text-amber-500 text-lg" />
        </div>
      </div>
      <div className="absolute bottom-6 left-4 onboarding-float-down" style={{ animationDelay: "0.8s" }}>
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-100">
          <i className="ri-bar-chart-fill text-indigo-500 text-lg" />
        </div>
      </div>
      <div className="absolute bottom-4 right-8 onboarding-float-up" style={{ animationDelay: "1.2s" }}>
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-100">
          <i className="ri-wallet-3-fill text-rose-500 text-lg" />
        </div>
      </div>
      {/* Center logo */}
      <div className="relative flex flex-col items-center onboarding-scale-in">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-indigo-400/30 onboarding-pulse-ring" />
          <div className="w-24 h-24 flex items-center justify-center rounded-3xl bg-indigo-600 shadow-lg">
            <i className="ri-pie-chart-2-fill text-white text-4xl" />
          </div>
        </div>
        <p className="mt-4 text-2xl font-extrabold text-slate-800 tracking-tight">Em Dia</p>
        <p className="text-xs font-semibold text-indigo-500 tracking-widest uppercase">controle financeiro</p>
      </div>
    </div>
  );
}

function DashboardPreview() {
  const cards = [
    { label: "Receitas",  value: "R$ 3.200", color: "text-emerald-600", bg: "bg-emerald-50", icon: "ri-arrow-up-circle-line" },
    { label: "Despesas",  value: "R$ 1.840", color: "text-rose-500",    bg: "bg-rose-50",   icon: "ri-arrow-down-circle-line" },
    { label: "Dívidas",   value: "R$ 450",   color: "text-amber-500",   bg: "bg-amber-50",  icon: "ri-error-warning-line" },
    { label: "Saldo",     value: "R$ 910",   color: "text-indigo-600",  bg: "bg-indigo-50", icon: "ri-wallet-3-line" },
  ];
  return (
    <div className="w-full space-y-3 onboarding-scale-in">
      {/* Mini bar */}
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2 rounded-full bg-indigo-200 flex-1 overflow-hidden">
          <div className="h-full rounded-full bg-indigo-500" style={{ width: "74%" }} />
        </div>
        <span className="text-xs font-bold text-indigo-600">74% saldo</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className={`${c.bg} rounded-xl p-3 onboarding-fade-up`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="flex items-center gap-1 mb-1">
              <i className={`${c.icon} ${c.color} text-xs`} />
              <p className="text-[10px] font-bold text-slate-400 uppercase">{c.label}</p>
            </div>
            <p className={`text-sm font-extrabold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
      {/* Donut hint */}
      <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 44 44" className="w-12 h-12 -rotate-90">
            <circle cx="22" cy="22" r="16" fill="none" stroke="#e2e8f0" strokeWidth="6" />
            <circle cx="22" cy="22" r="16" fill="none" stroke="#10b981" strokeWidth="6"
              strokeDasharray="60 40" strokeLinecap="round" />
            <circle cx="22" cy="22" r="16" fill="none" stroke="#f43f5e" strokeWidth="6"
              strokeDasharray="25 75" strokeDashoffset="-60" strokeLinecap="round" />
            <circle cx="22" cy="22" r="16" fill="none" stroke="#f97316" strokeWidth="6"
              strokeDasharray="15 85" strokeDashoffset="-85" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1 space-y-1">
          {[["Receitas","bg-emerald-500","60%"],["Despesas","bg-rose-500","25%"],["Dívidas","bg-orange-500","15%"]].map(([label, color, pct]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[10px] text-slate-500 flex-1">{label}</span>
              <span className="text-[10px] font-bold text-slate-600">{pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddPreview() {
  return (
    <div className="w-full onboarding-scale-in">
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
        {/* Type selector */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {[
            { label: "Receita",  color: "bg-emerald-500 text-white", active: false },
            { label: "Despesa",  color: "bg-rose-500 text-white",    active: true  },
            { label: "Dívida",   color: "bg-amber-500 text-white",   active: false },
          ].map((t, i) => (
            <div
              key={t.label}
              className={`flex-1 text-center py-1.5 rounded-lg text-[11px] font-bold transition-all onboarding-fade-up ${
                t.active ? t.color : "text-slate-400"
              }`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {t.label}
            </div>
          ))}
        </div>
        {/* Amount */}
        <div className="onboarding-fade-up" style={{ animationDelay: "0.15s" }}>
          <p className="text-[10px] text-slate-400 mb-1 font-medium">Valor</p>
          <div className="bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-xs font-bold text-rose-400">R$</span>
            <span className="text-base font-extrabold text-rose-600">150,00</span>
            <div className="ml-auto w-0.5 h-4 bg-rose-400 animate-pulse" />
          </div>
        </div>
        {/* Description */}
        <div className="onboarding-fade-up" style={{ animationDelay: "0.22s" }}>
          <p className="text-[10px] text-slate-400 mb-1 font-medium">Descrição</p>
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
            <span className="text-xs text-slate-600">Mercado da semana</span>
          </div>
        </div>
        {/* Categories */}
        <div className="onboarding-fade-up" style={{ animationDelay: "0.3s" }}>
          <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Categoria</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              ["Alimentação", true],
              ["Transporte", false],
              ["Moradia", false],
              ["Saúde", false],
            ].map(([cat, active]) => (
              <div
                key={cat as string}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                  active ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {cat as string}
              </div>
            ))}
          </div>
        </div>
        {/* Button */}
        <div className="onboarding-fade-up" style={{ animationDelay: "0.38s" }}>
          <div className="w-full py-2.5 bg-rose-500 rounded-xl text-center text-xs font-bold text-white">
            Salvar transação
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryPreview() {
  const txs = [
    { icon: "ri-arrow-up-line",   bg: "bg-emerald-50", color: "text-emerald-500", desc: "Salário",          cat: "Receita",     val: "+R$ 3.200", valColor: "text-emerald-600" },
    { icon: "ri-arrow-down-line", bg: "bg-rose-50",    color: "text-rose-500",    desc: "Mercado",          cat: "Alimentação", val: "-R$ 150",   valColor: "text-rose-500" },
    { icon: "ri-arrow-down-line", bg: "bg-rose-50",    color: "text-rose-500",    desc: "Uber",             cat: "Transporte",  val: "-R$ 28",    valColor: "text-rose-500" },
    { icon: "ri-bank-line",       bg: "bg-amber-50",   color: "text-amber-500",   desc: "Cartão de crédito",cat: "Dívida",      val: "-R$ 450",   valColor: "text-amber-500" },
  ];
  return (
    <div className="w-full space-y-2 onboarding-scale-in">
      {/* Filter pills */}
      <div className="flex gap-1.5 mb-1">
        {["Todos","Receitas","Despesas","Dívidas"].map((f, i) => (
          <div
            key={f}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold onboarding-fade-up ${
              i === 0 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
            }`}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {f}
          </div>
        ))}
      </div>
      {txs.map((tx, i) => (
        <div
          key={tx.desc}
          className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center justify-between onboarding-fade-up"
          style={{ animationDelay: `${0.1 + i * 0.08}s` }}
        >
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${tx.bg}`}>
              <i className={`${tx.icon} ${tx.color} text-sm`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">{tx.desc}</p>
              <p className="text-[10px] text-slate-400">{tx.cat}</p>
            </div>
          </div>
          <p className={`text-xs font-extrabold ${tx.valColor}`}>{tx.val}</p>
        </div>
      ))}
    </div>
  );
}

function StartPreview() {
  const features = [
    "Gráficos automáticos do seu mês",
    "Até 15 transações gratuitas",
    "Histórico completo com filtros",
    "Sincronização com Google",
    "Ilimitado no plano Pro ⚡",
  ];
  return (
    <div className="w-full onboarding-scale-in">
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-indigo-600">
            <i className="ri-star-fill text-white text-sm" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-800">Plano Gratuito</p>
            <p className="text-[10px] text-slate-400">Comece agora, sem cartão</p>
          </div>
          <div className="ml-auto bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            GRÁTIS
          </div>
        </div>
        {features.map((f, i) => (
          <div
            key={f}
            className={`flex items-center gap-2 onboarding-fade-up`}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className={`w-4 h-4 flex items-center justify-center rounded-full shrink-0 ${
              i === features.length - 1 ? "bg-indigo-100" : "bg-emerald-100"
            }`}>
              <i className={`text-[9px] ${
                i === features.length - 1 ? "ri-flashlight-fill text-indigo-500" : "ri-check-line text-emerald-600"
              }`} />
            </div>
            <p className={`text-[11px] ${
              i === features.length - 1 ? "font-bold text-indigo-600" : "text-slate-600"
            }`}>{f}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Step definitions ─── */

const STEPS = [
  {
    id: "welcome",
    gradient: "from-indigo-50 to-white",
    accent: "bg-indigo-600",
    title: "Bem-vindo ao Em Dia!",
    subtitle: "Seu controle financeiro pessoal, simples e poderoso.",
    preview: <WelcomePreview />,
  },
  {
    id: "dashboard",
    gradient: "from-emerald-50 to-white",
    accent: "bg-emerald-500",
    title: "Veja sua situação financeira",
    subtitle: "Gráficos e resumos automáticos do seu mês, sempre atualizados.",
    preview: <DashboardPreview />,
  },
  {
    id: "add",
    gradient: "from-rose-50 to-white",
    accent: "bg-rose-500",
    title: "Registre em segundos",
    subtitle: "Toque em + e registre qualquer movimentação com facilidade.",
    preview: <AddPreview />,
  },
  {
    id: "history",
    gradient: "from-amber-50 to-white",
    accent: "bg-amber-500",
    title: "Acompanhe tudo no histórico",
    subtitle: "Filtre por tipo, veja tendências e tome decisões melhores.",
    preview: <HistoryPreview />,
  },
  {
    id: "start",
    gradient: "from-indigo-50 to-white",
    accent: "bg-indigo-600",
    title: "Pronto para começar!",
    subtitle: "É grátis pra sempre. Faça upgrade quando quiser crescer.",
    preview: <StartPreview />,
  },
];

/* ─── Main component ─── */

interface OnboardingProps {
  onFinish: () => void;
}

export default function Onboarding({ onFinish }: OnboardingProps) {
  const [step, setStep]           = useState(0);
  const [slideClass, setSlideClass] = useState("onboarding-slide-right");
  const [isAnimating, setIsAnimating] = useState(false);

  // Touch swipe
  const touchStartX = useRef<number | null>(null);
  const contentKey  = useRef(0);

  const goTo = useCallback(
    (next: number, forward: boolean) => {
      if (isAnimating || next < 0 || next >= STEPS.length) return;
      setIsAnimating(true);
      contentKey.current += 1;
      setSlideClass(forward ? "onboarding-slide-right" : "onboarding-slide-left");
      setStep(next);
      setTimeout(() => setIsAnimating(false), 380);
    },
    [isAnimating]
  );

  const next = () => (step === STEPS.length - 1 ? onFinish() : goTo(step + 1, true));
  const prev = () => goTo(step - 1, false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-b ${current.gradient} flex flex-col transition-all duration-500`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-10 pb-2 shrink-0">
        {/* Back */}
        {step > 0 ? (
          <button
            onClick={prev}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/70 text-slate-500 cursor-pointer"
          >
            <i className="ri-arrow-left-s-line text-lg" />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > step)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === step
                  ? `w-6 h-2 ${current.accent}`
                  : "w-2 h-2 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Skip */}
        <button
          onClick={onFinish}
          className="text-slate-400 text-sm font-semibold hover:text-slate-600 transition-colors cursor-pointer whitespace-nowrap"
        >
          Pular
        </button>
      </div>

      {/* Animated content */}
      <div
        key={contentKey.current}
        className={`flex-1 flex flex-col items-center px-5 pt-4 pb-2 overflow-hidden ${slideClass}`}
      >
        {/* Preview illustration */}
        <div className="w-full max-w-sm mx-auto flex items-center justify-center"
          style={{ height: "clamp(220px, 42vh, 320px)" }}
        >
          {current.preview}
        </div>

        {/* Text */}
        <div className="w-full max-w-sm mx-auto text-center mt-4">
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-2">
            {current.title}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed px-2">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-10 pt-4 shrink-0 w-full max-w-sm mx-auto space-y-3">
        {/* Progress bar */}
        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${current.accent}`}
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <button
          onClick={next}
          className={`w-full py-4 ${current.accent} hover:opacity-90 text-white font-extrabold rounded-2xl transition-all duration-200 text-base cursor-pointer whitespace-nowrap shadow-sm`}
        >
          {isLast ? "Começar agora!" : "Próximo"}
        </button>

        {!isLast && (
          <button
            onClick={onFinish}
            className="w-full py-2 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            Já conheço o app
          </button>
        )}
      </div>
    </div>
  );
}
