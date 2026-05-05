import { useState } from "react";

const goToApp = () => {
  const target = window.top || window;
  target.location.href = `${window.location.origin}/app`;
};

const steps = [
  {
    number: "01",
    icon: "ri-add-circle-line",
    title: "Registre suas finanças",
    description:
      "Adicione suas receitas, despesas e dívidas em poucos segundos. Escolha a categoria, valor e data — simples assim, sem complicação.",
    highlights: ["Receitas", "Despesas", "Dívidas"],
    color: "from-emerald-500 to-emerald-600",
    light: "bg-emerald-50",
    tag: "text-emerald-600",
    border: "border-emerald-100",
    mockItems: [
      { icon: "ri-arrow-up-line", color: "text-emerald-500", bg: "bg-emerald-50", label: "Salário", value: "+ R$ 3.500" },
      { icon: "ri-arrow-down-line", color: "text-rose-500", bg: "bg-rose-50", label: "Aluguel", value: "- R$ 900" },
      { icon: "ri-bank-line", color: "text-amber-500", bg: "bg-amber-50", label: "Cartão", value: "- R$ 450" },
    ],
  },
  {
    number: "02",
    icon: "ri-pie-chart-2-line",
    title: "Veja o gráfico em tempo real",
    description:
      "Na hora que você adiciona qualquer transação, o emdia gera automaticamente um gráfico de pizza mostrando sua situação financeira do mês.",
    highlights: ["Gráfico automático", "Atualização instantânea", "Por categoria"],
    color: "from-teal-500 to-teal-600",
    light: "bg-teal-50",
    tag: "text-teal-600",
    border: "border-teal-100",
    mockItems: [
      { icon: "ri-checkbox-blank-circle-fill", color: "text-emerald-500", bg: "bg-transparent", label: "Receitas", value: "52%" },
      { icon: "ri-checkbox-blank-circle-fill", color: "text-rose-500", bg: "bg-transparent", label: "Despesas", value: "35%" },
      { icon: "ri-checkbox-blank-circle-fill", color: "text-amber-500", bg: "bg-transparent", label: "Dívidas", value: "13%" },
    ],
  },
  {
    number: "03",
    icon: "ri-line-chart-line",
    title: "Tome decisões inteligentes",
    description:
      "Com clareza sobre suas finanças, você consegue cortar gastos, planejar objetivos e finalmente ter controle real do seu dinheiro.",
    highlights: ["Histórico completo", "Exportar CSV", "Salvo na nuvem"],
    color: "from-emerald-500 to-emerald-600",
    light: "bg-emerald-50",
    tag: "text-emerald-600",
    border: "border-emerald-100",
    mockItems: [
      { icon: "ri-trophy-line", color: "text-amber-500", bg: "bg-amber-50", label: "Meta do mês", value: "78%" },
      { icon: "ri-save-line", color: "text-indigo-500", bg: "bg-indigo-50", label: "Economia", value: "R$ 640" },
      { icon: "ri-arrow-up-line", color: "text-emerald-500", bg: "bg-emerald-50", label: "vs. mês anterior", value: "+12%" },
    ],
  },
];

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const step = steps[activeStep];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full uppercase tracking-widest mb-4">
            Como funciona
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Do caos financeiro à clareza total
          </h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Em menos de 2 minutos você já tem uma visão completa das suas finanças. Sem planilha, sem complicação.
          </p>
        </div>

        {/* Main content — steps + preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Steps list */}
          <div className="flex flex-col gap-4">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`w-full text-left rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${
                  activeStep === i
                    ? `${s.light} ${s.border} shadow-sm`
                    : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Number badge */}
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 bg-gradient-to-br ${
                    activeStep === i ? s.color : "from-slate-100 to-slate-200"
                  } transition-all duration-300`}>
                    <span className={`text-xs font-extrabold ${activeStep === i ? "text-white" : "text-slate-400"}`}>
                      {s.number}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <i className={`${s.icon} text-base ${activeStep === i ? s.tag : "text-slate-400"}`} />
                      <h3 className={`font-bold text-sm ${activeStep === i ? "text-slate-900" : "text-slate-500"}`}>
                        {s.title}
                      </h3>
                    </div>

                    {activeStep === i && (
                      <div className="mt-2">
                        <p className="text-slate-500 text-sm leading-relaxed mb-3">
                          {s.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {s.highlights.map((h) => (
                            <span key={h} className={`text-xs px-2.5 py-1 rounded-full font-semibold ${s.light} ${s.tag}`}>
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {/* CTA */}
            <button
              onClick={goToApp}
              className="mt-2 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all duration-200 text-sm whitespace-nowrap cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="ri-rocket-line" />
              Experimentar grátis agora
            </button>
          </div>

          {/* Visual preview card */}
          <div className="relative flex items-center justify-center">
            {/* Glow background */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${step.color} opacity-5 blur-2xl scale-110`} />

            <div className={`relative w-full max-w-sm rounded-3xl border ${step.border} ${step.light} p-6 transition-all duration-500`}>
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br ${step.color}`}>
                    <i className={`${step.icon} text-white text-sm`} />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">{step.title}</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${step.light} ${step.tag} border ${step.border}`}>
                  Passo {step.number}
                </span>
              </div>

              {/* Mock content */}
              <div className="space-y-3 mb-5">
                {step.mockItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-white/80">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${item.bg}`}>
                        <i className={`${item.icon} ${item.color} text-sm`} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Progress bar decoration */}
              <div className="bg-white rounded-xl px-4 py-3 border border-white/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 font-medium">Progresso do mês</span>
                  <span className={`text-xs font-bold ${step.tag}`}>Bom!</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${step.color} transition-all duration-700`}
                    style={{ width: activeStep === 0 ? "45%" : activeStep === 1 ? "68%" : "78%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: "ri-timer-line", value: "2 min", label: "Para configurar o app", color: "text-emerald-600" },
            { icon: "ri-smartphone-line", value: "100%", label: "Funciona no celular", color: "text-emerald-600" },
            { icon: "ri-shield-check-line", value: "Grátis", label: "Para começar hoje", color: "text-amber-600" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-4 bg-slate-50 rounded-2xl px-6 py-5 border border-slate-100">
              <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-slate-100 shrink-0">
                <i className={`${stat.icon} ${stat.color} text-xl`} />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">{stat.value}</p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
